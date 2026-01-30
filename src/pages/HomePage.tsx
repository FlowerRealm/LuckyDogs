import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLotteryStore, useParticipantStore, useRuleStore, useAudienceStore } from '@/store'
import { LotteryWheel } from '@/components/lottery/LotteryWheel'
import { ParticipantProbabilityDialog } from '@/components/participants/ParticipantProbabilityDialog'
import { normalizeAudienceConfig } from '@/types'

export const HomePage: React.FC = () => {
  // Store Hooks
  const {
    isDrawing, startDraw,
    endDraw, resetRound,
    revealedWinners,
  } = useLotteryStore()
  const { setParticipants, participants } = useParticipantStore()
  const { setRules } = useRuleStore()
  const { setConfig: setAudienceConfig } = useAudienceStore()

  // Local State
  const [drawCount, setDrawCount] = useState(1)
  const [drawCountInput, setDrawCountInput] = useState('1')
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // 初始化逻辑
  useEffect(() => {
    const initApp = async () => {
      try {
        if (!window.electronAPI) {
          setIsInitializing(false)
          return
        }

        // 1. 加载配置
        const config = await window.electronAPI.config.load()
        if (config.participants) {
          setParticipants(config.participants)
        }
        if (config.rules) {
          setRules(config.rules)
        }
        if (config.audience) {
          setAudienceConfig(normalizeAudienceConfig(config.audience))
        } else {
          setAudienceConfig(normalizeAudienceConfig(null))
        }

        // 2. 初始化引擎
        const initResult = await window.electronAPI.lottery.init({
          participants: config.participants || [],
          rules: config.rules || [],
          audienceIds: (config.audience?.members || []).map((m: any) => m.id).filter((id: any) => typeof id === 'string'),
        })
        console.log('[DEBUG] 引擎初始化结果:', initResult)
        console.log('[DEBUG] 参与者数量:', config.participants?.length || 0)
        if (!initResult.success) {
          setInitError(initResult.error || '引擎初始化失败')
        }
      } catch (error) {
        console.error("Failed to init:", error)
        setInitError(error instanceof Error ? error.message : '初始化失败')
      } finally {
        setIsInitializing(false)
      }
    }
    initApp()
  }, [])

  // 抽奖处理
  const handleDraw = async () => {
    if (isDrawing || participants.length === 0) return
    if (initError) return
    if (!window.electronAPI) return

    // 清除上一轮结果
    resetRound()

    startDraw(drawCount)
    try {
      // 重置引擎状态，确保全新抽奖
      await window.electronAPI.lottery.resetRound()

      // 这里的 delay 仅为了视觉效果，让用户感觉到"抽奖中"
      await new Promise(r => setTimeout(r, 600))

      const result = await window.electronAPI.lottery.drawMultiple(drawCount)
      console.log('[DEBUG] 抽奖结果:', result)

      // 添加空结果检查
      if (result.winners.length === 0) {
        console.warn('[DEBUG] 抽奖结果为空，可能引擎未初始化或无符合条件的参与者')
      }

      endDraw(result.winners)
    } catch (e) {
      console.error('[DEBUG] 抽奖出错:', e)
      // 错误处理逻辑...
      endDraw([])
    }
  }

  // 复制中奖者名单到剪贴板
  const handleCopyWinners = async () => {
    if (revealedWinners.length === 0) return
    const names = revealedWinners.map(w => w.participantName).join(' ')
    await navigator.clipboard.writeText(names)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isInitializing) {
    return <div className="h-screen flex items-center justify-center text-theme-primary">Loading...</div>
  }

  if (initError) {
    return (
      <div className="h-screen flex items-center justify-center bg-theme-bg p-8">
        <div className="max-w-xl w-full card-base p-6">
          <h2 className="text-lg font-bold text-theme-text-main">初始化失败</h2>
          <p className="mt-2 text-sm text-theme-text-sub">
            {initError}
          </p>
          <div className="mt-4 text-sm text-theme-text-sub">
            请检查 <span className="font-semibold text-theme-text-main">config/</span> 下的配置文件是否正确（尤其是规则是否引用了不存在的参与者/观众席成员）。
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-theme-bg overflow-hidden relative">

      {/* 1. Header (顶部栏) */}
      <header className="flex-none h-16 bg-white/80 backdrop-blur-md border-b border-theme-border flex items-center px-8 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center text-white font-bold">L</div>
          <h1 className="text-xl font-bold text-theme-text-main tracking-tight">Lucky Dogs</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <ParticipantProbabilityDialog />
        </div>
      </header>

      {/* 2. Main Content (抽奖区 - 自适应缩放) */}
      <main className="flex-1 overflow-hidden p-4">
        <div className="h-full">
          <LotteryWheel />
        </div>
      </main>

      {/* 3. Controls (底部控制栏) */}
      <footer className="flex-none bg-white border-t border-theme-border p-4 pb-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">

          {/* 左侧：数量输入 */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <span className="text-theme-text-sub font-medium">抽取</span>
            <input
              type="number"
              min="1"
              max={participants.length}
              value={drawCountInput}
              onChange={(e) => setDrawCountInput(e.target.value)}
              onBlur={(e) => {
                const val = parseInt(e.target.value) || 1
                const clamped = Math.min(Math.max(1, val), participants.length || 1)
                setDrawCount(clamped)
                setDrawCountInput(String(clamped))
              }}
              disabled={isDrawing}
              className="w-16 px-3 py-1.5 text-center font-semibold text-theme-text-main
                         bg-white border border-slate-200 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-theme-primary/30 focus:border-theme-primary
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-theme-text-sub font-medium">人</span>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex gap-3">
            {/* 抽奖按钮 */}
            <motion.button
              onClick={handleDraw}
              disabled={isDrawing}
              className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 ${
                isDrawing
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-theme-primary shadow-indigo-500/30'
              }`}
              whileHover={!isDrawing ? {
                scale: 1.05,
                boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.5)'
              } : {}}
              whileTap={!isDrawing ? { scale: 0.95 } : {}}
              animate={isDrawing ? {
                scale: [1, 1.02, 1],
                transition: { duration: 0.8, repeat: Infinity }
              } : {
                scale: 1
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <AnimatePresence mode="wait">
                {isDrawing ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <motion.span
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    抽奖中...
                  </motion.span>
                ) : (
                  <motion.span
                    key="ready"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    开始抽奖 ✨
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* 复制名单按钮 */}
            <button
               onClick={handleCopyWinners}
               disabled={revealedWinners.length === 0}
               className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${
                 revealedWinners.length === 0
                   ? 'text-slate-300 bg-slate-100 cursor-not-allowed'
                   : copied
                     ? 'text-green-600 bg-green-50 border border-green-200'
                     : 'text-slate-600 bg-slate-100 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200'
               }`}
               title={copied ? '已复制' : '复制中奖名单'}
            >
               {copied ? (
                 <>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   已复制
                 </>
               ) : (
                 <>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                   复制名单
                 </>
               )}
            </button>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default HomePage
