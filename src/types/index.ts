import { Participant, ParticipantInput } from './participant'
import { Rule, RuleInput, RuleType, BindingRule } from './rule'
import { Winner, LotteryRound, LotterySession, LotteryState } from './lottery'

// 应用配置
export interface AppConfig {
  version: string
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
  LotteryRound,
  LotterySession,
  LotteryState,
}

export { RuleType }
