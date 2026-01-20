import { windowApi } from '../utils/api'

interface NextActionsProps {
  onOpenSettings: () => void
  onOpenHistory: () => void
  onNewTranslate: () => void
}

export function NextActions({ onOpenSettings, onOpenHistory, onNewTranslate }: NextActionsProps) {
  const handleNewTranslation = () => {
    onNewTranslate()
  }

  const handleToggleMenuBar = async () => {
    await windowApi.toggleMenuBar()
  }

  const handleReload = async () => {
    await windowApi.reload()
  }

  return (
    <div className="next-actions">
      <button onClick={handleNewTranslation}>New</button>
      <button onClick={onOpenSettings}>Settings</button>
      <button onClick={onOpenHistory}>History</button>
      <button onClick={handleToggleMenuBar}>Toggle Menu</button>
      <button onClick={handleReload}>Reload</button>
    </div>
  )
}
