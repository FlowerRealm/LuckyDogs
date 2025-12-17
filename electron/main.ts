import { app, BrowserWindow, ipcMain, Menu } from 'electron'
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

// 加载默认配置
async function loadDefaultConfig() {
  const configPath = getConfigPath()
  const [participants, rules] = await Promise.all([
    fs.promises.readFile(path.join(configPath, 'participants.json'), 'utf-8').catch(() => '[]'),
    fs.promises.readFile(path.join(configPath, 'rules.json'), 'utf-8').catch(() => '[]'),
  ])

  return {
    participants: JSON.parse(participants),
    rules: JSON.parse(rules),
  }
}

// 注册 IPC 处理
function registerIpcHandlers() {
  // 加载配置 - 从 config 目录读取配置（只读）
  ipcMain.handle('config:load', async () => {
    return await loadDefaultConfig()
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
