import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLotteryStore } from '@/store'
import FlipCard from './FlipCard'

export const LotteryWheel: React.FC = () => {
  // 细粒度 store 订阅，减少不必要的重渲染
  const pendingWinners = useLotteryStore(state => state.pendingWinners)
  const revealedWinners = useLotteryStore(state => state.revealedWinners)
  const isDrawing = useLotteryStore(state => state.isDrawing)
  const revealAllWinners = useLotteryStore(state => state.revealAllWinners)

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // 是否应该翻转（统一控制所有卡片）
  const [shouldFlip, setShouldFlip] = useState(false)

  // 合并所有中奖者为一个列表
  const allWinners = useMemo(() => {
    return [...revealedWinners, ...pendingWinners]
  }, [revealedWinners, pendingWinners])

  const cardCount = allWinners.length + (isDrawing ? 1 : 0)

  // 当有新的 pendingWinners 时，触发同时翻转
  useEffect(() => {
    if (pendingWinners.length > 0) {
      // 计算入场动画总时长：基础 0.4s + 每张卡片错开 0.05s
      const entryDelay = 400 + pendingWinners.length * 50

      // 入场动画完成后，同时翻转所有卡片
      const flipTimer = setTimeout(() => {
        setShouldFlip(true)
      }, entryDelay)

      // 翻转动画完成后（0.6s），更新 store
      const revealTimer = setTimeout(() => {
        revealAllWinners()
      }, entryDelay + 600)

      return () => {
        clearTimeout(flipTimer)
        clearTimeout(revealTimer)
      }
    }
  }, [pendingWinners, revealAllWinners])

  // 重置状态：当 pendingWinners 和 revealedWinners 都为空时
  useEffect(() => {
    if (pendingWinners.length === 0 && revealedWinners.length === 0) {
      setShouldFlip(false)
    }
  }, [pendingWinners.length, revealedWinners.length])

  // 使用 Set 进行 O(1) 查询优化
  const revealedWinnerIds = useMemo(() =>
    new Set(revealedWinners.map(w => w.participantId)),
    [revealedWinners]
  )

  const pendingWinnerIds = useMemo(() =>
    new Set(pendingWinners.map(w => w.participantId)),
    [pendingWinners]
  )

  // 已揭晓的卡片始终显示正面 - O(1) 查询
  const isCardRevealed = useCallback((winnerId: string) => {
    return revealedWinnerIds.has(winnerId) ||
           (pendingWinnerIds.has(winnerId) && shouldFlip)
  }, [revealedWinnerIds, pendingWinnerIds, shouldFlip])

  // 监听容器尺寸变化（带防抖）
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let timeoutId: ReturnType<typeof setTimeout>
    const debouncedSetSize = (width: number, height: number) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setContainerSize({ width, height }), 100)
    }

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect()
      setContainerSize({ width, height })
    }

    updateSize()

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      debouncedSetSize(width, height)
    })
    observer.observe(container)
    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [])

  // 自适应网格算法
  const gridConfig = useMemo(() => {
    const { width, height } = containerSize
    const gap = 12

    if (width === 0 || height === 0 || cardCount === 0) {
      return { cols: 8, cardSize: 100 }
    }

    const aspectRatio = width / height
    const idealCols = Math.ceil(Math.sqrt(cardCount * aspectRatio))
    const cols = Math.max(1, Math.min(idealCols, cardCount))
    const rows = Math.ceil(cardCount / cols)

    const availableWidth = width - (cols - 1) * gap
    const availableHeight = height - (rows - 1) * gap

    const maxCardWidth = availableWidth / cols
    const maxCardHeight = availableHeight / rows
    const cardSize = Math.floor(Math.min(maxCardWidth, maxCardHeight))

    const finalSize = Math.max(60, Math.min(180, cardSize))

    return { cols, cardSize: finalSize, gap }
  }, [containerSize, cardCount])

  if (allWinners.length === 0 && !isDrawing) {
    return (
      <div
        ref={containerRef}
        className="h-full flex flex-col items-center justify-center text-theme-text-light p-10 border-2 border-dashed border-slate-200 rounded-3xl"
      >
        <div className="text-6xl mb-4 opacity-20">🎲</div>
        <p className="text-lg">准备就绪，点击下方按钮开始抽奖</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <div
        className="h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridConfig.cols}, ${gridConfig.cardSize}px)`,
          gap: `${gridConfig.gap || 12}px`,
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        <AnimatePresence mode="sync">
          {/* 渲染所有中奖者卡片 */}
          {allWinners.map((winner, index) => (
            <FlipCard
              key={winner.participantId}
              winner={winner}
              isRevealed={isCardRevealed(winner.participantId)}
              size={gridConfig.cardSize}
              index={index}
            />
          ))}
        </AnimatePresence>

        {/* 如果正在抽奖中（Loading态） */}
        {isDrawing && (
          <motion.div
            className="card-base flex items-center justify-center"
            style={{ width: gridConfig.cardSize, height: gridConfig.cardSize }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="w-8 h-8 border-4 border-theme-primary/30 border-t-theme-primary rounded-full animate-spin" />
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default LotteryWheel
