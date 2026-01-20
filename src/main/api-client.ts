import { postJson } from 'repo-lib/utils/jsonfetch'

export interface TranslateRequest {
  text: string
  sourceLang: string
  targetLang: string
  customInstruction?: string
  context?: string[]
  styleTags?: string[]
}

export interface TranslateResponse {
  success: boolean
  translation?: string
  model?: string
  error?: string
}

export interface ImageTranslateRequest {
  imageData: Buffer
  sourceLang?: string
  targetLang: string
}

export interface ImageTranslateResponse {
  success: boolean
  text?: string
  translation?: string
  error?: string
}

// APIエンドポイント
const API_ENDPOINTS = {
  primary: 'https://nani.now',
  backup: 'https://nani.kiok.jp',
  local: 'http://localhost:3021'
}

/**
 * テキスト翻訳APIを呼び出す
 */
export async function translateText(request: TranslateRequest): Promise<TranslateResponse> {
  const endpoints = [API_ENDPOINTS.primary, API_ENDPOINTS.backup]

  for (const endpoint of endpoints) {
    try {
      const response = await postJson(`${endpoint}/api/translate`, request)

      if (response.ok && response.data) {
        return {
          success: true,
          translation: (response.data as any).translation,
          model: (response.data as any).model
        }
      }
    } catch (error) {
      console.warn(`Failed to translate with ${endpoint}:`, error)
      continue
    }
  }

  return {
    success: false,
    error: 'All translation endpoints failed'
  }
}

/**
 * 画像翻訳APIを呼び出す（OCR + 翻訳）
 */
export async function translateImage(
  request: ImageTranslateRequest
): Promise<ImageTranslateResponse> {
  const endpoints = [API_ENDPOINTS.primary, API_ENDPOINTS.backup]

  for (const endpoint of endpoints) {
    try {
      const formData = new FormData()
      formData.append('image', new Blob([request.imageData]))
      formData.append('targetLang', request.targetLang)

      if (request.sourceLang) {
        formData.append('sourceLang', request.sourceLang)
      }

      const response = await fetch(`${endpoint}/api/translate-image`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()

        return {
          success: true,
          text: data.text,
          translation: data.translation
        }
      }
    } catch (error) {
      console.warn(`Failed to translate image with ${endpoint}:`, error)
      continue
    }
  }

  return {
    success: false,
    error: 'All image translation endpoints failed'
  }
}

/**
 * APIのヘルスチェック
 */
export async function checkApiHealth(): Promise<{ healthy: boolean; endpoint?: string }> {
  const endpoints = [API_ENDPOINTS.primary, API_ENDPOINTS.backup]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })

      if (response.ok) {
        return { healthy: true, endpoint }
      }
    } catch {
      continue
    }
  }

  return { healthy: false }
}
