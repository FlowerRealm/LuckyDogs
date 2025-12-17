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

interface DrawResult {
  winner: any | null
  boundWinners: any[] // 绑定规则触发的自动中奖者
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
    save: (config: any) => Promise<{ success: boolean }>
    reset: () => Promise<any>
    export: () => Promise<{ success: boolean; path?: string }>
    import: () => Promise<{ success: boolean; config?: any }>
  }
  app: {
    getVersion: () => Promise<string>
    getPlatform: () => string
  }
  lottery: {
    init: (data: EngineInitData) => Promise<EngineInitResult>
    destroy: () => Promise<void>
    drawOne: () => Promise<DrawResult>
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
    save: (config: any) => ipcRenderer.invoke('config:save', config),
    reset: () => ipcRenderer.invoke('config:reset'),
    export: () => ipcRenderer.invoke('config:export'),
    import: () => ipcRenderer.invoke('config:import'),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:version'),
    getPlatform: () => process.platform,
  },
  lottery: {
    init: (data: EngineInitData) => ipcRenderer.invoke('lottery:init', data),
    destroy: () => ipcRenderer.invoke('lottery:destroy'),
    drawOne: () => ipcRenderer.invoke('lottery:drawOne'),
    drawMultiple: (count: number) => ipcRenderer.invoke('lottery:drawMultiple', count),
    resetRound: () => ipcRenderer.invoke('lottery:resetRound'),
    getStats: () => ipcRenderer.invoke('lottery:getStats'),
    getWinners: () => ipcRenderer.invoke('lottery:getWinners'),
  },
} as ElectronAPI)
