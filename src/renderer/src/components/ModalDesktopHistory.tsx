import { useState } from 'react'
import { useTranslateStore } from '../stores/useTranslateStore'

interface ModalDesktopHistoryProps {
  isOpen: boolean
  onClose: () => void
  onSelectTranslate: (id: string) => void
}

export function ModalDesktopHistory({
  isOpen,
  onClose,
  onSelectTranslate
}: ModalDesktopHistoryProps) {
  const { translates } = useTranslateStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  if (!isOpen) return null

  // タグの抽出
  const allTags = Array.from(
    new Set(
      translates.flatMap((t) => {
        try {
          return JSON.parse(t.tagsDump || '[]')
        } catch {
          return []
        }
      })
    )
  )

  // フィルタリング
  const filteredTranslates = translates.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.translationExcerpt || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTag =
      !selectedTag ||
      (t.tagsDump && JSON.parse(t.tagsDump || '[]').includes(selectedTag))

    return matchesSearch && matchesTag
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Translation History</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* 検索とフィルター */}
          <div className="history-controls">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search translations..."
              className="history-search"
            />

            <div className="tag-filters">
              <button
                onClick={() => setSelectedTag(null)}
                className={`tag-filter ${!selectedTag ? 'active' : ''}`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`tag-filter ${selectedTag === tag ? 'active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 履歴リスト */}
          <div className="history-list">
            {filteredTranslates.map((translate) => (
              <div
                key={translate.id}
                className="history-item"
                onClick={() => {
                  onSelectTranslate(translate.id)
                  onClose()
                }}
              >
                <div className="history-item-header">
                  <span className="history-langs">
                    {translate.sourceLang || 'Auto'} → {translate.toLang}
                  </span>
                  <span className="history-date">
                    {new Date(translate.createdAt * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="history-excerpt">
                  {translate.translationExcerpt || translate.sourceText.slice(0, 150)}
                </div>
                {translate.tagsDump && JSON.parse(translate.tagsDump || '[]').length > 0 && (
                  <div className="history-tags">
                    {JSON.parse(translate.tagsDump || '[]').map((tag: string) => (
                      <span key={tag} className="history-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {filteredTranslates.length === 0 && (
              <div className="history-empty">No translations found</div>
            )}
          </div>
        </div>

        <style>{`
          .modal-large {
            width: 90%;
            max-width: 800px;
            max-height: 85vh;
          }

          .history-controls {
            margin-bottom: 16px;
          }

          .history-search {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 12px;
            box-sizing: border-box;
          }

          .tag-filters {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .tag-filter {
            padding: 6px 12px;
            border: 1px solid #e0e0e0;
            border-radius: 16px;
            background: white;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
          }

          .tag-filter:hover {
            background: #f5f5f5;
          }

          .tag-filter.active {
            background: #2196f3;
            color: white;
            border-color: #2196f3;
          }

          .history-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 500px;
            overflow-y: auto;
          }

          .history-item {
            padding: 12px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .history-item:hover {
            background: #f5f5f5;
            border-color: #2196f3;
          }

          .history-item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
            color: #666;
          }

          .history-excerpt {
            font-size: 14px;
            color: #333;
            margin-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .history-tags {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
          }

          .history-tag {
            padding: 2px 8px;
            background: #e3f2fd;
            color: #1976d2;
            border-radius: 4px;
            font-size: 11px;
          }

          .history-empty {
            text-align: center;
            padding: 40px;
            color: #999;
          }
        `}</style>
      </div>
    </div>
  )
}
