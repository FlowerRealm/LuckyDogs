import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import fs from 'fs'
import { performance } from 'node:perf_hooks'
import { registerLotteryHandlers } from './ipc/lotteryHandlers'

// ESM 兼容：定义 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 环境判断
const isDev = !app.isPackaged
const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'

let mainWindow: BrowserWindow | null = null

const startupAt = performance.now()
function logStartup(message: string): void {
  const deltaMs = Math.round(performance.now() - startupAt)
  console.log(`[startup +${deltaMs}ms] ${message}`)
}

function createWindow() {
  logStartup('createWindow: start')
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

  let didShow = false
  const showWindow = (reason: string) => {
    if (!mainWindow || didShow) return
    didShow = true
    logStartup(`createWindow: show (${reason})`)
    mainWindow.show()
  }

  // 尽快显示窗口以满足“启动 < 1s”的体验目标；同时保留 ready-to-show 事件用于观测与兜底
  mainWindow.once('ready-to-show', () => {
    logStartup('createWindow: ready-to-show')
    showWindow('ready-to-show')
  })

  // F12 打开开发者工具
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow?.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  mainWindow.webContents.once('dom-ready', () => {
    logStartup('webContents: dom-ready')
  })

  mainWindow.webContents.once('did-finish-load', () => {
    logStartup('webContents: did-finish-load')
  })

  mainWindow.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (!isMainFrame) return
      logStartup(
        `webContents: did-fail-load (${errorCode}) ${errorDescription} url=${validatedURL}`
      )
      showWindow('did-fail-load')

      const errorHtml = `
<!doctype html>
<html lang="zh-CN">
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lucky Dogs - 启动失败</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif; padding: 24px; }
    .card { max-width: 720px; margin: 0 auto; border: 1px solid rgba(148,163,184,.35); border-radius: 16px; padding: 20px; }
    h1 { margin: 0 0 12px; font-size: 18px; }
    p { margin: 8px 0; opacity: .9; line-height: 1.5; }
    code { padding: 2px 6px; border-radius: 8px; background: rgba(148,163,184,.18); }
    button { margin-top: 12px; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(148,163,184,.45); background: rgba(148,163,184,.18); cursor: pointer; }
  </style>
  <body>
    <div class="card">
      <h1>页面加载失败</h1>
      <p>无法加载渲染页面，请检查开发服务器是否启动，或打包资源是否完整。</p>
      <p>URL：<code>${validatedURL}</code></p>
      <p>错误：<code>${errorDescription} (${errorCode})</code></p>
      <button onclick="location.reload()">重试</button>
    </div>
  </body>
</html>`.trim()

      void mainWindow?.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`)
    }
  )

  // 加载页面
  if (isDev) {
    logStartup(`createWindow: loadURL ${devServerUrl}`)
    void mainWindow.loadURL(devServerUrl).catch((error) => {
      logStartup(`createWindow: loadURL failed ${(error as Error).message}`)
      showWindow('loadURL-error')
    })
  } else {
    const indexHtmlPath = path.join(__dirname, '../dist/index.html')
    logStartup(`createWindow: loadFile ${indexHtmlPath}`)
    void mainWindow.loadFile(indexHtmlPath).catch((error) => {
      logStartup(`createWindow: loadFile failed ${(error as Error).message}`)
      showWindow('loadFile-error')
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 立即显示（不再依赖 ready-to-show），避免某些环境下 ready-to-show 不触发导致“窗口一直不出现”
  setTimeout(() => showWindow('eager'), 0)
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
  logStartup(`app.whenReady (isDev=${isDev})`)
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
