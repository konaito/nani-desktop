import { windowApi } from '../utils/api'

export function NextActions() {
  const handleNewTranslation = () => {
    console.log('New translation')
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
      <button onClick={handleToggleMenuBar}>Toggle Menu</button>
      <button onClick={handleReload}>Reload</button>
    </div>
  )
}
