import { useState, useRef } from 'react'
import { captureApi, translateApi } from '../utils/api'
import { optimizeImage, formatImageSize, type OptimizeImageResult } from '../utils/optimize-image'

interface UploadOptions {
  type: 'screenshot' | 'image' | 'pdf' | 'text'
  targetLang?: string
  optimize?: boolean
}

interface UploadProgress {
  loaded: number
  total: number
  stage: 'reading' | 'optimizing' | 'uploading' | 'translating'
}

export function QuickUploadHandler() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (options: UploadOptions = { type: 'screenshot' }) => {
    try {
      setUploading(true)

      switch (options.type) {
        case 'screenshot':
          await handleScreenshot(options.targetLang)
          break
        case 'image':
          await handleImageFile(options.targetLang, options.optimize)
          break
        case 'pdf':
          await handlePdfFile(options.targetLang)
          break
        case 'text':
          await handleTextFile(options.targetLang)
          break
      }
    } catch (error) {
      console.error('Upload failed:', error)
      // TODO: エラー通知を表示
    } finally {
      setUploading(false)
      setProgress(null)
    }
  }

  const handleScreenshot = async (targetLang = 'en') => {
    setProgress({ loaded: 0, total: 100, stage: 'uploading' })
    const result = (await captureApi.screen()) as string
    if (result) {
      setProgress({ loaded: 50, total: 100, stage: 'translating' })
      await translateApi.image({
        imageData: Buffer.from(result, 'base64'),
        targetLang
      })
      setProgress({ loaded: 100, total: 100, stage: 'translating' })
    }
  }

  const handleImageFile = async (targetLang = 'en', optimize = true) => {
    const files = fileInputRef.current?.files
    if (!files || files.length === 0) return

    const file = files[0]

    // 画像のプレビュー
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    setProgress({ loaded: 0, total: 100, stage: 'reading' })

    let imageFile = file

    // 画像最適化
    if (optimize) {
      setProgress({ loaded: 25, total: 100, stage: 'optimizing' })
      const optimized = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'image/jpeg'
      })
      imageFile = optimized.blob as any
      console.log(`Image optimized: ${formatImageSize(optimized.originalSize)} → ${formatImageSize(optimized.optimizedSize)} (${optimized.compressionRatio.toFixed(1)}% reduction)`)
    }

    setProgress({ loaded: 50, total: 100, stage: 'uploading' })
    const base64 = await fileToBase64(imageFile)
    setProgress({ loaded: 75, total: 100, stage: 'translating' })

    await translateApi.image({
      imageData: Buffer.from(base64, 'base64'),
      targetLang
    })
    setProgress({ loaded: 100, total: 100, stage: 'translating' })

    // クリーンアップ
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handlePdfFile = async (targetLang = 'en') => {
    const files = fileInputRef.current?.files
    if (!files || files.length === 0) return

    const file = files[0]
    setProgress({ loaded: 0, total: 100, stage: 'reading' })

    // PDFをメインプロセスで処理
    const base64 = await fileToBase64(file)
    setProgress({ loaded: 50, total: 100, stage: 'translating' })

    const result = await window.api.translateFile(base64, { targetLang }) as { success?: boolean; error?: string }
    if (result?.success) {
      setProgress({ loaded: 100, total: 100, stage: 'translating' })
    } else {
      throw new Error(result?.error || 'Failed to translate PDF')
    }
  }

  const handleTextFile = async (targetLang = 'en') => {
    const files = fileInputRef.current?.files
    if (!files || files.length === 0) return

    const file = files[0]
    setProgress({ loaded: 0, total: 100, stage: 'reading' })

    const text = await file.text()
    setProgress({ loaded: 50, total: 100, stage: 'translating' })

    const result = await translateApi.text({
      text,
      sourceLang: 'auto',
      targetLang
    }) as { success?: boolean; error?: string }
    if (result.success) {
      setProgress({ loaded: 100, total: 100, stage: 'translating' })
    } else {
      throw new Error(result.error || 'Failed to translate text')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const fileType = file.type

      // ファイルタイプを判定して適切な処理を実行
      if (fileType.startsWith('image/')) {
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          fileInputRef.current.files = dataTransfer.files
          await handleFileUpload({ type: 'image' })
        }
      } else if (fileType === 'application/pdf') {
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          fileInputRef.current.files = dataTransfer.files
          await handleFileUpload({ type: 'pdf' })
        }
      } else if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          fileInputRef.current.files = dataTransfer.files
          await handleFileUpload({ type: 'text' })
        }
      } else {
        console.warn('Unsupported file type:', fileType)
        // TODO: サポート外ファイルタイプの通知
      }
    }
  }

  const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const getProgressLabel = (stage: UploadProgress['stage']) => {
    switch (stage) {
      case 'reading': return '読み込み中...'
      case 'optimizing': return '最適化中...'
      case 'uploading': return 'アップロード中...'
      case 'translating': return '翻訳中...'
    }
  }

  const getProgressPercentage = () => {
    if (!progress) return 0
    return Math.round((progress.loaded / progress.total) * 100)
  }

  return (
    <div className={`quick-upload-handler ${dragActive ? 'drag-active' : ''}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.txt"
        style={{ display: 'none' }}
        onChange={() => handleFileUpload({ type: 'image' })}
      />

      {/* ドラッグ＆ドロップエリア */}
      <div
        className="drop-zone"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading && progress ? (
          <div className="upload-progress">
            <div className="progress-spinner" />
            <p className="progress-label">{getProgressLabel(progress.stage)}</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <p className="progress-percentage">{getProgressPercentage()}%</p>
          </div>
        ) : (
          <div className="drop-content">
            <div className="drop-icon">📁</div>
            <h3>ファイルをドロップ</h3>
            <p>またはクリックして選択</p>
            <div className="drop-formats">
              <span className="format-badge">画像</span>
              <span className="format-badge">PDF</span>
              <span className="format-badge">テキスト</span>
            </div>
          </div>
        )}
      </div>

      {/* クイックアクションボタン */}
      <div className="quick-actions">
        <button
          className="action-btn screenshot-btn"
          onClick={() => handleFileUpload({ type: 'screenshot' })}
          disabled={uploading}
          title="スクリーンショット"
        >
          <span className="btn-icon">📸</span>
          <span className="btn-label">スクリーンショット</span>
        </button>
        <button
          className="action-btn file-btn"
          onClick={() => !uploading && fileInputRef.current?.click()}
          disabled={uploading}
          title="ファイルをアップロード"
        >
          <span className="btn-icon">📄</span>
          <span className="btn-label">ファイル</span>
        </button>
      </div>

      {/* プレビュー */}
      {previewUrl && !uploading && (
        <div className="upload-preview">
          <img src={previewUrl} alt="Preview" />
          <button
            className="preview-close"
            onClick={() => {
              URL.revokeObjectURL(previewUrl)
              setPreviewUrl(null)
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        .quick-upload-handler {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .drop-zone {
          border: 2px dashed var(--color-border);
          border-radius: 12px;
          padding: 32px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: var(--color-surface);
        }

        .drop-zone:hover {
          border-color: var(--color-primary);
          background: var(--color-surface-hover);
        }

        .drop-zone.drag-active {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
          background: var(--color-surface);
        }

        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .drop-icon {
          font-size: 48px;
          margin-bottom: 8px;
        }

        .drop-content h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .drop-content p {
          margin: 0;
          font-size: 13px;
          color: var(--color-text-secondary);
        }

        .drop-formats {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }

        .format-badge {
          padding: 4px 10px;
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .progress-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .progress-label {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }

        .progress-bar {
          width: 100%;
          max-width: 200px;
          height: 6px;
          background: var(--color-border);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--color-primary);
          transition: width 0.3s ease;
        }

        .progress-percentage {
          margin: 0;
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 16px 12px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover:not(:disabled) {
          background: var(--color-surface-hover);
          border-color: var(--color-primary);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 24px;
        }

        .btn-label {
          font-size: 12px;
          font-weight: 500;
        }

        .upload-preview {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--color-border);
        }

        .upload-preview img {
          width: 100%;
          height: auto;
          display: block;
        }

        .preview-close {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .preview-close:hover {
          background: rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  )
}
