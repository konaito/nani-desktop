import { create } from 'zustand'

interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  autoUpdate: boolean
  showMenuBar: boolean
  defaultFromLang: string
  defaultToLang: string
  enableOcr: boolean
  enableHotkeys: boolean
}

interface SettingsState extends AppSettings {
  loading: boolean

  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void
  resetSettings: () => void
  setLoading: (loading: boolean) => void
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  language: 'en',
  autoUpdate: true,
  showMenuBar: true,
  defaultFromLang: 'auto',
  defaultToLang: 'en',
  enableOcr: true,
  enableHotkeys: true
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,
  loading: false,

  updateSettings: (settings) =>
    set((state) => {
      const updated = { ...state, ...settings }
      // 設定を永続化
      if (typeof window !== 'undefined' && window.api) {
        window.api.invoke('settings:set', settings).catch(console.error)
      }
      return updated
    }),

  resetSettings: () =>
    set(() => {
      if (typeof window !== 'undefined' && window.api) {
        window.api.invoke('settings:reset').catch(console.error)
      }
      return { ...DEFAULT_SETTINGS, loading: false }
    }),

  setLoading: (loading) => set({ loading })
}))
