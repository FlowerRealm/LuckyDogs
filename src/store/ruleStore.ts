import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Rule, RuleInput, BindingRule } from '@/types'

interface RuleState {
  rules: Rule[]

  // Actions
  setRules: (rules: Rule[]) => void
  addRule: (input: RuleInput) => void
  updateRule: (id: string, input: Partial<RuleInput>) => void
  deleteRule: (id: string) => void
  toggleRule: (id: string) => void

  // Getters
  getActiveRules: () => Rule[]
  getRuleById: (id: string) => Rule | undefined
  getRulesForParticipant: (participantId: string) => Rule[]
}

export const useRuleStore = create<RuleState>()(
  (set, get) => ({
    rules: [],

    setRules: (rules) => set({ rules }),

    addRule: (input) => {
      const newRule: Rule = {
        id: uuidv4(),
        type: input.type,
        name: input.name,
        participantIds: input.participantIds,
        description: input.description,
        isActive: input.isActive ?? true,
      } as BindingRule

      set((state) => ({
        rules: [...state.rules, newRule],
      }))
    },

    updateRule: (id, input) => {
      set((state) => ({
        rules: state.rules.map((r) =>
          r.id === id ? { ...r, ...input } : r
        ),
      }))
    },

    deleteRule: (id) => {
      set((state) => ({
        rules: state.rules.filter((r) => r.id !== id),
      }))
    },

    toggleRule: (id) => {
      set((state) => ({
        rules: state.rules.map((r) =>
          r.id === id ? { ...r, isActive: !r.isActive } : r
        ),
      }))
    },

    getActiveRules: () => {
      return get().rules.filter((r) => r.isActive)
    },

    getRuleById: (id) => {
      return get().rules.find((r) => r.id === id)
    },

    getRulesForParticipant: (participantId) => {
      return get().rules.filter((r) => r.participantIds.includes(participantId))
    },
  })
)
