import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getVersions: () => process.versions,
  getPlatform: () => process.platform,

  // Database
  getTranslates: () => ipcRenderer.invoke('db:get-translates'),
  getTranslateById: (id: string) => ipcRenderer.invoke('db:get-translate-by-id', id),
  createTranslate: (data: unknown) => ipcRenderer.invoke('db:create-translate', data),
  updateTranslate: (id: string, data: unknown) => ipcRenderer.invoke('db:update-translate', id, data),
  deleteTranslate: (id: string) => ipcRenderer.invoke('db:delete-translate', id),
  getMessages: (translateId: string) => ipcRenderer.invoke('db:get-messages', translateId),
  createMessage: (data: unknown) => ipcRenderer.invoke('db:create-message', data),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: unknown) => ipcRenderer.invoke('settings:set', settings),
  resetSettings: () => ipcRenderer.invoke('settings:reset'),

  // Translation
  translateText: (data: unknown) => ipcRenderer.invoke('translate:text', data),
  translateImage: (data: unknown) => ipcRenderer.invoke('translate:image', data),
  translateFile: (filePath: string, options: unknown) => ipcRenderer.invoke('translate:file', filePath, options),

  // OCR
  performOcr: (imagePath: string) => ipcRenderer.invoke('ocr:perform', imagePath),

  // Screen Capture
  captureScreen: () => ipcRenderer.invoke('capture:screen'),
  captureWindow: () => ipcRenderer.invoke('capture:window'),

  // Window
  toggleMenuBar: () => ipcRenderer.send('toggleMenuBar'),
  reloadWindow: () => ipcRenderer.send('reloadWindow'),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // Auto Update
  checkUpdate: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),

  // System
  openExternal: (url: string) => ipcRenderer.invoke('system:open-external', url),

  // Mac Accessibility
  getAccessibilitySettings: () => ipcRenderer.invoke('mac:get-accessibility-settings'),
  openMacAccessibility: () => ipcRenderer.invoke('mac:open-accessibility'),

  // Generic invoke
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args))
  },
  once: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.once(channel, (_event, ...args) => callback(...args))
  },
  send: (channel: string, ...args: unknown[]) => {
    ipcRenderer.send(channel, ...args)
  },
  invoke: (channel: string, ...args: unknown[]) => {
    return ipcRenderer.invoke(channel, ...args)
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
}

contextBridge.exposeInMainWorld('electron', electronAPI)
contextBridge.exposeInMainWorld('api', api)

export type ElectronAPI = typeof api
