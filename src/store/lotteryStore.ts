import { create } from 'zustand'
import { Winner } from '@/types'

interface LotteryStore {
  // 状态
  isDrawing: boolean
  drawCount: number
  pendingWinners: Winner[]
  revealedWinners: Winner[]

  // Actions
  setDrawCount: (count: number) => void
  startDraw: (count: number) => void
  endDraw: (winners: Winner[]) => void
  revealWinner: (winner: Winner) => void
  revealAllWinners: () => void
  resetRound: () => void
  resetAll: () => void
}

export const useLotteryStore = create<LotteryStore>((set) => ({
  isDrawing: false,
  drawCount: 1,
  pendingWinners: [],
  revealedWinners: [],

  setDrawCount: (count) => set({ drawCount: count }),

  startDraw: (count) => {
    set({
      isDrawing: true,
      drawCount: count,
      pendingWinners: [],
      revealedWinners: [],
    })
  },

  endDraw: (winners) => {
    set({
      isDrawing: false,
      pendingWinners: winners,
    })
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
      pendingWinners: [],
      revealedWinners: [],
    })
  },
}))
