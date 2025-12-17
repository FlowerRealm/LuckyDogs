import React, { useEffect, useState } from 'react'
import { useLotteryStore, useParticipantStore, useRuleStore } from '@/store'
import { LotteryWheel } from '@/components/lottery/LotteryWheel'

export const HomePage: React.FC = () => {
  // Store Hooks
  const {
    isDrawing, startSession, startDraw,
    endDraw, resetRound,
    revealedWinners
  } = useLotteryStore()
  const { setParticipants, participants } = useParticipantStore()
  const { setRules } = useRuleStore()

  // Local State
  const [drawCount, setDrawCount] = useState(1)
  const [drawCountInput, setDrawCountInput] = useState('1')
  const [isInitializing, setIsInitializing] = useState(true)
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

        // 2. 初始化引擎
        const initResult = await window.electronAPI.lottery.init({
          participants: config.participants || [],
          rules: config.rules || []
        })
        console.log('[DEBUG] 引擎初始化结果:', initResult)
        console.log('[DEBUG] 参与者数量:', config.participants?.length || 0)

        // 3. 开始新会话（如果还没开始）
        startSession((config.participants || []).length)
      } catch (error) {
        console.error("Failed to init:", error)
      } finally {
        setIsInitializing(false)
      }
    }
    initApp()
  }, [])

  // 抽奖处理
  const handleDraw = async () => {
    if (isDrawing || participants.length === 0) return
    if (!window.electronAPI) return

    startDraw()
    try {
      // ★ 每次抽奖前自动重置引擎状态，确保全新抽奖
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

  // 完整重置本轮（包括引擎状态）
  const handleResetRound = async () => {
    // 1. 重置前端 UI 状态
    resetRound()

    // 2. 重置引擎状态
    if (window.electronAPI) {
      await window.electronAPI.lottery.resetRound()
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

  return (
    <div className="flex flex-col h-screen bg-theme-bg overflow-hidden relative">

      {/* 1. Header (顶部栏) */}
      <header className="flex-none h-16 bg-white/80 backdrop-blur-md border-b border-theme-border flex items-center justify-between px-8 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center text-white font-bold">L</div>
          <h1 className="text-xl font-bold text-theme-text-main tracking-tight">Lucky Draw</h1>
        </div>

        {/* 简单统计 */}
        <div className="text-sm font-medium text-theme-text-sub flex gap-4">
          <span>总人数: <strong className="text-theme-text-main">{participants.length}</strong></span>
          <span>已中奖: <strong className="text-theme-primary">{useParticipantStore.getState().getWinners().length}</strong></span>
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
            <button
              onClick={handleDraw}
              disabled={isDrawing}
              className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform flex items-center gap-2 ${
                isDrawing
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-theme-primary hover:bg-indigo-600 shadow-indigo-500/30 hover:scale-105 active:scale-95'
              }`}
            >
              {isDrawing ? '抽奖中...' : '开始抽奖 ✨'}
            </button>

            {/* 重置按钮 (仅测试用，或放在设置里) */}
            <button
               onClick={handleResetRound}
               className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
               title="重置本轮"
            >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>

            {/* 复制名单按钮 */}
            <button
               onClick={handleCopyWinners}
               disabled={revealedWinners.length === 0}
               className={`p-3 rounded-xl transition-colors ${
                 revealedWinners.length === 0
                   ? 'text-slate-300 cursor-not-allowed'
                   : copied
                     ? 'text-green-500 bg-green-50'
                     : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50'
               }`}
               title={copied ? '已复制' : '复制中奖名单'}
            >
               {copied ? (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               ) : (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
               )}
            </button>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default HomePage
