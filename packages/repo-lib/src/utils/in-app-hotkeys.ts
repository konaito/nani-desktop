export const HOTKEY_ACTIONS = {
  NEW_TRANSLATION: 'new-translation',
  QUICK_UPLOAD: 'quick-upload',
  SCREEN_CAPTURE: 'screen-capture',
  TOGGLE_WINDOW: 'toggle-window',
  OPEN_HISTORY: 'open-history',
  OPEN_SETTINGS: 'open-settings'
} as const

export const DEFAULT_HOTKEYS = {
  [HOTKEY_ACTIONS.NEW_TRANSLATION]: 'CommandOrControl+N',
  [HOTKEY_ACTIONS.QUICK_UPLOAD]: 'CommandOrControl+Shift+U',
  [HOTKEY_ACTIONS.SCREEN_CAPTURE]: 'CommandOrControl+Shift+S',
  [HOTKEY_ACTIONS.TOGGLE_WINDOW]: 'CommandOrControl+`',
  [HOTKEY_ACTIONS.OPEN_HISTORY]: 'CommandOrControl+H',
  [HOTKEY_ACTIONS.OPEN_SETTINGS]: 'CommandOrControl+,'
}

export type HotKeyAction = typeof HOTKEY_ACTIONS[keyof typeof HOTKEY_ACTIONS]
