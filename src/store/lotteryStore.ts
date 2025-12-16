import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { LotterySession, LotteryRound, Winner, ExcludedRecord } from '@/types'

interface LotteryStore {
  // 状态
  isDrawing: boolean
  currentRound: number
  drawCount: number
  currentSession: LotterySession | null
  pendingWinners: Winner[]
  revealedWinners: Winner[]

  // Actions
  setDrawCount: (count: number) => void
  startSession: (totalParticipants: number) => void
  endSession: () => void
  startDraw: () => void
  endDraw: (winners: Winner[], excluded: ExcludedRecord[]) => void
  revealWinner: (winner: Winner) => void
  revealAllWinners: () => void
  resetRound: () => void
  resetAll: () => void

  // Getters
  getCurrentRoundWinners: () => Winner[]
  getAllSessionWinners: () => Winner[]
}

export const useLotteryStore = create<LotteryStore>((set, get) => ({
  isDrawing: false,
  currentRound: 0,
  drawCount: 1,
  currentSession: null,
  pendingWinners: [],
  revealedWinners: [],

  setDrawCount: (count) => set({ drawCount: count }),

  startSession: (totalParticipants) => {
    const session: LotterySession = {
      sessionId: uuidv4(),
      startTime: new Date().toISOString(),
      rounds: [],
      totalParticipants,
      totalWinners: 0,
    }
    set({
      currentSession: session,
      currentRound: 0,
      pendingWinners: [],
      revealedWinners: [],
    })
  },

  endSession: () => {
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, endTime: new Date().toISOString() }
        : null,
    }))
  },

  startDraw: () => {
    set((state) => ({
      isDrawing: true,
      currentRound: state.currentRound + 1,
      pendingWinners: [],
      revealedWinners: [],
    }))
  },

  endDraw: (winners, excluded) => {
    const { currentRound, drawCount } = get()

    const round: LotteryRound = {
      roundNumber: currentRound,
      drawCount,
      winners,
      excludedByRule: excluded,
      timestamp: new Date().toISOString(),
    }

    set((state) => ({
      isDrawing: false,
      pendingWinners: winners,
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            rounds: [...state.currentSession.rounds, round],
            totalWinners: state.currentSession.totalWinners + winners.length,
          }
        : null,
    }))
  },

  revealWinner: (winner) => {
    set((state) => ({
      pendingWinners: state.pendingWinners.filter((w) => w.participantId !== winner.participantId),
      revealedWinners: [...state.revealedWinners, winner],
    }))
  },

  revealAllWinners: () => {
    set((state) => ({
      revealedWinners: [...state.revealedWinners, ...state.pendingWinners],
      pendingWinners: [],
    }))
  },

  resetRound: () => {
    set({
      pendingWinners: [],
      revealedWinners: [],
    })
  },

  resetAll: () => {
    set({
      isDrawing: false,
      currentRound: 0,
      currentSession: null,
      pendingWinners: [],
      revealedWinners: [],
    })
  },

  getCurrentRoundWinners: () => {
    const { currentSession, currentRound } = get()
    if (!currentSession) return []
    const round = currentSession.rounds.find((r) => r.roundNumber === currentRound)
    return round?.winners ?? []
  },

  getAllSessionWinners: () => {
    const { currentSession } = get()
    if (!currentSession) return []
    return currentSession.rounds.flatMap((r) => r.winners)
  },
}))
