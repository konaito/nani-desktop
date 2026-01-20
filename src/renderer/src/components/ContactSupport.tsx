import { useState } from 'react'

interface ContactSupportProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactSupport({ isOpen, onClose }: ContactSupportProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !message.trim()) {
      return
    }

    setSending(true)

    // TODO: 実際のサポート連携APIを実装
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSending(false)
    setSent(true)
  }

  const handleClose = () => {
    setName('')
    setEmail('')
    setMessage('')
    setSent(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>サポートに連絡</h2>
          <button className="modal-close" onClick={handleClose} aria-label="閉じる">
            ×
          </button>
        </div>

        <div className="modal-body">
          {sent ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>メッセージを送信しました</h3>
              <p>担当者から折り返しごら連絡いたします。</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">お名前 *</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田 太郎"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">メールアドレス *</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">お問い合わせ内容 *</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="ご質問やご要望をお書きください..."
                  required
                  rows={6}
                  className="form-textarea"
                />
              </div>

              <div className="form-info">
                <p>※ は必須項目です</p>
                <p>通常24時間以内にご返信いたします。</p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                  disabled={sending}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={sending || !name.trim() || !email.trim() || !message.trim()}
                >
                  {sending ? '送信中...' : '送信'}
                </button>
              </div>
            </form>
          )}
        </div>

        <style>{`
          .success-message {
            text-align: center;
            padding: 40px 20px;
          }

          .success-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 20px;
            background: #4caf50;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
          }

          .success-message h3 {
            margin: 0 0 8px 0;
            font-size: 20px;
            font-weight: 600;
          }

          .success-message p {
            margin: 0;
            color: var(--color-text-secondary);
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
            font-weight: 500;
          }

          .form-input,
          .form-textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--color-border);
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
            background: var(--color-background);
            color: var(--color-text);
            box-sizing: border-box;
          }

          .form-input:focus,
          .form-textarea:focus {
            outline: none;
            border-color: var(--color-primary);
          }

          .form-textarea {
            resize: vertical;
            min-height: 120px;
          }

          .form-info {
            margin-top: 16px;
            padding: 12px;
            background: var(--color-surface);
            border-radius: 6px;
            font-size: 12px;
          }

          .form-info p {
            margin: 4px 0;
            color: var(--color-text-secondary);
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 16px 20px;
            border-top: 1px solid var(--color-border);
          }

          .btn-secondary {
            padding: 8px 16px;
            background: var(--color-surface);
            color: var(--color-text);
            border: 1px solid var(--color-border);
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
          }

          .btn-secondary:hover:not(:disabled) {
            background: var(--color-border);
          }

          .btn-primary {
            padding: 8px 16px;
            background: var(--color-primary);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          }

          .btn-primary:hover:not(:disabled) {
            background: var(--color-primary-dark);
          }

          .btn-primary:disabled,
          .btn-secondary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  )
}
