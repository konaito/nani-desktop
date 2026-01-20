import { IPC_CHANNELS } from '../../types/ipc'

export interface WindowApi {
  getVersions: () => NodeJS.ProcessVersions
  getPlatform: () => string
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

export class ElectronAPI {
  static async invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
    return window.api.invoke(channel, ...args) as Promise<T>
  }

  static send(channel: string, ...args: unknown[]): void {
    window.api.send(channel, ...args)
  }

  static on(channel: string, callback: (...args: unknown[]) => void): void {
    window.api.on(channel, callback)
  }

  static once(channel: string, callback: (...args: unknown[]) => void): void {
    window.api.once(channel, callback)
  }

  static off(channel: string): void {
    window.api.removeAllListeners(channel)
  }
}

// Database API
export const dbApi = {
  getTranslates: () => ElectronAPI.invoke(IPC_CHANNELS.DB_GET_TRANSLATES),
  getTranslateById: (id: string) =>
    ElectronAPI.invoke(IPC_CHANNELS.DB_GET_TRANSLATE_BY_ID, id),
  createTranslate: (data: unknown) =>
    ElectronAPI.invoke(IPC_CHANNELS.DB_CREATE_TRANSLATE, data),
  updateTranslate: (id: string, data: unknown) =>
    ElectronAPI.invoke(IPC_CHANNELS.DB_UPDATE_TRANSLATE, id, data),
  deleteTranslate: (id: string) =>
    ElectronAPI.invoke(IPC_CHANNELS.DB_DELETE_TRANSLATE, id),
  getMessages: (translateId: string) =>
    ElectronAPI.invoke(IPC_CHANNELS.DB_GET_MESSAGES, translateId),
  createMessage: (data: unknown) =>
    ElectronAPI.invoke(IPC_CHANNELS.DB_CREATE_MESSAGE, data),
  getKv: (key: string) => ElectronAPI.invoke(IPC_CHANNELS.DB_GET_KV, key),
  setKv: (key: string, value: string) =>
    ElectronAPI.invoke(IPC_CHANNELS.DB_SET_KV, key, value)
}

// Settings API
export const settingsApi = {
  get: () => ElectronAPI.invoke(IPC_CHANNELS.SETTINGS_GET),
  set: (key: string, value: unknown) =>
    ElectronAPI.invoke(IPC_CHANNELS.SETTINGS_SET, key, value),
  reset: () => ElectronAPI.invoke(IPC_CHANNELS.SETTINGS_RESET)
}

// Translation API
export const translateApi = {
  text: (text: string, from: string, to: string) =>
    ElectronAPI.invoke(IPC_CHANNELS.TRANSLATE_TEXT, text, from, to),
  image: (imagePath: string, lang: string) =>
    ElectronAPI.invoke(IPC_CHANNELS.TRANSLATE_IMAGE, imagePath, lang),
  file: (filePath: string, lang: string) =>
    ElectronAPI.invoke(IPC_CHANNELS.TRANSLATE_FILE, filePath, lang)
}

// OCR API
export const ocrApi = {
  perform: (imagePath: string) => ElectronAPI.invoke(IPC_CHANNELS.OCR_PERFORM, imagePath)
}

// Screen Capture API
export const captureApi = {
  screen: () => ElectronAPI.invoke(IPC_CHANNELS.CAPTURE_SCREEN),
  window: () => ElectronAPI.invoke(IPC_CHANNELS.CAPTURE_WINDOW)
}

// Window API
export const windowApi = {
  toggleMenuBar: () => ElectronAPI.invoke(IPC_CHANNELS.WINDOW_TOGGLE_MENU_BAR),
  reload: () => ElectronAPI.invoke(IPC_CHANNELS.WINDOW_RELOAD),
  minimize: () => ElectronAPI.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximize: () => ElectronAPI.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  close: () => ElectronAPI.invoke(IPC_CHANNELS.WINDOW_CLOSE)
}
