// 中奖者信息
export interface Winner {
  participantId: string
  participantName: string
  drawOrder: number // 在本轮中的抽取顺序
}

// 被排除记录
export interface ExcludedRecord {
  participantId: string
  participantName: string
  reason: string
  ruleId: string
  triggeredBy: string // 触发排除的中奖者 ID
}

// 抽奖轮次
export interface LotteryRound {
  roundNumber: number
  drawCount: number
  winners: Winner[]
  excludedByRule: ExcludedRecord[]
  timestamp: string
}

// 抽奖会话
export interface LotterySession {
  sessionId: string
  startTime: string
  endTime?: string
  rounds: LotteryRound[]
  totalParticipants: number
  totalWinners: number
}

// 抽奖状态
export interface LotteryState {
  isDrawing: boolean
  currentRound: number
  drawCount: number
  currentSession: LotterySession | null
  pendingWinners: Winner[]
}
