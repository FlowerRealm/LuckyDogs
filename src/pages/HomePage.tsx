import { LotteryWheel } from '@/components/lottery'

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 标题区 */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400
                       bg-clip-text text-transparent">
          🎰 幸运抽奖
        </h1>
        <p className="text-white/60 mt-2">公平、公正、公开</p>
      </div>

      {/* 抽奖区 */}
      <div className="flex-1">
        <LotteryWheel />
      </div>
    </div>
  )
}
