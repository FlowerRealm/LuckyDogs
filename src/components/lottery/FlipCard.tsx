import React from 'react'
import { Winner } from '@/types'

interface FlipCardProps {
  winner?: Winner
  isRevealed: boolean
  size?: number
}

export const FlipCard: React.FC<FlipCardProps> = ({
  winner,
  isRevealed,
  size = 100
}) => {
  const sizeStyle = { width: size, height: size }

  // 根据卡片尺寸动态调整字体
  const fontSize = size < 80 ? 'text-sm' : size < 120 ? 'text-base' : 'text-xl'
  const questionSize = size < 80 ? 'text-2xl' : size < 120 ? 'text-3xl' : 'text-4xl'

  return (
    <div
      className="flip-card-container"
      style={sizeStyle}
    >
      <div className={`flip-card ${isRevealed ? 'flipped' : ''}`}>
        {/* 背面 - 问号卡片 */}
        <div className="flip-card-face flip-card-back">
          <div className="card-base w-full h-full flex items-center justify-center">
            <div className={`${questionSize} font-bold text-theme-primary/30 select-none`}>
              ?
            </div>
          </div>
        </div>

        {/* 正面 - 中奖者信息 */}
        <div className="flip-card-face flip-card-front">
          <div
            className="card-base w-full h-full flex items-center justify-center p-2
                       border-b-4 border-b-theme-success"
          >
            <h3 className={`${fontSize} font-bold text-theme-text-main text-center truncate px-1`}>
              {winner?.participantName || '未知'}
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlipCard
