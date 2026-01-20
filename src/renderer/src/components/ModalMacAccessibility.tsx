interface ModalMacAccessibilityProps {
  isOpen: boolean
  onClose: () => void
}

export function ModalMacAccessibility({ isOpen, onClose }: ModalMacAccessibilityProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Macアクセシビリティ設定</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="accessibility-intro">
            <div className="accessibility-icon">♿</div>
            <h3>アクセシビリティ機能</h3>
            <p>
              Nani DesktopはmacOSのアクセシビリティ機能をサポートしています。
              あなたのニーズに合わせて設定を調整できます。
            </p>
          </div>

          <div className="accessibility-sections">
            <section className="accessibility-section">
              <h4>VoiceOver</h4>
              <p>
                画面読み上げ機能が有効になっている場合、Nani Desktopは自動的に
                適切なARIA属性を提供し、VoiceOverでの操作を最適化します。
              </p>
              <div className="accessibility-status">
                <span className="status-label">状態:</span>
                <span className="status-value">自動検出</span>
              </div>
            </section>

            <section className="accessibility-section">
              <h4>Reduce Motion（動作を減らす）</h4>
              <p>
                アニメーションやモーションエフェクトを減らして、目の負担を軽減します。
                システム設定で「動作を減らす」が有効な場合、自動的に適用されます。
              </p>
              <div className="accessibility-status">
                <span className="status-label">状態:</span>
                <span className="status-value">システム設定に連動</span>
              </div>
            </section>

            <section className="accessibility-section">
              <h4>High Contrast（コントラストを上げる）</h4>
              <p>
                UI要素のコントラストを向上させ、視認性を高めます。
                色覚多様性のあるユーザーにとってより見やすくなります。
              </p>
              <div className="accessibility-status">
                <span className="status-label">状態:</span>
                <span className="status-value">システム設定に連動</span>
              </div>
            </section>

            <section className="accessibility-section">
              <h4>キーボードナビゲーション</h4>
              <p>
                すべての機能をマウスなしで操作できます。Tabキーでフォーカスを移動し、
                Enter/Spaceキーでアクションを実行します。
              </p>
              <div className="accessibility-status">
                <span className="status-label">状態:</span>
                <span className="status-value">常時有効</span>
              </div>
            </section>

            <section className="accessibility-section">
              <h4>フォントサイズ</h4>
              <p>
                システムのフォントサイズ設定に応じて、アプリ内のテキストサイズが
                自動的に調整されます。
              </p>
              <div className="accessibility-status">
                <span className="status-label">状態:</span>
                <span className="status-value">システム設定に連動</span>
              </div>
            </section>
          </div>

          <div className="accessibility-tips">
            <h4>💡 操作のヒント</h4>
            <ul>
              <li><kbd>Tab</kbd> - 次の要素にフォーカス</li>
              <li><kbd>Shift+Tab</kbd> - 前の要素にフォーカス</li>
              <li><kbd>Enter</kbd>/<kbd>Space</kbd> - ボタンやリンクをアクティブ化</li>
              <li><kbd>Escape</kbd> - モーダルを閉じる</li>
              <li><kbd>Cmd/Ctrl+N</kbd> - 新規翻訳</li>
              <li><kbd>Cmd/Ctrl+H</kbd> - 履歴を開く</li>
            </ul>
          </div>

          <div className="modal-footer">
            <button
              onClick={onClose}
              className="btn-primary"
            >
              閉じる
            </button>
          </div>
        </div>

        <style>{`
          .accessibility-intro {
            text-align: center;
            padding: 24px;
            background: var(--color-surface);
            border-radius: 12px;
            margin-bottom: 24px;
          }

          .accessibility-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }

          .accessibility-intro h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
          }

          .accessibility-intro p {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: 14px;
            line-height: 1.6;
          }

          .accessibility-sections {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .accessibility-section {
            padding: 16px;
            background: var(--color-surface);
            border-radius: 8px;
            border: 1px solid var(--color-border);
          }

          .accessibility-section h4 {
            margin: 0 0 8px 0;
            font-size: 15px;
            font-weight: 600;
          }

          .accessibility-section p {
            margin: 0 0 8px 0;
            font-size: 13px;
            line-height: 1.6;
            color: var(--color-text-secondary);
          }

          .accessibility-status {
            display: flex;
            gap: 8px;
            font-size: 12px;
          }

          .status-label {
            font-weight: 500;
          }

          .status-value {
            color: var(--color-primary);
            font-weight: 500;
          }

          .accessibility-tips {
            margin-top: 20px;
            padding: 16px;
            background: var(--color-primary-light);
            background: var(--color-surface);
            border-radius: 8px;
            border: 1px solid var(--color-border);
          }

          .accessibility-tips h4 {
            margin: 0 0 12px 0;
            font-size: 15px;
            font-weight: 600;
          }

          .accessibility-tips ul {
            margin: 0;
            padding: 0;
            list-style: none;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .accessibility-tips li {
            font-size: 13px;
            color: var(--color-text-secondary);
          }

          .accessibility-tips kbd {
            display: inline-block;
            padding: 2px 6px;
            background: var(--color-background);
            border: 1px solid var(--color-border);
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            margin-right: 4px;
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
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
            transition: background 0.2s;
          }

          .btn-primary:hover {
            background: var(--color-primary-dark);
          }
        `}</style>
      </div>
    </div>
  )
}
