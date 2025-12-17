import { HomePage } from './pages/HomePage'
import { Winner } from '@/types'

// 抽奖 API 类型
interface LotteryStats {
  totalParticipants: number
  eligibleCount: number
  winnersCount: number
}

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
  winner: Winner | null
  boundWinners: Winner[] // 绑定规则触发的自动中奖者
}

interface MultiDrawResult {
  winners: Winner[]
}

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
  }
}

const App: React.FC = () => {
  return (
    // 全局背景容器
    <div className="min-h-screen w-full bg-theme-bg text-theme-text-main font-sans selection:bg-theme-primary/20 selection:text-theme-primary">
      <HomePage />
    </div>
  )
}

export default App
