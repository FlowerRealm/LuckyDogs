/**
 * 抽奖 IPC 处理函数注册
 */

import { ipcMain } from 'electron'
import { LotteryEngineManager } from './lotteryManager'
import { EngineInitData } from './types'

/**
 * 注册所有抽奖相关的 IPC handlers
 */
export function registerLotteryHandlers(): void {
  const manager = LotteryEngineManager.getInstance()

  // 初始化引擎
  ipcMain.handle('lottery:init', async (_, data: EngineInitData) => {
    return manager.initEngine(data)
  })

  // 销毁引擎
  ipcMain.handle('lottery:destroy', async () => {
    manager.destroyEngine()
  })

  // 多人抽奖
  ipcMain.handle('lottery:drawMultiple', async (_, count: number) => {
    return manager.drawMultiple(count)
  })

  // 重置轮次
  ipcMain.handle('lottery:resetRound', async () => {
    manager.resetRound()
  })

  // 获取统计信息
  ipcMain.handle('lottery:getStats', async () => {
    return manager.getStats()
  })

  // 获取当前中奖者
  ipcMain.handle('lottery:getWinners', async () => {
    return manager.getCurrentWinnerIds()
  })
}
