import { useEffect, useState } from 'react'

interface AccessibilitySettings {
  voiceOverEnabled: boolean
  reduceMotionEnabled: boolean
  highContrastEnabled: boolean
  keyboardNavigation: boolean
}

export function ContentMacAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    voiceOverEnabled: false,
    reduceMotionEnabled: false,
    highContrastEnabled: false,
    keyboardNavigation: true
  })

  useEffect(() => {
    // メインプロセスからアクセシビリティ設定を取得
    const fetchAccessibilitySettings = async () => {
      try {
        const result = await window.electron?.getAccessibilitySettings?.()
        if (result) {
          setSettings(result)
        }
      } catch (error) {
        console.error('Failed to fetch accessibility settings:', error)
      }
    }

    fetchAccessibilitySettings()

    // アクセシビリティ設定の変更を監視
    const cleanup = window.electron?.onAccessibilitySettingsChanged?.((newSettings) => {
      setSettings(newSettings)
    })

    return () => {
      cleanup?.()
    }
  }, [])

  if (!settings.voiceOverEnabled &&
      !settings.reduceMotionEnabled &&
      !settings.highContrastEnabled) {
    return null
  }

  return (
    <div
      className="mac-accessibility-bar"
      role="complementary"
      aria-label="アクセシビリティ機能が有効"
    >
      <div className="accessibility-indicators">
        {settings.voiceOverEnabled && (
          <div className="accessibility-indicator" aria-label="VoiceOverが有効">
            <span className="indicator-icon" aria-hidden="true">🔊</span>
            <span className="indicator-text">VoiceOver</span>
          </div>
        )}

        {settings.reduceMotionEnabled && (
          <div className="accessibility-indicator" aria-label="動作を減らすが有効">
            <span className="indicator-icon" aria-hidden="true">🎯</span>
            <span className="indicator-text">Reduce Motion</span>
          </div>
        )}

        {settings.highContrastEnabled && (
          <div className="accessibility-indicator" aria-label="コントラストを上げるが有効">
            <span className="indicator-icon" aria-hidden="true">🔲</span>
            <span className="indicator-text">High Contrast</span>
          </div>
        )}
      </div>

      <button
        className="accessibility-settings-btn"
        aria-label="アクセシビリティ設定を開く"
        onClick={() => window.electron?.openMacAccessibility?.()}
      >
        <span aria-hidden="true">⚙️</span>
        <span>設定</span>
      </button>

      <style>{`
        .mac-accessibility-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
          font-size: 12px;
        }

        .accessibility-indicators {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .accessibility-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: var(--color-background);
          border-radius: 12px;
          border: 1px solid var(--color-border);
        }

        .indicator-icon {
          font-size: 14px;
        }

        .indicator-text {
          font-weight: 500;
          color: var(--color-text);
        }

        .accessibility-settings-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .accessibility-settings-btn:hover {
          background: var(--color-primary-dark);
        }

        .accessibility-settings-btn:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .mac-accessibility-bar {
            flex-direction: column;
            gap: 8px;
            padding: 12px;
          }

          .accessibility-indicators {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
