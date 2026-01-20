import { autoUpdater } from 'electron-updater'
import * as log from 'electron-log/main'

export class AutoUpdateManager {
  private readonly mainWindow: Electron.BrowserWindow | null

  constructor(mainWindow: Electron.BrowserWindow | null) {
    this.mainWindow = mainWindow
    this.setupAutoUpdater()
  }

  private setupAutoUpdater(): void {
    // ログ設定
    autoUpdater.logger = log

    // アップデートイベントのハンドリング
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...')
      this.sendToRenderer('update-checking')
    })

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info)
      this.sendToRenderer('update-available', info)
    })

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info)
      this.sendToRenderer('update-not-available', info)
    })

    autoUpdater.on('error', (err) => {
      log.error('Update error:', err)
      this.sendToRenderer('update-error', { message: err.message })
    })

    autoUpdater.on('download-progress', (progress) => {
      log.info('Download progress:', progress)
      this.sendToRenderer('update-download-progress', progress)
    })

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info)
      this.sendToRenderer('update-downloaded', info)
    })
  }

  /**
   * アップデートをチェック
   */
  async checkForUpdates(): Promise<void> {
    try {
      await autoUpdater.checkForUpdates()
    } catch (error) {
      log.error('Failed to check for updates:', error)
      throw error
    }
  }

  /**
   * アップデートをダウンロード
   */
  async downloadUpdate(): Promise<void> {
    try {
      await autoUpdater.downloadUpdate()
    } catch (error) {
      log.error('Failed to download update:', error)
      throw error
    }
  }

  /**
   * アップデートをインストールしてアプリを再起動
   */
  installAndRestart(): void {
    autoUpdater.quitAndInstall()
  }

  /**
   * 自動アップデートを有効化
   */
  enableAutoUpdate(): void {
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = true
  }

  /**
   * 自動アップデートを無効化
   */
  disableAutoUpdate(): void {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = false
  }

  /**
   * レンダラープロセスにイベントを送信
   */
  private sendToRenderer(channel: string, data?: unknown): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data)
    }
  }
}
