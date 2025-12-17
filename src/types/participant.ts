// 参与者类型
export interface Participant {
  id: string
  name: string
  weight: number // 权重 1-100，默认 1
  wonAt?: string
  wonInRound?: number
}

// 参与者输入类型
export interface ParticipantInput {
  name: string
  weight?: number
}
