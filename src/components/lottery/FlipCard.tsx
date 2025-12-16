import { motion } from 'framer-motion'
import { Winner } from '@/types'

interface FlipCardProps {
  winner: Winner | null
  isFlipped: boolean
  onFlip: () => void
  index: number
}

export function FlipCard({
  winner,
  isFlipped,
  onFlip,
  index,
}: FlipCardProps) {
  return (
    <motion.div
      className="flip-card-container relative w-40 h-52 cursor-pointer"
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
      style={{ perspective: '1000px' }}
      onClick={() => !isFlipped && winner && onFlip()}
    >
      <motion.div
        className="flip-card relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 卡片正面 (问号) */}
        <div
          className="flip-card-front absolute inset-0 rounded-2xl
                     bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800
                     flex flex-col items-center justify-center
                     shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50
                     transition-shadow duration-300 border border-purple-400/30"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <motion.span
            className="text-7xl text-white font-bold select-none"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            ?
          </motion.span>
          <motion.div
            className="absolute inset-0 rounded-2xl bg-white/10"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <div className="absolute bottom-3 text-purple-200/60 text-sm">
            点击揭晓
          </div>
        </div>

        {/* 卡片背面 (中奖信息) */}
        <div
          className="flip-card-back absolute inset-0 rounded-2xl
                     bg-gradient-to-br from-amber-400 via-orange-500 to-red-500
                     flex flex-col items-center justify-center p-4
                     shadow-lg shadow-orange-500/30 border border-amber-300/50"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {winner && (
            <>
              <motion.div
                className="text-4xl mb-2"
                initial={{ scale: 0 }}
                animate={isFlipped ? { scale: [0, 1.3, 1] } : { scale: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                🎉
              </motion.div>
              <motion.div
                className="text-2xl font-bold text-white text-center break-all"
                initial={{ opacity: 0, y: 10 }}
                animate={isFlipped ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                {winner.participantName}
              </motion.div>
              <motion.div
                className="absolute top-2 right-2 text-lg"
                initial={{ scale: 0 }}
                animate={isFlipped ? { scale: 1, rotate: [0, 20, -20, 0] } : { scale: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                ✨
              </motion.div>
              <motion.div
                className="absolute top-2 left-2 text-lg"
                initial={{ scale: 0 }}
                animate={isFlipped ? { scale: 1, rotate: [0, -20, 20, 0] } : { scale: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                ✨
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
