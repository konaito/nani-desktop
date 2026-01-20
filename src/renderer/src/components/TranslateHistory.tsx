import type { BasicTranslate } from '../../types'

interface TranslateHistoryProps {
  translates: BasicTranslate[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function TranslateHistory({ translates, selectedId, onSelect }: TranslateHistoryProps) {
  return (
    <div className="translate-history">
      <h2>History</h2>
      <ul className="translate-list">
        {translates.map((translate) => (
          <li
            key={translate.id}
            className={`translate-item ${selectedId === translate.id ? 'selected' : ''}`}
            onClick={() => onSelect(translate.id)}
          >
            <div className="translate-item-header">
              <span className="translate-langs">
                {translate.sourceLang || 'Auto'} → {translate.toLang}
              </span>
              <span className="translate-date">
                {new Date(translate.createdAt * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="translate-excerpt">
              {translate.translationExcerpt || translate.sourceText.slice(0, 100)}
            </div>
            {translate.tagsDump && (
              <div className="translate-tags">{translate.tagsDump}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
