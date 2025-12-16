import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages'
import { useParticipantStore, useRuleStore } from '@/store'

// Electron API 类型声明
declare global {
  interface Window {
    electronAPI?: {
      config: {
        load: () => Promise<{ participants?: any[]; rules?: any[] }>
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
  }
}

function App() {
  // 启动时加载配置
  useEffect(() => {
    const loadConfig = async () => {
      if (window.electronAPI) {
        const config = await window.electronAPI.config.load()
        if (config.participants) {
          useParticipantStore.getState().setParticipants(config.participants)
        }
        if (config.rules) {
          useRuleStore.getState().setRules(config.rules)
        }
      }
    }
    loadConfig()
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-lottery-bg">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
