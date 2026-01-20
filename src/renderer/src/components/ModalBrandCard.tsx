import { useState } from 'react'

interface ModalBrandCardProps {
  isOpen: boolean
  onClose: () => void
}

export function ModalBrandCard({ isOpen, onClose }: ModalBrandCardProps) {
  const [email, setEmail] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    // TODO: ブランドカード登録APIを実装
    console.log('Brand card registration:', email)
    setEmail('')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>ブランドカード登録</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="brand-card-intro">
            <div className="brand-card-icon">🎴</div>
            <h3>ブランドカードとは？</h3>
            <p>
              ブランドカードに登録すると、翻訳結果に独自のスタイルや用語集を適用できます。
              チームで共有して、統一された翻訳スタイルを維持しましょう。
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="form-input"
              />
              <p className="form-hint">
                登録用のURLを送信します
              </p>
            </div>

            <div className="form-info">
              <h4>ブランドカードの機能</h4>
              <ul>
                <li>✓ 翻訳用語集の管理</li>
                <li>✓ 独自スタイルの適用</li>
                <li>✓ チーム共有機能</li>
                <li>✓ 翻訳メモリの保存</li>
              </ul>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!email.trim()}
              >
                登録URLを送信
              </button>
            </div>
          </form>
        </div>

        <style>{`
          .brand-card-intro {
            text-align: center;
            padding: 24px;
            background: var(--color-surface);
            border-radius: 12px;
            margin-bottom: 20px;
          }

          .brand-card-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }

          .brand-card-intro h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
          }

          .brand-card-intro p {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: 14px;
            line-height: 1.6;
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

          .form-input {
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

          .form-input:focus {
            outline: none;
            border-color: var(--color-primary);
          }

          .form-hint {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: var(--color-text-secondary);
          }

          .form-info {
            margin: 16px 0;
            padding: 12px;
            background: var(--color-surface);
            border-radius: 6px;
            font-size: 13px;
          }

          .form-info h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
          }

          .form-info ul {
            margin: 0;
            padding-left: 20px;
            list-style: none;
          }

          .form-info li {
            margin: 4px 0;
            color: var(--color-text-secondary);
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 20px;
          }

          .btn-secondary,
          .btn-primary {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-secondary {
            background: var(--color-surface);
            color: var(--color-text);
            border: 1px solid var(--color-border);
          }

          .btn-secondary:hover {
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

          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  )
}
