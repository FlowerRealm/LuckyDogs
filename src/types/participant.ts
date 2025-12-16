// 参与者类型
export interface Participant {
  id: string
  name: string
  weight: number // 权重 1-100，默认 1
  avatar?: string
  wonAt?: string
  wonInRound?: number
  metadata?: Record<string, any>
}

// 参与者输入类型
export interface ParticipantInput {
  name: string
  weight?: number
  avatar?: string
  metadata?: Record<string, any>
}
