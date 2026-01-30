/**
 * 抽奖引擎管理器
 * 单例模式，管理抽奖引擎实例和状态
 */

import {
  Participant,
  Rule,
  RuleType,
  Winner,
  MultiDrawResult,
  LotteryStats,
  EngineInitData,
  EngineInitResult,
} from './types'

/**
 * 抽奖引擎
 * 实现加权随机抽取和绑定规则
 */
class LotteryEngine {
  private participants: Participant[]
  private rules: Rule[]
  private currentRoundWinners: Set<string> = new Set()

  constructor(participants: Participant[], rules: Rule[]) {
    this.participants = participants
    this.rules = rules.filter((r) => r.isActive)
  }

  /**
   * 获取可参与抽奖的候选人
   * 排除：本轮已抽中者
   */
  private getEligibleCandidates(): Participant[] {
    return this.participants.filter(
      (p) => !this.currentRoundWinners.has(p.id)
    )
  }

  /**
   * 加权随机选择算法
   * 使用累积权重法，时间复杂度 O(n)
   */
  private weightedRandomSelect(candidates: Participant[]): Participant | null {
    if (candidates.length === 0) return null

    const totalWeight = candidates.reduce((sum, p) => sum + p.weight, 0)
    const random = Math.random() * totalWeight

    let cumulative = 0
    for (const candidate of candidates) {
      cumulative += candidate.weight
      if (random < cumulative) {
        return candidate
      }
    }

    return candidates[candidates.length - 1]
  }

  /**
   * 计算某人所在绑定组的总人数（包括自己）
   * 用于在抽奖前预判抽中此人后会产生多少中奖者
   */
  private getBindingGroupSize(participantId: string): number {
    const visited = new Set<string>([participantId])
    const queue = [participantId]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      for (const rule of this.rules) {
        if (rule.type !== RuleType.BINDING) continue
        if (!rule.participantIds.includes(currentId)) continue

        for (const memberId of rule.participantIds) {
          if (!visited.has(memberId) && !this.currentRoundWinners.has(memberId)) {
            visited.add(memberId)
            queue.push(memberId)
          }
        }
      }
    }
    return visited.size
  }

  /**
   * 应用绑定规则 - 当有人中奖时，绑定组内其他人自动中奖
   * 支持递归触发：如果 A-B 绑定，B-C 绑定，A 中奖则 B、C 都中奖
   */
  private applyBindingRules(winnerId: string): Winner[] {
    const boundWinners: Winner[] = []
    const processedWinners = new Set<string>([winnerId])
    const winnersToProcess = [winnerId]

    while (winnersToProcess.length > 0) {
      const currentWinnerId = winnersToProcess.shift()!

      for (const rule of this.rules) {
        if (rule.type !== RuleType.BINDING) continue
        if (!rule.participantIds.includes(currentWinnerId)) continue

        // 将绑定组中其他人也设为中奖者
        for (const participantId of rule.participantIds) {
          if (participantId === currentWinnerId) continue
          if (this.currentRoundWinners.has(participantId)) continue
          if (processedWinners.has(participantId)) continue

          const participant = this.participants.find((p) => p.id === participantId)
          if (participant) {
            this.currentRoundWinners.add(participantId)
            processedWinners.add(participantId)
            winnersToProcess.push(participantId) // 递归触发

            boundWinners.push({
              participantId,
              participantName: participant.name,
              drawOrder: this.currentRoundWinners.size,
            })
          }
        }
      }
    }

    return boundWinners
  }

  /**
   * 执行多人抽奖
   */
  public drawMultiple(count: number): MultiDrawResult {
    const winnerGroups: Winner[][] = []
    let winnersCount = 0

    while (winnersCount < count) {
      const candidates = this.getEligibleCandidates()
      if (candidates.length === 0) break

      // 筛选出绑定组大小 <= 剩余名额的候选人
      const remaining = count - winnersCount
      const validCandidates = candidates.filter(
        (c) => this.getBindingGroupSize(c.id) <= remaining
      )

      if (validCandidates.length === 0) {
        // 没有符合条件的候选人，提前结束
        break
      }

      // 从符合条件的候选人中加权随机选择
      const selected = this.weightedRandomSelect(validCandidates)
      if (!selected) break

      // 标记中奖并应用绑定规则
      this.currentRoundWinners.add(selected.id)
      const boundWinners = this.applyBindingRules(selected.id)

      const group: Winner[] = [
        {
          participantId: selected.id,
          participantName: selected.name,
          drawOrder: 0,
        },
        ...boundWinners.map((winner) => ({
          ...winner,
          drawOrder: 0,
        })),
      ]
      winnerGroups.push(group)
      winnersCount += group.length
    }

    if (winnerGroups.length > 1) {
      this.shuffleGroupsInPlace(winnerGroups)
    }

    const winners = winnerGroups.flat()
    this.assignDrawOrder(winners)

    return { winners }
  }

  private shuffleGroupsInPlace(groups: Winner[][]): void {
    for (let i = groups.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      if (i === j) continue
      const temp = groups[i]
      groups[i] = groups[j]
      groups[j] = temp
    }
  }

  private assignDrawOrder(winners: Winner[]): void {
    for (let i = 0; i < winners.length; i++) {
      winners[i].drawOrder = i + 1
    }
  }

  /**
   * 重置轮次状态
   */
  public resetRound(): void {
    this.currentRoundWinners.clear()
  }

  /**
   * 获取统计信息
   */
  public getStats(): LotteryStats {
    return {
      totalParticipants: this.participants.length,
      eligibleCount: this.getEligibleCandidates().length,
      winnersCount: this.currentRoundWinners.size,
    }
  }

  /**
   * 获取本轮中奖者 ID 列表
   */
  public getCurrentWinnerIds(): string[] {
    return Array.from(this.currentRoundWinners)
  }
}

