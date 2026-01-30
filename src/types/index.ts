import { Participant, ParticipantInput } from './participant'
import { Rule, RuleInput, RuleType, BindingRule } from './rule'
import { Winner, LotteryState } from './lottery'
import { AudienceConfig, AudienceMember, AudienceTrigger } from './audience'

// 应用配置
export interface AppConfig {
  participants: Participant[]
  rules: Rule[]
  audience?: AudienceConfig
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
  AudienceConfig,
  AudienceMember,
  AudienceTrigger,
}

export { RuleType }
export { normalizeAudienceConfig, isAudienceTriggered } from './audience'
