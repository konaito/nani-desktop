import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getVersions: () => process.versions,
  getPlatform: () => process.platform,
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
