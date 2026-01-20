export interface WindowApi {
  getVersions: () => NodeJS.ProcessVersions
  getPlatform: () => string

  // Database
  getTranslates: () => Promise<unknown>
  getTranslateById: (id: string) => Promise<unknown>
  createTranslate: (data: unknown) => Promise<unknown>
  updateTranslate: (id: string, data: unknown) => Promise<unknown>
  deleteTranslate: (id: string) => Promise<unknown>
  getMessages: (translateId: string) => Promise<unknown>
  createMessage: (data: unknown) => Promise<unknown>

  // Settings
  getSettings: () => Promise<unknown>
  setSettings: (settings: unknown) => Promise<unknown>
  resetSettings: () => Promise<unknown>

  // Translation
  translateText: (data: unknown) => Promise<unknown>
  translateImage: (data: unknown) => Promise<unknown>
  translateFile: (filePath: string, options: unknown) => Promise<unknown>

  // OCR
  performOcr: (imagePath: string) => Promise<unknown>

  // Screen Capture
  captureScreen: () => Promise<unknown>
  captureWindow: () => Promise<unknown>

  // Window
  toggleMenuBar: () => void
  reloadWindow: () => void
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void

  // Auto Update
  checkUpdate: () => Promise<unknown>
  downloadUpdate: () => Promise<unknown>
  installUpdate: () => Promise<unknown>

  // System
  openExternal: (url: string) => Promise<unknown>

  // Mac Accessibility
  getAccessibilitySettings: () => Promise<unknown>
  openMacAccessibility: () => Promise<unknown>

  // Generic
  on: (channel: string, callback: (...args: unknown[]) => void) => void
  once: (channel: string, callback: (...args: unknown[]) => void) => void
  send: (channel: string, ...args: unknown[]) => void
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    api: WindowApi
    electron: {
      platform: string
      versions: NodeJS.ProcessVersions
    }
  }
}

// Database API
export const dbApi = {
  getTranslates: () => window.api.getTranslates(),
  getTranslateById: (id: string) => window.api.getTranslateById(id),
  createTranslate: (data: unknown) => window.api.createTranslate(data),
  updateTranslate: (id: string, data: unknown) => window.api.updateTranslate(id, data),
  deleteTranslate: (id: string) => window.api.deleteTranslate(id),
  getMessages: (translateId: string) => window.api.getMessages(translateId),
  createMessage: (data: unknown) => window.api.createMessage(data)
}

// Settings API
export const settingsApi = {
  get: () => window.api.getSettings(),
  set: (settings: unknown) => window.api.setSettings(settings),
  reset: () => window.api.resetSettings()
}

// Translation API
export const translateApi = {
  text: (data: unknown) => window.api.translateText(data),
  image: (data: unknown) => window.api.translateImage(data),
  file: (filePath: string, options: unknown) => window.api.translateFile(filePath, options)
}

// OCR API
export const ocrApi = {
  perform: (imagePath: string) => window.api.performOcr(imagePath)
}

// Screen Capture API
export const captureApi = {
  screen: () => window.api.captureScreen(),
  window: () => window.api.captureWindow()
}

// Window API
export const windowApi = {
  toggleMenuBar: () => window.api.toggleMenuBar(),
  reload: () => window.api.reloadWindow(),
  minimize: () => window.api.minimizeWindow(),
  maximize: () => window.api.maximizeWindow(),
  close: () => window.api.closeWindow()
}

// Mac Accessibility API
export const macAccessibilityApi = {
  getSettings: () => window.api.getAccessibilitySettings(),
  open: () => window.api.openMacAccessibility()
}
