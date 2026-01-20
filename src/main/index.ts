import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, shell } from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import * as log from 'electron-log/main'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './db/localdb-schema'
import { setupIpcHandlers } from './ipc-handlers'
import { AutoUpdateManager } from './auto-update'
import { MacAccessibilityManager } from './mac-accessibility'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let updateManager: AutoUpdateManager | null = null
let accessibilityManager: MacAccessibilityManager | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon: join(__dirname, '../resources/icon.png') } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createTray(): void {
  const iconPath = join(__dirname, '../resources/macTrayTemplate.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow?.show() },
    { label: 'Check for Updates', click: () => updateManager?.checkForUpdates() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ])

  tray.setToolTip('Nani!?')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    mainWindow?.show()
  })
}

function initializeDatabase() {
  const userDataPath = app.getPath('userData')
  const dbPath = join(userDataPath, 'nani.db')

  const sqlite = new Database(dbPath)
  const db = drizzle(sqlite, { schema })

  migrate(db, { migrationsFolder: join(__dirname, '../../drizzle') })

  return db
}

function setupLogging() {
  const userDataPath = app.getPath('userData')
  const logsPath = join(userDataPath, 'logs')
  const logPath = join(logsPath, 'main.log')

  log.transports.file.resolvePathFn = () => logPath
  log.initialize()

  log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}][{level}] {text}'

  log.errorHandler.startCatching({
    showDialog: false,
    onError: ({ error, processType }) => {
      if (processType === 'renderer') {
        log.error('[renderer] Caught error:', error)
      } else {
        log.error('[main] Caught error:', error)
      }
    }
  })

  return log
}

app.whenReady().then(() => {
  // アプリケーション名設定
  if (app.isPackaged) {
    app.setName('nani-local')
  }

  electronApp.setAppUserModelId('com.kioku.nani')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ロギング設定
  const logger = setupLogging()

  // データベース初期化
  const database = initializeDatabase()

  // ウィンドウ作成
  createWindow()
  createTray()

  // IPCハンドラー設定
  setupIpcHandlers(database, mainWindow)

  // 自動アップデートマネージャー初期化
  updateManager = new AutoUpdateManager(mainWindow)

  // アクセシビリティマネージャー初期化（macOSのみ）
  if (process.platform === 'darwin') {
    accessibilityManager = new MacAccessibilityManager(mainWindow)
    accessibilityManager.startWatching()
  }

  // アクティベートイベント
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  logger.info('Nani Desktop started successfully')
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  // クリーンアップ
  tray?.destroy()
  accessibilityManager?.stopWatching()
})

// アプリケーションがパッケージ済みかチェック
export const isPackaged = app.isPackaged

// ロガーエクスポート
export const mainLog = log