/**
 * 抽奖引擎管理器（单例）
 */
export class LotteryEngineManager {
  private static instance: LotteryEngineManager
  private engine: LotteryEngine | null = null

  private constructor() {}

  public static getInstance(): LotteryEngineManager {
    if (!LotteryEngineManager.instance) {
      LotteryEngineManager.instance = new LotteryEngineManager()
    }
    return LotteryEngineManager.instance
  }

  /**
   * 初始化抽奖引擎
   */
  public initEngine(data: EngineInitData): EngineInitResult {
    try {
      console.log('[LotteryManager] 初始化引擎，参与者数量:', data.participants.length)
      console.log('[LotteryManager] rules 类型:', typeof data.rules, Array.isArray(data.rules), data.rules)

      // 确保 rules 是数组
      const participants = Array.isArray(data.participants) ? data.participants : []
      const rules = Array.isArray(data.rules) ? data.rules : []
      const audienceIds = Array.isArray(data.audienceIds)
        ? data.audienceIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
        : []

      const participantIdSet = new Set(participants.map((p) => p.id))
      const audienceIdSet = new Set(audienceIds)

      for (const id of audienceIdSet) {
        if (participantIdSet.has(id)) {
          return {
            success: false,
            stats: {
              totalParticipants: participants.length,
              eligibleCount: participants.length,
              winnersCount: 0,
            },
            error: `观众席成员 ID 与参与者重复：${id}`,
          }
        }
      }

      for (const rule of rules) {
        if (!rule.isActive) continue
        for (const id of rule.participantIds) {
          if (audienceIdSet.has(id)) {
            return {
              success: false,
              stats: {
                totalParticipants: participants.length,
                eligibleCount: participants.length,
                winnersCount: 0,
              },
              error: `规则「${rule.name}」引用了观众席成员：${id}`,
            }
          }
          if (!participantIdSet.has(id)) {
            return {
              success: false,
              stats: {
                totalParticipants: participants.length,
                eligibleCount: participants.length,
                winnersCount: 0,
              },
              error: `规则「${rule.name}」引用了不存在的参与者：${id}`,
            }
          }
        }
      }

      this.engine = new LotteryEngine(participants, rules)
      const stats = this.engine.getStats()
      console.log('[LotteryManager] 引擎初始化成功，统计:', stats)
      return {
        success: true,
        stats,
      }
    } catch (error) {
      console.error('[LotteryManager] 引擎初始化失败:', error)
      return {
        success: false,
        stats: {
          totalParticipants: 0,
          eligibleCount: 0,
          winnersCount: 0,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 销毁引擎
   */
  public destroyEngine(): void {
    this.engine = null
  }

  /**
   * 检查引擎是否已初始化
   */
  public hasEngine(): boolean {
    return this.engine !== null
  }

  /**
   * 执行多人抽奖
   */
  public drawMultiple(count: number): MultiDrawResult {
    if (!this.engine) {
      console.warn('[LotteryManager] 引擎未初始化，返回空结果')
      return { winners: [] }
    }
    return this.engine.drawMultiple(count)
  }

  /**
   * 重置轮次
   */
  public resetRound(): void {
    if (this.engine) {
      this.engine.resetRound()
    }
  }

  /**
   * 获取统计信息
   */
  public getStats(): LotteryStats {
    if (!this.engine) {
      return {
        totalParticipants: 0,
        eligibleCount: 0,
        winnersCount: 0,
      }
    }
    return this.engine.getStats()
  }

  /**
   * 获取当前中奖者 ID
   */
  public getCurrentWinnerIds(): string[] {
    if (!this.engine) {
      return []
    }
    return this.engine.getCurrentWinnerIds()
  }
}
