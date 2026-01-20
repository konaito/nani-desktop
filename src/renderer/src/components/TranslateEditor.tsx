import { useState } from 'react'
import { useTranslateStore } from '../stores/useTranslateStore'
import { translateApi } from '../utils/api'

interface TranslateEditorProps {
  translateId: string
}

export function TranslateEditor({ translateId }: TranslateEditorProps) {
  const { translate, messages, updateTranslate } = useTranslateStore()
  const [editingStyle, setEditingStyle] = useState(false)
  const [customStyle, setCustomStyle] = useState('')
  const [saving, setSaving] = useState(false)

  const currentTranslate = translate
  const currentMessages = messages

  if (!currentTranslate) {
    return (
      <div className="translate-editor empty">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>翻訳が選択されていません</h3>
          <p>左側の履歴から翻訳を選択するか、新規作成してください</p>
        </div>
      </div>
    )
  }

  const handleSaveStyle = async () => {
    setSaving(true)
    try {
      await updateTranslate(translateId, {
        customStyleInstruction: customStyle
      })
      setEditingStyle(false)
    } catch (error) {
      console.error('Failed to save custom style:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCopyTranslation = () => {
    if (currentTranslate.translationExcerpt) {
      navigator.clipboard.writeText(currentTranslate.translationExcerpt)
      // TODO: トースト通知を表示
    }
  }

  const handleCopySource = () => {
    navigator.clipboard.writeText(currentTranslate.sourceText)
    // TODO: トースト通知を表示
  }

  const handleRetryTranslation = async () => {
    // TODO: 再翻訳を実装
    console.log('Retry translation')
  }

  return (
    <div className="translate-editor">
      {/* ヘッダー */}
      <div className="translate-editor-header">
        <div className="header-left">
          <h3>翻訳詳細</h3>
          <div className="translate-meta">
            <span className="lang-pair">
              {currentTranslate.sourceLang || '自動検出'} → {currentTranslate.toLang}
            </span>
            {currentTranslate.usedModel && (
              <span className="model-badge">{currentTranslate.usedModel}</span>
            )}
            {currentTranslate.tagsDump && currentTranslate.tagsDump.length > 0 && (
              <div className="tags">
                {(() => {
                  try {
                    const tags = typeof currentTranslate.tagsDump === 'string'
                      ? JSON.parse(currentTranslate.tagsDump)
                      : currentTranslate.tagsDump
                    return (tags as string[]).map((tag: string, index: number) => (
                      <span key={index} className="tag">{tag}</span>
                    ))
                  } catch {
                    return null
                  }
                })()}
              </div>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={handleRetryTranslation}
            title="再翻訳"
          >
            🔄
          </button>
          <button
            className="icon-btn"
            onClick={handleCopyTranslation}
            title="翻訳をコピー"
          >
            📋
          </button>
        </div>
      </div>

      {/* ソーステキスト */}
      <div className="translate-section source-section">
        <div className="section-header">
          <h4>元テキスト</h4>
          <button
            className="copy-btn"
            onClick={handleCopySource}
            title="コピー"
          >
            コピー
          </button>
        </div>
        <div className="section-content">
          <p className="source-text">{currentTranslate.sourceText}</p>
          <div className="text-meta">
            <span className="char-count">
              {currentTranslate.sourceText.length} 文字
            </span>
          </div>
        </div>
      </div>

      {/* 翻訳結果 */}
      {currentTranslate.translationExcerpt && (
        <div className="translate-section translation-section">
          <div className="section-header">
            <h4>翻訳結果</h4>
            <button
              className="copy-btn"
              onClick={handleCopyTranslation}
              title="コピー"
            >
              コピー
            </button>
          </div>
          <div className="section-content">
            <p className="translation-text">{currentTranslate.translationExcerpt}</p>
            <div className="text-meta">
              <span className="char-count">
                {currentTranslate.translationExcerpt.length} 文字
              </span>
            </div>
          </div>
        </div>
      )}

      {/* メッセージ履歴 */}
      {currentMessages.length > 0 && (
        <div className="translate-section messages-section">
          <div className="section-header">
            <h4>会話履歴</h4>
            <span className="message-count">{currentMessages.length}件</span>
          </div>
          <div className="messages-list">
            {currentMessages.map((msg, index) => (
              <div key={msg.id} className={`message-item message-${msg.role}`}>
                <div className="message-header">
                  <span className="message-avatar">
                    {msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '⚙️'}
                  </span>
                  <span className="message-role">
                    {msg.role === 'user' ? 'ユーザー' : msg.role === 'assistant' ? 'アシスタント' : 'システム'}
                  </span>
                  <span className="message-time">
                    {new Date(msg.createdAt * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="message-body">{msg.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* カスタムスタイル */}
      <div className="translate-section style-section">
        <div className="section-header">
          <h4>カスタム指示</h4>
          {!editingStyle && currentTranslate.customStyleInstruction && (
            <button
              className="edit-btn"
              onClick={() => {
                setCustomStyle(currentTranslate.customStyleInstruction || '')
                setEditingStyle(true)
              }}
            >
              編集
            </button>
          )}
        </div>
        <div className="section-content">
          {editingStyle ? (
            <div className="style-editor">
              <textarea
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                placeholder="例：丁寧な言葉遣いで翻訳してください。専門用語は英語のままにしてください。"
                className="style-textarea"
                rows={4}
              />
              <div className="style-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingStyle(false)
                    setCustomStyle('')
                  }}
                  disabled={saving}
                >
                  キャンセル
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSaveStyle}
                  disabled={saving || !customStyle.trim()}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          ) : currentTranslate.customStyleInstruction ? (
            <p className="style-text">{currentTranslate.customStyleInstruction}</p>
          ) : (
            <div className="style-empty">
              <p>カスタム指示がありません</p>
              <button
                className="btn-add-style"
                onClick={() => setEditingStyle(true)}
              >
                + 追加
              </button>
            </div>
          )}
        </div>
      </div>

      {/* メタデータ */}
      <div className="translate-section metadata-section">
        <div className="section-header">
          <h4>メタデータ</h4>
        </div>
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">作成日時</span>
            <span className="metadata-value">
              {new Date(currentTranslate.createdAt * 1000).toLocaleString()}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">更新日時</span>
            <span className="metadata-value">
              {new Date((currentTranslate.updatedAt || currentTranslate.createdAt) * 1000).toLocaleString()}
            </span>
          </div>
          {currentTranslate.usedModel && (
            <div className="metadata-item">
              <span className="metadata-label">使用モデル</span>
              <span className="metadata-value">{currentTranslate.usedModel}</span>
            </div>
          )}
          {currentTranslate.id && (
            <div className="metadata-item">
              <span className="metadata-label">ID</span>
              <span className="metadata-value monospace">{currentTranslate.id}</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .translate-editor {
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
          overflow-y: auto;
        }

        .translate-editor.empty {
          align-items: center;
          justify-content: center;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .empty-state p {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 14px;
        }

        .translate-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px;
          background: var(--color-surface);
          border-radius: 8px;
          border: 1px solid var(--color-border);
        }

        .header-left h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .translate-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .lang-pair {
          font-size: 13px;
          color: var(--color-text-secondary);
        }

        .model-badge {
          padding: 2px 8px;
          background: var(--color-primary);
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .tags {
          display: flex;
          gap: 4px;
        }

        .tag {
          padding: 2px 8px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          font-size: 11px;
        }

        .header-actions {
          display: flex;
          gap: 4px;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: var(--color-surface-hover);
        }

        .translate-section {
          background: var(--color-surface);
          border-radius: 8px;
          border: 1px solid var(--color-border);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--color-background);
          border-bottom: 1px solid var(--color-border);
        }

        .section-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .copy-btn,
        .edit-btn {
          padding: 4px 12px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .copy-btn:hover,
        .edit-btn:hover {
          background: var(--color-surface-hover);
        }

        .message-count {
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .section-content {
          padding: 16px;
        }

        .source-text,
        .translation-text {
          margin: 0;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .text-meta {
          margin-top: 8px;
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message-item {
          padding: 12px;
          background: var(--color-background);
          border-radius: 6px;
          border: 1px solid var(--color-border);
        }

        .message-item.message-user {
          border-left: 3px solid var(--color-primary);
        }

        .message-item.message-assistant {
          border-left: 3px solid var(--color-secondary);
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .message-avatar {
          font-size: 14px;
        }

        .message-role {
          font-size: 12px;
          font-weight: 600;
        }

        .message-time {
          margin-left: auto;
          font-size: 11px;
          color: var(--color-text-secondary);
        }

        .message-body {
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .style-editor {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .style-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
          background: var(--color-background);
          color: var(--color-text);
        }

        .style-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .style-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .btn-secondary,
        .btn-primary {
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: var(--color-surface);
          color: var(--color-text);
          border: 1px solid var(--color-border);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--color-surface-hover);
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
          border: none;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-primary-dark);
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .style-text {
          margin: 0;
          line-height: 1.6;
          font-style: italic;
          color: var(--color-text-secondary);
        }

        .style-empty {
          text-align: center;
          padding: 20px;
        }

        .style-empty p {
          margin: 0 0 12px 0;
          color: var(--color-text-secondary);
          font-size: 13px;
        }

        .btn-add-style {
          padding: 6px 16px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .metadata-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metadata-label {
          font-size: 11px;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .metadata-value {
          font-size: 13px;
        }

        .metadata-value.monospace {
          font-family: monospace;
          font-size: 11px;
        }

        @media (max-width: 768px) {
          .metadata-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
