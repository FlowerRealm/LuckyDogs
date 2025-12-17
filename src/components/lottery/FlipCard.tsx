import React from 'react'
import { motion, Variants } from 'framer-motion'
import { Winner } from '@/types'

interface FlipCardProps {
  winner?: Winner
  isRevealed: boolean
  size?: number
  index?: number // 用于入场动画错开
}

// 入场动画变体
const cardEntryVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: index * 0.05, // 每张卡片错开 50ms 入场
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
    },
  }),
}

// 翻转动画变体
const flipVariants: Variants = {
  front: {
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1], // easeInOutCubic
    },
  },
  back: {
    rotateY: 180,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export const FlipCard: React.FC<FlipCardProps> = ({
  winner,
  isRevealed,
  size = 100,
  index = 0,
}) => {
  // 根据卡片尺寸动态调整字体
  const fontSize = size < 80 ? 'text-sm' : size < 120 ? 'text-base' : 'text-xl'
  const questionSize = size < 80 ? 'text-2xl' : size < 120 ? 'text-3xl' : 'text-4xl'

  return (
    <motion.div
      className="flip-card-container"
      style={{ width: size, height: size, perspective: 1000 }}
      variants={cardEntryVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        variants={flipVariants}
        initial="front"
        animate={isRevealed ? 'back' : 'front'}
      >
        {/* 背面 - 问号卡片 */}
        <div
          className="absolute w-full h-full"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="card-base w-full h-full flex items-center justify-center">
            <div className={`${questionSize} font-bold text-theme-primary/30 select-none`}>
              ?
            </div>
          </div>
        </div>

        {/* 正面 - 中奖者信息 */}
        <div
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <motion.div
            className="card-base w-full h-full flex items-center justify-center p-2 border-b-4 border-b-theme-success"
            initial={{ scale: 1 }}
            animate={isRevealed ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h3 className={`${fontSize} font-bold text-theme-text-main text-center truncate px-1`}>
              {winner?.participantName || '未知'}
            </h3>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default FlipCard
