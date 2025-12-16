import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, Users, Trophy } from 'lucide-react'
import { FlipCard } from './FlipCard'
import { createLotteryEngine } from '@/services/lotteryEngine'
import { useParticipantStore, useRuleStore, useLotteryStore } from '@/store'
import { Winner } from '@/types'

export function LotteryWheel() {
  const participants = useParticipantStore((s) => s.participants)
  const markAsWinner = useParticipantStore((s) => s.markAsWinner)
  const resetWinners = useParticipantStore((s) => s.resetWinners)
  const rules = useRuleStore((s) => s.rules)

  const {
    isDrawing,
    currentRound,
    drawCount,
    setDrawCount,
    startDraw,
    endDraw,
    startSession,
  } = useLotteryStore()

  const [winners, setWinners] = useState<Winner[]>([])
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())

  // 计算可用人数
  const eligibleCount = participants.filter((p) => p.wonAt === undefined).length
  const totalWinners = participants.filter((p) => p.wonAt !== undefined).length

  // 初始化会话
  useEffect(() => {
    if (participants.length > 0) {
      startSession(participants.length)
    }
  }, [])

  // 执行抽奖
  const handleDraw = useCallback(() => {
    if (eligibleCount === 0) return

    startDraw()
    setWinners([])
    setFlippedCards(new Set())

    // 创建抽奖引擎
    const engine = createLotteryEngine(participants, rules)
    const actualDrawCount = Math.min(drawCount, eligibleCount)
    const result = engine.drawMultiple(actualDrawCount)

    // 标记中奖者
    result.winners.forEach((winner) => {
      markAsWinner(winner.participantId, currentRound + 1)
    })

    // 更新状态
    setWinners(result.winners)
    endDraw(result.winners, result.allExcluded)
  }, [participants, rules, drawCount, eligibleCount, currentRound, startDraw, endDraw, markAsWinner])

  // 翻转卡片
  const handleFlip = useCallback((index: number) => {
    setFlippedCards((prev) => new Set([...prev, index]))
  }, [])

  // 一键翻转所有
  const handleFlipAll = useCallback(() => {
    setFlippedCards(new Set(winners.map((_, i) => i)))
  }, [winners])

  // 重置本轮
  const handleReset = useCallback(() => {
    setWinners([])
    setFlippedCards(new Set())
  }, [])

  // 重置所有（重新开始）
  const handleResetAll = useCallback(() => {
    resetWinners()
    setWinners([])
    setFlippedCards(new Set())
    startSession(participants.length)
  }, [resetWinners, participants.length, startSession])

  return (
    <div className="flex flex-col items-center gap-8 p-6">
      {/* 统计信息 */}
      <div className="flex gap-6 text-white/80">
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
          <Users className="w-5 h-5" />
          <span>总人数: {participants.length}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
          <span className="text-green-400">可抽: {eligibleCount}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>已中奖: {totalWinners}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
          <span>第 {currentRound} 轮</span>
        </div>
      </div>

      {/* 卡片展示区 */}
      <div className="min-h-[280px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {winners.length > 0 ? (
            <motion.div
              key="cards"
              className="flex flex-wrap justify-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {winners.map((winner, index) => (
                <FlipCard
                  key={winner.participantId}
                  winner={winner}
                  isFlipped={flippedCards.has(index)}
                  onFlip={() => handleFlip(index)}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className="text-white/40 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {eligibleCount > 0 ? '点击下方按钮开始抽奖' : '没有可抽奖的参与者'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 控制区 */}
      <div className="flex items-center gap-4">
        {/* 抽取人数输入 */}
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
          <span className="text-white/80">抽取</span>
          <input
            type="number"
            min="1"
            value={drawCount}
            onChange={(e) => setDrawCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="bg-white/10 text-white text-center w-16 px-2 py-1 rounded
                       border border-white/20 focus:border-purple-500 outline-none"
          />
          <span className="text-white/80">人</span>
        </div>

        {/* 开始抽奖按钮 */}
        <motion.button
          onClick={handleDraw}
          disabled={eligibleCount === 0 || isDrawing}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600
                     hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600
                     text-white px-8 py-3 rounded-lg font-bold text-lg
                     shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50
                     transition-all disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play className="w-5 h-5" />
          开始抽奖
        </motion.button>

        {/* 一键翻转 */}
        {winners.length > 0 && flippedCards.size < winners.length && (
          <motion.button
            onClick={handleFlipAll}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                       text-white px-4 py-3 rounded-lg transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            全部揭晓
          </motion.button>
        )}

        {/* 重置按钮 */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20
                     text-white px-4 py-3 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          清空
        </button>
      </div>

      {/* 重新开始 */}
      {totalWinners > 0 && (
        <button
          onClick={handleResetAll}
          className="text-white/50 hover:text-white/80 text-sm underline transition-colors"
        >
          重置所有中奖者，重新开始
        </button>
      )}

      {/* 本轮中奖名单 */}
      {winners.length > 0 && flippedCards.size === winners.length && (
        <motion.div
          className="bg-white/5 rounded-xl p-4 w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-white/80 text-sm mb-3">本轮中奖名单</h3>
          <div className="flex flex-wrap gap-3">
            {winners.map((winner) => (
              <div
                key={winner.participantId}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20
                           px-3 py-2 rounded-lg border border-amber-500/30"
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">{winner.participantName}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
