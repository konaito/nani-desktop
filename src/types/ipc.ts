export const IPC_CHANNELS = {
  // Database
  DB_GET_TRANSLATES: 'db:get-translates',
  DB_GET_TRANSLATE_BY_ID: 'db:get-translate-by-id',
  DB_CREATE_TRANSLATE: 'db:create-translate',
  DB_UPDATE_TRANSLATE: 'db:update-translate',
  DB_DELETE_TRANSLATE: 'db:delete-translate',
  DB_GET_MESSAGES: 'db:get-messages',
  DB_CREATE_MESSAGE: 'db:create-message',
  DB_GET_KV: 'db:get-kv',
  DB_SET_KV: 'db:set-kv',

  // App Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_RESET: 'settings:reset',

  // Translation
  TRANSLATE_TEXT: 'translate:text',
  TRANSLATE_IMAGE: 'translate:image',
  TRANSLATE_FILE: 'translate:file',

  // OCR
  OCR_PERFORM: 'ocr:perform',

  // Screen Capture
  CAPTURE_SCREEN: 'capture:screen',
  CAPTURE_WINDOW: 'capture:window',

  // Window
  WINDOW_TOGGLE_MENU_BAR: 'toggleMenuBar',
  WINDOW_RELOAD: 'reloadWindow',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',

  // Auto Update
  UPDATE_CHECK: 'update:check',
  UPDATE_DOWNLOAD: 'update:download',
  UPDATE_INSTALL: 'update:install',

  // System
  SYSTEM_GET_PLATFORM: 'system:get-platform',
  SYSTEM_GET_VERSION: 'system:get-version',
  SYSTEM_OPEN_EXTERNAL: 'system:open-external'
} as const

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]
