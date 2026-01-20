import { ipcMain, BrowserWindow } from 'electron'
import { eq, desc } from 'drizzle-orm'
import { IPC_CHANNELS } from '../types/ipc'
import * as schema from './db/localdb-schema'
import { translateText, translateImage } from './api-client'
import { performOcr } from './ocr'
import { handleFileUpload } from './file-handler'
import { captureScreenRegionElectron } from './capture-screen'
import { getContentByUrl } from './get-content-by-url'

type Db = ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle>

export function setupIpcHandlers(db: Db, mainWindow: BrowserWindow | null) {
  // ==================== Database handlers ====================

  ipcMain.handle(IPC_CHANNELS.DB_GET_TRANSLATES, async () => {
    const translates = await db
      .select()
      .from(schema.basicTranslate)
      .orderBy(desc(schema.basicTranslate.lastMessageAddedAt))
    return translates
  })

  ipcMain.handle(IPC_CHANNELS.DB_GET_TRANSLATE_BY_ID, async (_event, id: string) => {
    const translates = await db
      .select()
      .from(schema.basicTranslate)
      .where(eq(schema.basicTranslate.id, id))
      .limit(1)
    return translates[0] || null
  })

  ipcMain.handle(IPC_CHANNELS.DB_CREATE_TRANSLATE, async (_event, data) => {
    const [translate] = await db
      .insert(schema.basicTranslate)
      .values(data)
      .returning()
    return translate
  })

  ipcMain.handle(IPC_CHANNELS.DB_UPDATE_TRANSLATE, async (_event, id: string, data) => {
    const [translate] = await db
      .update(schema.basicTranslate)
      .set(data)
      .where(eq(schema.basicTranslate.id, id))
      .returning()
    return translate
  })

  ipcMain.handle(IPC_CHANNELS.DB_DELETE_TRANSLATE, async (_event, id: string) => {
    await db.delete(schema.basicTranslate).where(eq(schema.basicTranslate.id, id))
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.DB_GET_MESSAGES, async (_event, translateId: string) => {
    const messages = await db
      .select()
      .from(schema.basicTranslateMessage)
      .where(eq(schema.basicTranslateMessage.basicTranslateId, translateId))
    return messages
  })

  ipcMain.handle(IPC_CHANNELS.DB_CREATE_MESSAGE, async (_event, data) => {
    const [message] = await db
      .insert(schema.basicTranslateMessage)
      .values(data)
      .returning()
    return message
  })

  ipcMain.handle(IPC_CHANNELS.DB_GET_KV, async (_event, key: string) => {
    const rows = await db
      .select()
      .from(schema.localKv)
      .where(eq(schema.localKv.key, key))
      .limit(1)
    return rows[0]?.value || null
  })

  ipcMain.handle(IPC_CHANNELS.DB_SET_KV, async (_event, key: string, value: string) => {
    await db
      .insert(schema.localKv)
      .values({ key, value })
      .onConflictDoUpdate({
        target: schema.localKv.key,
        set: { value, updatedAt: Math.floor(Date.now() / 1000) }
      })
    return { success: true }
  })

  // ==================== Translation handlers ====================

  ipcMain.handle(IPC_CHANNELS.TRANSLATE_TEXT, async (_event, text, from, to, options) => {
    try {
      const result = await translateText({
        text,
        sourceLang: from,
        targetLang: to,
        customInstruction: options?.customInstruction,
        context: options?.context,
        styleTags: options?.styleTags
      })
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  ipcMain.handle(IPC_CHANNELS.TRANSLATE_IMAGE, async (_event, imagePath, targetLang) => {
    try {
      // OCRでテキスト抽出
      const ocrResult = await performOcr(imagePath)

      // 抽出したテキストを翻訳
      const translateResult = await translateText({
        text: ocrResult.text,
        sourceLang: 'auto',
        targetLang
      })

      return {
        success: translateResult.success,
        originalText: ocrResult.text,
        translation: translateResult.translation,
        error: translateResult.error
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  ipcMain.handle(IPC_CHANNELS.TRANSLATE_FILE, async (_event, filePath, targetLang) => {
    try {
      const uploadResult = await handleFileUpload(filePath)

      if (!uploadResult.success || !uploadResult.text) {
        return {
          success: false,
          error: uploadResult.error || 'Failed to extract text from file'
        }
      }

      // 抽出したテキストを翻訳
      const translateResult = await translateText({
        text: uploadResult.text,
        sourceLang: 'auto',
        targetLang
      })

      return {
        success: translateResult.success,
        originalText: uploadResult.text,
        translation: translateResult.translation,
        error: translateResult.error
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // ==================== OCR handlers ====================

  ipcMain.handle(IPC_CHANNELS.OCR_PERFORM, async (_event, imagePath: string) => {
    try {
      const result = await performOcr(imagePath)
      return {
        success: true,
        ...result
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // ==================== Screen capture handlers ====================

  ipcMain.handle(IPC_CHANNELS.CAPTURE_SCREEN, async () => {
    try {
      const result = await captureScreenRegionElectron()
      return result
    } catch (error) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : String(error)
      }
    }
  })

  ipcMain.handle(IPC_CHANNELS.CAPTURE_WINDOW, async () => {
    // TODO: ウィンドウキャプチャの実装
    return {
      type: 'error',
      message: 'Window capture not yet implemented'
    }
  })

  // ==================== Web content handlers ====================

  ipcMain.handle('web:get-content', async (_event, url: string) => {
    try {
      const result = await getContentByUrl(url)
      return result
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // ==================== Window handlers ====================

  ipcMain.handle(IPC_CHANNELS.WINDOW_TOGGLE_MENU_BAR, () => {
    if (mainWindow) {
      mainWindow.setMenuBarVisibility(!mainWindow.isMenuBarVisible())
      mainWindow.autoHideMenuBar = !mainWindow.autoHideMenuBar
    }
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_RELOAD, () => {
    mainWindow?.reload()
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow?.minimize()
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
    mainWindow?.close()
    return { success: true }
  })

  // ==================== System handlers ====================

  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_PLATFORM, () => {
    return process.platform
  })

  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_VERSION, () => {
    return process.versions
  })

  ipcMain.handle(IPC_CHANNELS.SYSTEM_OPEN_EXTERNAL, async (_event, url: string) => {
    const { shell } = require('electron')
    await shell.openExternal(url)
    return { success: true }
  })

  // ==================== Settings handlers ====================

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    const settingsJson = await db
      .select()
      .from(schema.localKv)
      .where(eq(schema.localKv.key, 'app-settings'))
      .limit(1)

    if (settingsJson[0]) {
      try {
        return JSON.parse(settingsJson[0].value)
      } catch {
        return null
      }
    }
    return null
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, settings) => {
    await db
      .insert(schema.localKv)
      .values({
        key: 'app-settings',
        value: JSON.stringify(settings),
        updatedAt: Math.floor(Date.now() / 1000)
      })
      .onConflictDoUpdate({
        target: schema.localKv.key,
        set: {
          value: JSON.stringify(settings),
          updatedAt: Math.floor(Date.now() / 1000)
        }
      })
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_RESET, async () => {
    await db.delete(schema.localKv).where(eq(schema.localKv.key, 'app-settings'))
    return { success: true }
  })
}
