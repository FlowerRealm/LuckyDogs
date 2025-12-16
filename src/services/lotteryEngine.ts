import { Participant, Rule, RuleType, Winner, ExcludedRecord } from '@/types'

export interface DrawResult {
  winner: Winner | null
  excluded: ExcludedRecord[]
}

export interface MultiDrawResult {
  winners: Winner[]
  allExcluded: ExcludedRecord[]
}

export interface LotteryStats {
  totalParticipants: number
  eligibleCount: number
  winnersCount: number
  excludedCount: number
}

/**
 * 抽奖引擎
 * 实现加权随机抽取和互斥规则
 */
export class LotteryEngine {
  private participants: Participant[]
  private rules: Rule[]
  private currentRoundWinners: Set<string> = new Set()
  private excludedInRound: Map<string, ExcludedRecord> = new Map()

  constructor(participants: Participant[], rules: Rule[]) {
    this.participants = participants
    this.rules = rules.filter((r) => r.isActive)
  }

  /**
   * 获取可参与抽奖的候选人
   * 排除：已中奖者、本轮已抽中者、因规则被排除者
   */
  private getEligibleCandidates(): Participant[] {
    return this.participants.filter(
      (p) =>
        p.wonAt === undefined &&
        !this.currentRoundWinners.has(p.id) &&
        !this.excludedInRound.has(p.id)
    )
  }

  /**
   * 加权随机选择算法
   * 使用累积权重法，时间复杂度 O(n)
   *
   * 概率公式：P(participant_i) = weight_i / Σweight
   */
  private weightedRandomSelect(candidates: Participant[]): Participant | null {
    if (candidates.length === 0) return null

    // 计算总权重
    const totalWeight = candidates.reduce((sum, p) => sum + p.weight, 0)

    // 生成随机数 [0, totalWeight)
    const random = Math.random() * totalWeight

    // 累积权重查找
    let cumulative = 0
    for (const candidate of candidates) {
      cumulative += candidate.weight
      if (random < cumulative) {
        return candidate
      }
    }

    // 兜底返回最后一个 (处理浮点数精度问题)
    return candidates[candidates.length - 1]
  }

  /**
   * 应用互斥规则
   * 当某人中奖后，将其互斥名单中的人加入排除列表
   */
  private applyMutualExclusionRules(winnerId: string): ExcludedRecord[] {
    const winner = this.participants.find((p) => p.id === winnerId)
    if (!winner) return []

    const newExcluded: ExcludedRecord[] = []

    for (const rule of this.rules) {
      if (rule.type !== RuleType.MUTUAL_EXCLUSION) continue

      // 检查中奖者是否在此规则的参与者列表中
      if (rule.participantIds.includes(winnerId)) {
        // 将同组其他人加入排除列表
        for (const participantId of rule.participantIds) {
          if (participantId !== winnerId && !this.excludedInRound.has(participantId)) {
            const excluded = this.participants.find((p) => p.id === participantId)
            if (excluded && excluded.wonAt === undefined && !this.currentRoundWinners.has(participantId)) {
              const record: ExcludedRecord = {
                participantId,
                participantName: excluded.name,
                reason: `与 ${winner.name} 互斥 (规则: ${rule.name})`,
                ruleId: rule.id,
                triggeredBy: winnerId,
              }
              this.excludedInRound.set(participantId, record)
              newExcluded.push(record)
            }
          }
        }
      }
    }

    return newExcluded
  }

  /**
   * 执行单次抽奖
   */
  public drawOne(): DrawResult {
    const candidates = this.getEligibleCandidates()
    const selected = this.weightedRandomSelect(candidates)

    if (!selected) {
      return { winner: null, excluded: [] }
    }

    // 记录中奖者
    this.currentRoundWinners.add(selected.id)

    // 应用互斥规则
    const excluded = this.applyMutualExclusionRules(selected.id)

    const winner: Winner = {
      participantId: selected.id,
      participantName: selected.name,
      drawOrder: this.currentRoundWinners.size,
    }

    return { winner, excluded }
  }

  /**
   * 执行多人抽奖
   */
  public drawMultiple(count: number): MultiDrawResult {
    const winners: Winner[] = []
    const allExcluded: ExcludedRecord[] = []

    for (let i = 0; i < count; i++) {
      const result = this.drawOne()
      if (result.winner) {
        winners.push(result.winner)
        allExcluded.push(...result.excluded)
      } else {
        // 没有更多候选人了
        break
      }
    }

    return { winners, allExcluded }
  }

  /**
   * 重置轮次状态 (下一轮前调用)
   */
  public resetRound(): void {
    this.currentRoundWinners.clear()
    this.excludedInRound.clear()
  }

  /**
   * 获取当前轮次的统计信息
   */
  public getStats(): LotteryStats {
    return {
      totalParticipants: this.participants.length,
      eligibleCount: this.getEligibleCandidates().length,
      winnersCount: this.currentRoundWinners.size,
      excludedCount: this.excludedInRound.size,
    }
  }

  /**
   * 获取本轮被排除的人
   */
  public getExcludedRecords(): ExcludedRecord[] {
    return Array.from(this.excludedInRound.values())
  }

  /**
   * 获取本轮中奖者 ID 列表
   */
  public getCurrentWinnerIds(): string[] {
    return Array.from(this.currentRoundWinners)
  }
}

/**
 * 创建抽奖引擎实例
 */
export function createLotteryEngine(
  participants: Participant[],
  rules: Rule[]
): LotteryEngine {
  return new LotteryEngine(participants, rules)
}
