import { HomePage } from './pages/HomePage'

// 抽奖 API 类型
interface LotteryStats {
  totalParticipants: number
  eligibleCount: number
  winnersCount: number
}

interface EngineInitData {
  participants: any[]
  rules: any[]
  audienceIds?: string[]
}

interface EngineInitResult {
  success: boolean
  stats: LotteryStats
  error?: string
}

interface MultiDrawResult {
  winners: any[]
}

// Electron API 类型声明
declare global {
  interface Window {
    electronAPI?: {
      config: {
        load: () => Promise<{ participants?: any[]; rules?: any[]; audience?: any }>
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
