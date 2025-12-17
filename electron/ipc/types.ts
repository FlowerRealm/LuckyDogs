/**
 * IPC 数据类型定义
 * 用于 Electron 主进程和渲染进程之间的通信
 */

// ============ 基础类型 ============

export interface Participant {
  id: string
  name: string
  weight: number
  avatar?: string
  wonAt?: string
  wonInRound?: number
  metadata?: Record<string, any>
}

export enum RuleType {
  BINDING = 'binding',
}

export interface Rule {
  id: string
  type: RuleType
  name: string
  participantIds: string[]
  description?: string
  isActive: boolean
}

export interface Winner {
  participantId: string
  participantName: string
  drawOrder: number
}

// ============ IPC 请求/响应类型 ============

export interface EngineInitData {
  participants: Participant[]
  rules: Rule[]
}

export interface EngineInitResult {
  success: boolean
  stats: LotteryStats
  error?: string
}

export interface DrawResult {
  winner: Winner | null
  boundWinners: Winner[] // 绑定规则触发的自动中奖者
}

export interface MultiDrawResult {
  winners: Winner[]
}

export interface LotteryStats {
  totalParticipants: number
  eligibleCount: number
  winnersCount: number
}

// ============ Lottery API 接口 ============

export interface LotteryAPI {
  init: (data: EngineInitData) => Promise<EngineInitResult>
  destroy: () => Promise<void>
  drawOne: () => Promise<DrawResult>
  drawMultiple: (count: number) => Promise<MultiDrawResult>
  resetRound: () => Promise<void>
  getStats: () => Promise<LotteryStats>
  getWinners: () => Promise<string[]>
}
