// 规则类型枚举
export enum RuleType {
  BINDING = 'binding', // 绑定规则
}

// 绑定规则
export interface BindingRule {
  id: string
  type: RuleType.BINDING
  name: string
  participantIds: string[] // 绑定的参与者 ID 列表
  description?: string
  isActive: boolean
}

// 联合类型，便于扩展
export type Rule = BindingRule

// 规则输入类型
export interface RuleInput {
  type: RuleType
  name: string
  participantIds: string[]
  description?: string
  isActive?: boolean
}
