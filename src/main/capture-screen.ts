import { BrowserWindow, desktopCapturer, ipcMain, screen } from 'electron'

interface CaptureResult {
  type: 'success' | 'canceled' | 'error'
  buffer?: Buffer
  message?: string
}

interface SelectionResult {
  type: 'selected' | 'canceled'
  displayId?: number
  rect?: { x: number; y: number; width: number; height: number }
}

let isCapturing = false

export async function captureScreenRegionElectron(): Promise<CaptureResult> {
  if (isCapturing) {
    return { type: 'canceled' }
  }

  isCapturing = true

  try {
    const result = await showSelectionOverlay()

    if (result.type === 'canceled') {
      return { type: 'canceled' }
    }

    if (result.type === 'error') {
      return { type: 'error', message: result.message }
    }

    const buffer = await captureDisplay(result.displayId!, result.rect!)
    await smallDelay()

    return { type: 'success', buffer }
  } catch (error) {
    return {
      type: 'error',
      message: error instanceof Error ? error.message : String(error)
    }
  } finally {
    isCapturing = false
  }
}

async function showSelectionOverlay(): Promise<SelectionResult> {
  return new Promise((resolve) => {
    const displays = screen.getAllDisplays()

    if (displays.length === 0) {
      resolve({ type: 'canceled' })
      return
    }

    const overlayWindows: BrowserWindow[] = []

    // Create overlay windows for each display
    for (const display of displays) {
      const overlayWindow = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        frame: false,
        transparent: true,
        resizable: false,
        movable: false,
        show: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })

      overlayWindow.on('closed', () => {
        // Window was closed, cancel capture
        overlayWindows.length > 0 &&
          overlayWindows.forEach((w) => {
            if (!w.isDestroyed()) w.close()
          })
        resolve({ type: 'canceled' })
      })

      overlayWindows.push(overlayWindow)

      // Load capture overlay
      overlayWindow.loadFile('../resources/capture-overlay.html').then(() => {
        overlayWindow.show()
        overlayWindow.focus()
      })
    }

    // Listen for selection completion
    ipcMain.once('overlay-selection-finished', (_event, data) => {
      overlayWindows.forEach((w) => {
        if (!w.isDestroyed()) w.close()
      })
      resolve({
        type: 'selected',
        displayId: data.displayId,
        rect: data.rect
      })
    })

    ipcMain.once('overlay-selection-canceled', () => {
      overlayWindows.forEach((w) => {
        if (!w.isDestroyed()) w.close()
      })
      resolve({ type: 'canceled' })
    })

    // Timeout after 60 seconds
    setTimeout(() => {
      if (overlayWindows.some((w) => !w.isDestroyed())) {
        overlayWindows.forEach((w) => {
          if (!w.isDestroyed()) w.close()
        })
        resolve({ type: 'canceled' })
      }
    }, 60000)
  })
}

async function captureDisplay(displayId: number, rect: { x: number; y: number; width: number; height: number }): Promise<Buffer> {
  const display = screen.getAllDisplays().find((d) => d.id === displayId)

  if (!display) {
    throw new Error('Display not found')
  }

  const scaleFactor = display.scaleFactor || 1
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: display.size.width * scaleFactor,
      height: display.size.height * scaleFactor
    }
  })

  if (sources.length === 0) {
    throw new Error('No screen sources available')
  }

  const source = sources[0]

  if (source.thumbnail.isEmpty()) {
    throw new Error('Captured thumbnail was empty')
  }

  const cropRect = {
    x: Math.round(rect.x * scaleFactor),
    y: Math.round(rect.y * scaleFactor),
    width: Math.max(1, Math.round(rect.width * scaleFactor)),
    height: Math.max(1, Math.round(rect.height * scaleFactor))
  }

  return source.thumbnail.crop(cropRect).toPNG()
}

function smallDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 80))
}
