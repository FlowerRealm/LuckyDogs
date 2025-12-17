import { Participant, ParticipantInput } from './participant'
import { Rule, RuleInput, RuleType, BindingRule } from './rule'
import { Winner, LotteryState } from './lottery'

// 应用配置
export interface AppConfig {
  participants: Participant[]
  rules: Rule[]
}

// 导出所有类型
export type {
  Participant,
  ParticipantInput,
  Rule,
  RuleInput,
  BindingRule,
  Winner,
  LotteryState,
}

export { RuleType }
