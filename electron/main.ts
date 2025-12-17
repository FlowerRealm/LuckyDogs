import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import fs from 'fs'
import { registerLotteryHandlers } from './ipc/lotteryHandlers'

// ESM 兼容：定义 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 环境判断
const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    backgroundColor: '#0f0a1e',
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  })

  // 窗口准备好后再显示，避免白屏
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // F12 打开开发者工具
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow?.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  // 加载页面
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 获取配置文件路径
function getConfigPath(): string {
  if (isDev) {
    return path.join(__dirname, '../config')
  }
  return path.join(process.resourcesPath, 'config')
}

// 获取用户数据路径
function getUserDataPath(): string {
  return path.join(app.getPath('userData'), 'config.json')
}

// 加载默认配置
async function loadDefaultConfig() {
  const configPath = getConfigPath()
  const [participants, rules] = await Promise.all([
    fs.promises.readFile(path.join(configPath, 'participants.json'), 'utf-8').catch(() => '[]'),
    fs.promises.readFile(path.join(configPath, 'rules.json'), 'utf-8').catch(() => '[]'),
  ])

  return {
    version: app.getVersion(),
    participants: JSON.parse(participants),
    rules: JSON.parse(rules),
  }
}

// 注册 IPC 处理
function registerIpcHandlers() {
  // 加载配置 - 始终从 config 目录读取最新配置
  ipcMain.handle('config:load', async () => {
    return await loadDefaultConfig()
  })

  // 保存配置
  ipcMain.handle('config:save', async (_, config) => {
    const userDataPath = getUserDataPath()
    await fs.promises.writeFile(userDataPath, JSON.stringify(config, null, 2), 'utf-8')
    return { success: true }
  })

  // 重置配置
  ipcMain.handle('config:reset', async () => {
    const defaultConfig = await loadDefaultConfig()
    const userDataPath = getUserDataPath()
    await fs.promises.writeFile(userDataPath, JSON.stringify(defaultConfig, null, 2), 'utf-8')
    return defaultConfig
  })

  // 导出配置
  ipcMain.handle('config:export', async () => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: '导出配置',
      defaultPath: 'lottery-config.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })

    if (!result.canceled && result.filePath) {
      const userDataPath = getUserDataPath()
      const config = await fs.promises.readFile(userDataPath, 'utf-8')
      await fs.promises.writeFile(result.filePath, config, 'utf-8')
      return { success: true, path: result.filePath }
    }
    return { success: false }
  })

  // 导入配置
  ipcMain.handle('config:import', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: '导入配置',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const config = await fs.promises.readFile(result.filePaths[0], 'utf-8')
      const parsed = JSON.parse(config)
      const userDataPath = getUserDataPath()
      await fs.promises.writeFile(userDataPath, JSON.stringify(parsed, null, 2), 'utf-8')
      return { success: true, config: parsed }
    }
    return { success: false }
  })

  // 获取应用版本
  ipcMain.handle('app:version', () => {
    return app.getVersion()
  })
}

// 应用启动
app.whenReady().then(() => {
  // 隐藏菜单栏
  Menu.setApplicationMenu(null)

  registerIpcHandlers()
  registerLotteryHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 关闭所有窗口时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
