import { Winner } from './lottery'

export interface AudienceMember {
  id: string
  name: string
  vip?: boolean
}

export type AudienceTrigger =
  | {
      type: 'allOfWinners'
      participantIds: string[]
    }
  | {
      type: 'hitsOnDrawCount'
      drawCount: number
      participantIds: string[]
      minHits?: number
    }

export interface AudienceConfig {
  members: AudienceMember[]
  triggers: AudienceTrigger[]
}

export function normalizeAudienceConfig(input: unknown): AudienceConfig {
  const fallback: AudienceConfig = { members: [], triggers: [] }
  if (!input || typeof input !== 'object') return fallback

  const obj = input as Record<string, unknown>

  const members = Array.isArray(obj.members)
    ? obj.members
        .filter((m): m is Record<string, unknown> => !!m && typeof m === 'object')
        .map((m): AudienceMember | null => {
          const id = typeof m.id === 'string' ? m.id : ''
          const name = typeof m.name === 'string' ? m.name : ''
          if (!id || !name) return null
          const vip = typeof m.vip === 'boolean' ? m.vip : undefined
          return { id, name, vip }
        })
        .filter((m): m is AudienceMember => m !== null)
    : []

  const triggers = Array.isArray(obj.triggers)
    ? obj.triggers
        .filter((t): t is Record<string, unknown> => !!t && typeof t === 'object')
        .map((t): AudienceTrigger | null => {
          if (t.type === 'allOfWinners') {
            const participantIds = Array.isArray(t.participantIds)
              ? t.participantIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
              : []
            return { type: 'allOfWinners', participantIds }
          }

          if (t.type === 'hitsOnDrawCount') {
            const drawCount = typeof t.drawCount === 'number' ? t.drawCount : Number.NaN
            const participantIds = Array.isArray(t.participantIds)
              ? t.participantIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
              : []
            const minHits = typeof t.minHits === 'number' ? t.minHits : undefined
            if (!Number.isFinite(drawCount)) return null
            if (minHits !== undefined && !Number.isFinite(minHits)) return null
            return { type: 'hitsOnDrawCount', drawCount, participantIds, minHits }
          }

          return null
        })
        .filter((t): t is AudienceTrigger => t !== null)
    : []

  return { members, triggers }
}

export function isAudienceTriggered(params: {
  triggers: AudienceTrigger[]
  winners: Winner[]
  drawCount: number
}): boolean {
  const winnerIds = new Set(params.winners.map((w) => w.participantId))
  for (const trigger of params.triggers) {
    if (trigger.type === 'allOfWinners') {
      if (trigger.participantIds.length === 0) continue
      if (trigger.participantIds.every((id) => winnerIds.has(id))) return true
      continue
    }

    if (trigger.type === 'hitsOnDrawCount') {
      if (trigger.participantIds.length === 0) continue
      if (trigger.drawCount !== params.drawCount) continue
      const minHits = Math.max(1, trigger.minHits ?? 1)

      let hits = 0
      for (const id of trigger.participantIds) {
        if (winnerIds.has(id)) hits++
        if (hits >= minHits) return true
      }
    }
  }
  return false
}
