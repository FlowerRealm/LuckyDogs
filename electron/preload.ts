import { contextBridge, ipcRenderer } from 'electron'

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
} as ElectronAPI)
