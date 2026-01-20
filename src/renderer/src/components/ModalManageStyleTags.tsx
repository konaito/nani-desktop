import { useState } from 'react'

interface ModalManageStyleTagsProps {
  isOpen: boolean
  onClose: () => void
  currentTags?: string[]
  onSave: (tags: string[]) => void
}

export function ModalManageStyleTags({
  isOpen,
  onClose,
  currentTags = [],
  onSave
}: ModalManageStyleTagsProps) {
  const [tags, setTags] = useState<string[]>(currentTags)
  const [newTag, setNewTag] = useState('')

  if (!isOpen) return null

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = () => {
    onSave(tags)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Style Tags</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="tag-input-container">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="New tag name..."
              className="tag-input"
            />
            <button onClick={handleAddTag} className="btn-add-tag">
              Add
            </button>
          </div>

          <div className="tag-list">
            {tags.map((tag) => (
              <div key={tag} className="tag-item">
                <span className="tag-name">{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="tag-remove"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </div>
            ))}
            {tags.length === 0 && (
              <div className="tag-empty">No tags yet. Create your first tag!</div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-save">
            Save Tags
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .tag-input-container {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .tag-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
        }

        .tag-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tag-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f5f5f5;
          border-radius: 6px;
        }

        .tag-name {
          font-size: 14px;
        }

        .tag-remove {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }

        .tag-remove:hover {
          color: #f44336;
        }

        .tag-empty {
          text-align: center;
          color: #999;
          padding: 20px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 16px 20px;
          border-top: 1px solid #e0e0e0;
        }

        .btn-cancel,
        .btn-save,
        .btn-add-tag {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          border: none;
        }

        .btn-cancel {
          background: #f5f5f5;
          color: #333;
        }

        .btn-save,
        .btn-add-tag {
          background: #2196f3;
          color: white;
        }
      `}</style>
    </div>
  )
}
