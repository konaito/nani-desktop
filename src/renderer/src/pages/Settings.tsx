import { useSettingsStore } from '../stores/useSettingsStore'
import { settingsApi } from '../utils/api'
import { SUPPORTED_LANGUAGES } from 'repo-lib/utils/supported-langs'

interface SettingsProps {
  onClose: () => void
}

export function Settings({ onClose }: SettingsProps) {
  const settings = useSettingsStore()

  const handleUpdate = async (key: string, value: any) => {
    try {
      await settingsApi.set(key, value)
      settings.updateSettings({ [key]: value })
    } catch (error) {
      console.error('Failed to update setting:', error)
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>設定</h1>
        <button onClick={onClose} className="btn-close" aria-label="閉じる">
          ×
        </button>
      </div>

      <div className="settings-content">
        {/* 外観 */}
        <section className="settings-section" aria-labelledby="appearance-heading">
          <h2 id="appearance-heading">外観</h2>

          <div className="settings-item">
            <label htmlFor="theme">テーマ</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => handleUpdate('theme', e.target.value)}
            >
              <option value="light">ライト</option>
              <option value="dark">ダーク</option>
              <option value="auto">自動（システム設定）</option>
            </select>
          </div>

          <div className="settings-item">
            <label htmlFor="language">言語</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => handleUpdate('language', e.target.value)}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* 翻訳 */}
        <section className="settings-section" aria-labelledby="translation-heading">
          <h2 id="translation-heading">翻訳</h2>

          <div className="settings-item">
            <label htmlFor="defaultFromLang">デフォルトの翻訳元言語</label>
            <select
              id="defaultFromLang"
              value={settings.defaultFromLang}
              onChange={(e) => handleUpdate('defaultFromLang', e.target.value)}
            >
              <option value="auto">自動検出</option>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-item">
            <label htmlFor="defaultToLang">デフォルトの翻訳先言語</label>
            <select
              id="defaultToLang"
              value={settings.defaultToLang}
              onChange={(e) => handleUpdate('defaultToLang', e.target.value)}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* 機能 */}
        <section className="settings-section" aria-labelledby="features-heading">
          <h2 id="features-heading">機能</h2>

          <div className="settings-item settings-item-switch">
            <div className="switch-label">
              <label htmlFor="enableOcr">OCRを有効にする</label>
              <span className="settings-description">
                画像からのテキスト抽出を許可
              </span>
            </div>
            <input
              type="checkbox"
              id="enableOcr"
              checked={settings.enableOcr}
              onChange={(e) => handleUpdate('enableOcr', e.target.checked)}
              role="switch"
              aria-checked={settings.enableOcr}
            />
          </div>

          <div className="settings-item settings-item-switch">
            <div className="switch-label">
              <label htmlFor="enableHotkeys">ホットキーを有効にする</label>
              <span className="settings-description">
                クイックアクションのキーボードショートカットを使用
              </span>
            </div>
            <input
              type="checkbox"
              id="enableHotkeys"
              checked={settings.enableHotkeys}
              onChange={(e) => handleUpdate('enableHotkeys', e.target.checked)}
              role="switch"
              aria-checked={settings.enableHotkeys}
            />
          </div>

          <div className="settings-item settings-item-switch">
            <div className="switch-label">
              <label htmlFor="autoUpdate">自動アップデート</label>
              <span className="settings-description">
                アップデートを自動的にチェック
              </span>
            </div>
            <input
              type="checkbox"
              id="autoUpdate"
              checked={settings.autoUpdate}
              onChange={(e) => handleUpdate('autoUpdate', e.target.checked)}
              role="switch"
              aria-checked={settings.autoUpdate}
            />
          </div>

          <div className="settings-item settings-item-switch">
            <div className="switch-label">
              <label htmlFor="showMenuBar">メニューバーを表示</label>
              <span className="settings-description">
                アプリケーションのメニューバーを表示
              </span>
            </div>
            <input
              type="checkbox"
              id="showMenuBar"
              checked={settings.showMenuBar}
              onChange={(e) => handleUpdate('showMenuBar', e.target.checked)}
              role="switch"
              aria-checked={settings.showMenuBar}
            />
          </div>
        </section>

        {/* アクション */}
        <section className="settings-section" aria-labelledby="actions-heading">
          <h2 id="actions-heading">アクション</h2>

          <button
            onClick={async () => {
              try {
                await settingsApi.reset()
                settings.resetSettings()
              } catch (error) {
                console.error('Failed to reset settings:', error)
              }
            }}
            className="btn-reset"
          >
            デフォルトにリセット
          </button>
        </section>
      </div>
    </div>
  )
}
