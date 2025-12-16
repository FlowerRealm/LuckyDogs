// 规则类型枚举
export enum RuleType {
  MUTUAL_EXCLUSION = 'mutual_exclusion', // 互斥规则
}

// 互斥规则
export interface MutualExclusionRule {
  id: string
  type: RuleType.MUTUAL_EXCLUSION
  name: string
  participantIds: string[] // 互斥的参与者 ID 列表
  description?: string
  isActive: boolean
}

// 联合类型，便于扩展
export type Rule = MutualExclusionRule

// 规则输入类型
export interface RuleInput {
  type: RuleType
  name: string
  participantIds: string[]
  description?: string
  isActive?: boolean
}
