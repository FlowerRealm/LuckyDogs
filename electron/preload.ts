import { contextBridge, ipcRenderer } from 'electron'

// 抽奖 API 数据类型
interface EngineInitData {
  participants: any[]
  rules: any[]
}

interface EngineInitResult {
  success: boolean
  stats: LotteryStats
  error?: string
}

interface MultiDrawResult {
  winners: any[]
}

interface LotteryStats {
  totalParticipants: number
  eligibleCount: number
  winnersCount: number
}

// 定义暴露给渲染进程的 API 类型
export interface ElectronAPI {
  config: {
    load: () => Promise<any>
  }
  lottery: {
    init: (data: EngineInitData) => Promise<EngineInitResult>
    destroy: () => Promise<void>
    drawMultiple: (count: number) => Promise<MultiDrawResult>
    resetRound: () => Promise<void>
    getStats: () => Promise<LotteryStats>
    getWinners: () => Promise<string[]>
  }
}

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  config: {
    load: () => ipcRenderer.invoke('config:load'),
  },
  lottery: {
    init: (data: EngineInitData) => ipcRenderer.invoke('lottery:init', data),
    destroy: () => ipcRenderer.invoke('lottery:destroy'),
    drawMultiple: (count: number) => ipcRenderer.invoke('lottery:drawMultiple', count),
    resetRound: () => ipcRenderer.invoke('lottery:resetRound'),
    getStats: () => ipcRenderer.invoke('lottery:getStats'),
    getWinners: () => ipcRenderer.invoke('lottery:getWinners'),
  },
} as ElectronAPI)
