import { useState } from 'react'
import { useTranslateStore } from '../stores/useTranslateStore'
import { translateApi } from '../utils/api'

interface NestedBasicModeChatProps {
  translateId: string
}

export function NestedBasicModeChat({ translateId }: NestedBasicModeChatProps) {
  const { translate, messages, addMessage } = useTranslateStore()
  const [inputText, setInputText] = useState('')
  const [translating, setTranslating] = useState(false)
  const [fromLang, setFromLang] = useState('auto')
  const [toLang, setToLang] = useState('en')

  const currentTranslate = translate
  const currentMessages = messages

  const handleSendMessage = async () => {
    if (!inputText.trim() || translating) return

    const userMessage = inputText.trim()
    setInputText('')

    // ユーザーメッセージを追加
    await addMessage(translateId, {
      role: 'user',
      content: userMessage
    })

    // 翻訳を実行
    setTranslating(true)
    try {
      const result = await translateApi.text({
        text: userMessage,
        sourceLang: fromLang,
        targetLang: toLang
      }) as { success?: boolean; translation?: string; error?: string }

      if (result.success && result.translation) {
        await addMessage(translateId, {
          role: 'assistant',
          content: result.translation
        })
      } else {
        await addMessage(translateId, {
          role: 'system',
          content: `エラー: ${result.error || '翻訳に失敗しました'}`
        })
      }
    } catch (error) {
      await addMessage(translateId, {
        role: 'system',
        content: `エラー: ${error instanceof Error ? error.message : '不明なエラー'}`
      })
    } finally {
      setTranslating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="nested-chat">
      <div className="chat-header">
        <div className="chat-languages">
          <select
            value={fromLang}
            onChange={(e) => setFromLang(e.target.value)}
            className="lang-select"
          >
            <option value="auto">自動検出</option>
            <option value="en">英語</option>
            <option value="ja">日本語</option>
            <option value="ko">韓国語</option>
            <option value="zh">中国語</option>
          </select>
          <span>→</span>
          <select
            value={toLang}
            onChange={(e) => setToLang(e.target.value)}
            className="lang-select"
          >
            <option value="en">英語</option>
            <option value="ja">日本語</option>
            <option value="ko">韓国語</option>
            <option value="zh">中国語</option>
            <option value="es">スペイン語</option>
            <option value="fr">フランス語</option>
            <option value="de">ドイツ語</option>
          </select>
        </div>
      </div>

      <div className="chat-messages">
        {currentMessages.length === 0 ? (
          <div className="chat-empty">
            <p>翻訳を開始してください</p>
          </div>
        ) : (
          currentMessages.map((message) => (
            <div key={message.id} className={`chat-message chat-message-${message.role}`}>
              <div className="message-avatar">
                {message.role === 'user' ? '👤' : message.role === 'assistant' ? '🤖' : '⚙️'}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-time">
                  {new Date(message.createdAt * 1000).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {translating && (
          <div className="chat-message chat-message-assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-loading">
                <div className="spinner" />
                <p>翻訳中...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="翻訳したいテキストを入力..."
          className="chat-textarea"
          rows={3}
          disabled={translating}
        />
        <div className="chat-actions">
          <span className="char-count">{inputText.length} 文字</span>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || translating}
            className="btn-send"
          >
            {translating ? '翻訳中...' : '翻訳'}
          </button>
        </div>
      </div>

      <style>{`
        .nested-chat {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--color-background);
        }

        .chat-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-surface);
        }

        .chat-languages {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lang-select {
          padding: 6px 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 14px;
          background: var(--color-background);
          color: var(--color-text);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-empty {
          text-align: center;
          padding: 40px 20px;
          color: var(--color-text-secondary);
        }

        .chat-message {
          display: flex;
          gap: 8px;
          max-width: 80%;
        }

        .chat-message-user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .chat-message-assistant {
          align-self: flex-start;
        }

        .chat-message-system {
          align-self: center;
          max-width: 100%;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .chat-message-user .message-avatar {
          background: var(--color-primary);
        }

        .chat-message-assistant .message-avatar {
          background: var(--color-secondary);
        }

        .message-content {
          flex: 1;
        }

        .chat-message-user .message-content {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .message-text {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .chat-message-user .message-text {
          background: var(--color-primary);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .chat-message-assistant .message-text {
          background: var(--color-surface);
          color: var(--color-text);
          border: 1px solid var(--color-border);
          border-bottom-left-radius: 4px;
        }

        .chat-message-system .message-text {
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 12px;
          text-align: center;
        }

        .message-time {
          font-size: 11px;
          color: var(--color-text-secondary);
          margin-top: 4px;
        }

        .message-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          border-bottom-left-radius: 4px;
        }

        .chat-input-container {
          padding: 12px 16px;
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
        }

        .chat-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          background: var(--color-background);
          color: var(--color-text);
        }

        .chat-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .chat-textarea:disabled {
          opacity: 0.6;
        }

        .chat-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }

        .char-count {
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .btn-send {
          padding: 8px 16px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-send:hover:not(:disabled) {
          background: var(--color-primary-dark);
        }

        .btn-send:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
