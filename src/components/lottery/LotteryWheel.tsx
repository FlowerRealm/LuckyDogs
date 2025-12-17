import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useLotteryStore } from '@/store'
import FlipCard from './FlipCard'
import { Winner } from '@/types'

export const LotteryWheel: React.FC = () => {
  const {
    pendingWinners,
    revealedWinners,
    isDrawing,
    revealWinner
  } = useLotteryStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // 本地跟踪哪些卡片已翻转（用于动画）
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set())

  // 使用 ref 存储翻转队列，避免闭包问题
  const flipQueueRef = useRef<Winner[]>([])
  const isFlippingRef = useRef(false)
  const revealWinnerRef = useRef(revealWinner)
  revealWinnerRef.current = revealWinner

  // 合并所有中奖者为一个列表
  const allWinners = useMemo(() => {
    return [...revealedWinners, ...pendingWinners]
  }, [revealedWinners, pendingWinners])

  const cardCount = allWinners.length + (isDrawing ? 1 : 0)

  // 翻转下一张卡片的函数
  const flipNext = () => {
    if (flipQueueRef.current.length === 0) {
      isFlippingRef.current = false
      return
    }

    const winner = flipQueueRef.current[0]
    console.log('[FlipCard] 翻转卡片:', winner.participantName)

    // 触发翻转动画
    setFlippedIds(prev => new Set([...prev, winner.participantId]))

    // 动画完成后处理
    setTimeout(() => {
      // 更新 store
      revealWinnerRef.current(winner)
      // 从队列中移除
      flipQueueRef.current = flipQueueRef.current.slice(1)
      // 继续翻下一张
      setTimeout(flipNext, 15)
    }, 40)
  }

  // 当有新的 pendingWinners 时，启动翻转
  useEffect(() => {
    if (pendingWinners.length > 0 && !isFlippingRef.current) {
      console.log('[FlipCard] 检测到新的 pendingWinners:', pendingWinners.length)
      flipQueueRef.current = [...pendingWinners]
      isFlippingRef.current = true

      // 延迟开始，让卡片先显示出来
      setTimeout(flipNext, 25)
    }
  }, [pendingWinners])

  // 同步已揭晓的状态（用于页面刷新等场景）
  useEffect(() => {
    const revealedIds = new Set(revealedWinners.map(w => w.participantId))
    setFlippedIds(prev => {
      const newSet = new Set(prev)
      revealedIds.forEach(id => newSet.add(id))
      return newSet
    })
  }, [revealedWinners])

  // 重置状态：当 pendingWinners 和 revealedWinners 都为空时，清空本地状态
  useEffect(() => {
    if (pendingWinners.length === 0 && revealedWinners.length === 0) {
      setFlippedIds(new Set())
      flipQueueRef.current = []
      isFlippingRef.current = false
    }
  }, [pendingWinners.length, revealedWinners.length])

  // 监听容器尺寸变化
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect()
      setContainerSize({ width, height })
    }

    updateSize()

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setContainerSize({ width, height })
    })
    observer.observe(container)
    return () => observer.disconnect()
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
        {/* 渲染所有中奖者卡片 */}
        {allWinners.map((winner) => {
          const isFlipped = flippedIds.has(winner.participantId)

          return (
            <FlipCard
              key={winner.participantId}
              winner={winner}
              isRevealed={isFlipped}
              size={gridConfig.cardSize}
            />
          )
        })}

        {/* 如果正在抽奖中（Loading态） */}
        {isDrawing && (
          <div
            className="card-base animate-pulse flex items-center justify-center"
            style={{ width: gridConfig.cardSize, height: gridConfig.cardSize }}
          >
            <div className="w-8 h-8 border-4 border-theme-primary/30 border-t-theme-primary rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LotteryWheel
