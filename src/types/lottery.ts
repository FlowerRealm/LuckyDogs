// 中奖者信息
export interface Winner {
  participantId: string
  participantName: string
  drawOrder: number // 在本轮中的抽取顺序
}

// 抽奖状态
export interface LotteryState {
  isDrawing: boolean
  drawCount: number
  pendingWinners: Winner[]
}
