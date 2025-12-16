import { Participant, ParticipantInput } from './participant'
import { Rule, RuleInput, RuleType, MutualExclusionRule } from './rule'
import { Winner, ExcludedRecord, LotteryRound, LotterySession, LotteryState } from './lottery'

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
  MutualExclusionRule,
  Winner,
  ExcludedRecord,
  LotteryRound,
  LotterySession,
  LotteryState,
}

export { RuleType }
