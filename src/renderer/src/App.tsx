import { useEffect, useState } from 'react'
import { useTranslateStore } from './stores/useTranslateStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { TranslateHistory } from './components/TranslateHistory'
import { TranslateEditor } from './components/TranslateEditor'
import { QuickUploadHandler } from './components/QuickUploadHandler'
import { NextActions } from './components/NextActions'
import { Settings } from './pages/Settings'
import { ModalDesktopHistory } from './components/ModalDesktopHistory'
import { ModalManageStyleTags } from './components/ModalManageStyleTags'
import { ContactSupport } from './components/ContactSupport'
import './styles/globals.css'

function App() {
  const { translates, loading, error, fetchTranslates } = useTranslateStore()
  const { settings, loadSettings } = useSettingsStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [showSupport, setShowSupport] = useState(false)

  useEffect(() => {
    // 初期化
    fetchTranslates()
    loadSettings()

    // テーマ適用
    if (settings.theme === 'dark' || (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    // キーボードショートカット
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + ,: 設定
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setShowSettings(true)
      }
      // Cmd/Ctrl + H: 履歴
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault()
        setShowHistoryModal(true)
      }
      // Cmd/Ctrl + N: 新規翻訳
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setSelectedId(null)
      }
      // ESC: モーダルを閉じる
      if (e.key === 'Escape') {
        setShowSettings(false)
        setShowHistoryModal(false)
        setShowTagsModal(false)
        setShowSupport(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settings.theme])

  if (showSettings) {
    return (
      <div className="app-container">
        <Settings onClose={() => setShowSettings(false)} />
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <img src="/resources/icon.png" alt="Nani" className="app-icon" />
          <h1>Nani!?</h1>
        </div>
        <div className="app-header-right">
          <QuickUploadHandler />
          <NextActions
            onOpenSettings={() => setShowSettings(true)}
            onOpenHistory={() => setShowHistoryModal(true)}
            onNewTranslate={() => setSelectedId(null)}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button onClick={() => fetchTranslates()}>再試行</button>
          </div>
        )}

        {loading && translates.length === 0 ? (
          <div className="loading-container">
            <div className="spinner" aria-label="読み込み中" />
            <p>翻訳履歴を読み込んでいます...</p>
          </div>
        ) : (
          <div className="app-content">
            <TranslateHistory
              translates={translates as any}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            {selectedId ? (
              <TranslateEditor translateId={selectedId} />
            ) : (
              <div className="empty-state">
                <img src="/resources/icon.png" alt="" className="empty-icon" />
                <h2>翻訳を選択してください</h2>
                <p>左側の履歴から翻訳を選択するか、新規翻訳を作成してください</p>
                <button
                  className="btn-primary"
              onClick={() => {/* TODO: 新規翻訳作成 */}}
                >
                  新規翻訳
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showHistoryModal && (
        <ModalDesktopHistory
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          onSelectTranslate={setSelectedId}
        />
      )}

      {showTagsModal && (
        <ModalManageStyleTags
          isOpen={showTagsModal}
          onClose={() => setShowTagsModal(false)}
          currentTags={selectedId ? translates.find(t => t.id === selectedId)?.tags : []}
          onSave={(tags) => {
            // TODO: タグ保存
            console.log('Saving tags:', tags)
          }}
        />
      )}

      {showSupport && (
        <ContactSupport
          isOpen={showSupport}
          onClose={() => setShowSupport(false)}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <span>© 2025 Nani Desktop v1.0.59</span>
        <button onClick={() => setShowSupport(true)} className="text-link">
          サポートに連絡
        </button>
      </footer>
    </div>
  )
}

export default App
