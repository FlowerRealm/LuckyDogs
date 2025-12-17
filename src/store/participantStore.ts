import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Participant, ParticipantInput } from '@/types'

interface ParticipantState {
  participants: Participant[]

  // Actions
  setParticipants: (participants: Participant[]) => void
  addParticipant: (input: ParticipantInput) => void
  updateParticipant: (id: string, input: Partial<ParticipantInput>) => void
  deleteParticipant: (id: string) => void
  markAsWinner: (id: string, roundNumber: number) => void
  resetWinners: () => void

  // Getters
  getEligibleParticipants: () => Participant[]
  getWinners: () => Participant[]
  getParticipantById: (id: string) => Participant | undefined
}

export const useParticipantStore = create<ParticipantState>()(
  (set, get) => ({
    participants: [],

    setParticipants: (participants) => set({ participants }),

    addParticipant: (input) => {
      const newParticipant: Participant = {
        id: uuidv4(),
        name: input.name,
        weight: input.weight ?? 1,
        avatar: input.avatar,
        metadata: input.metadata,
      }
      set((state) => ({
        participants: [...state.participants, newParticipant],
      }))
    },

    updateParticipant: (id, input) => {
      set((state) => ({
        participants: state.participants.map((p) =>
          p.id === id ? { ...p, ...input } : p
        ),
      }))
    },

    deleteParticipant: (id) => {
      set((state) => ({
        participants: state.participants.filter((p) => p.id !== id),
      }))
    },

    markAsWinner: (id, roundNumber) => {
      set((state) => ({
        participants: state.participants.map((p) =>
          p.id === id
            ? { ...p, wonAt: new Date().toISOString(), wonInRound: roundNumber }
            : p
        ),
      }))
    },

    resetWinners: () => {
      set((state) => ({
        participants: state.participants.map((p) => ({
          ...p,
          wonAt: undefined,
          wonInRound: undefined,
        })),
      }))
    },

    getEligibleParticipants: () => {
      return get().participants.filter((p) => p.wonAt === undefined)
    },

    getWinners: () => {
      return get().participants.filter((p) => p.wonAt !== undefined)
    },

    getParticipantById: (id) => {
      return get().participants.find((p) => p.id === id)
    },
  })
)
