import { app, BrowserWindow, systemPreferences, nativeTheme } from 'electron'

export interface AccessibilitySettings {
  reduceMotion: boolean
  highContrast: boolean
  voiceOverEnabled: boolean
  increasedContrast: boolean
}

export class MacAccessibilityManager {
  private mainWindow: Electron.BrowserWindow | null = null
  private listeners: Array<() => void> = []

  constructor(mainWindow: Electron.BrowserWindow | null) {
    this.mainWindow = mainWindow
  }

  /**
   * アクセシビリティ設定を取得
   */
  getAccessibilitySettings(): AccessibilitySettings {
    return {
      reduceMotion: nativeTheme.shouldUseDarkColors, // macOSのダークモード
      highContrast: false, // システムから取得
      voiceOverEnabled: false, // VoiceOver状態
      increasedContrast: false // コントラスト設定
    }
  }

  /**
   * アクセシビリティ設定の変更を監視
   */
  startWatching(): void {
    // ネイティブテーマの変更を監視
    const themeListener = () => {
      this.notifyRenderer()
    }

    nativeTheme.on('updated', themeListener)
    this.listeners.push(() => {
      nativeTheme.off('updated', themeListener)
    })
  }

  /**
   * 監視を停止
   */
  stopWatching(): void {
    for (const cleanup of this.listeners) {
      cleanup()
    }
    this.listeners = []
  }

  /**
   * レンダラーにアクセシビリティ設定を通知
   */
  private notifyRenderer(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      const settings = this.getAccessibilitySettings()
      this.mainWindow.webContents.send('accessibility-changed', settings)
    }
  }

  /**
   * VoiceOverが有効かチェック（macOS）
   */
  isVoiceOverEnabled(): boolean {
    if (process.platform !== 'darwin') {
      return false
    }

    try {
      // VoiceOverの状態を取得
      // 注: 実際の実装ではAppleScriptやネイティブAPIを使用
      return false
    } catch {
      return false
    }
  }

  /**
   * Reduce Motion設定を取得
   */
  isReduceMotionEnabled(): boolean {
    if (process.platform !== 'darwin') {
      return false
    }

    try {
      // macOSのReduce Motion設定を取得
      return systemPreferences.getMediaAccessibilityStatus('reduceMotion') as boolean
    } catch {
      return false
    }
  }

  /**
   * High Contrast設定を取得
   */
  isHighContrastEnabled(): boolean {
    if (process.platform !== 'darwin') {
      return false
    }

    try {
      // macOSのIncrease Contrast設定を取得
      return systemPreferences.getMediaAccessibilityStatus('increaseContrast') as boolean
    } catch {
      return false
    }
  }
}

/**
 * アクセシビリティ対応のARIA属性を生成
 */
export function generateAriaProps(label: string, description?: string) {
  return {
    role: 'region' as const,
    'aria-label': label,
    'aria-description': description || undefined
  }
}

/**
 * キーボードナビゲーション用の属性を生成
 */
export function generateKeyboardNavProps(index: number, total: number) {
  return {
    tabIndex: 0,
    'aria-roledescription': `item ${index + 1} of ${total}`,
    'aria-posinset': index + 1,
    'aria-setsize': total
  }
}
