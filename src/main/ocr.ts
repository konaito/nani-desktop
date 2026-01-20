import * as ocr from '@napi-rs/system-ocr'

export interface OcrResult {
  text: string
  confidence?: number
  error?: string
}

/**
 * 画像ファイルからテキストを抽出（OCR）
 */
export async function performOcr(imagePath: string): Promise<OcrResult> {
  try {
    // @napi-rs/system-ocr v1.0.2 API
    const result = await ocr.recognize(imagePath)

    return {
      text: result.text || '',
      confidence: result.confidence
    }
  } catch (error) {
    throw new Error(
      `OCR failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * 複数の画像ファイルからテキストを抽出（バッチ処理）
 */
export async function performBatchOcr(imagePaths: string[]): Promise<OcrResult[]> {
  const results = await Promise.allSettled(
    imagePaths.map((path) => performOcr(path))
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    }
    return {
      text: '',
      error: `Failed to process ${imagePaths[index]}: ${result.reason}`
    }
  })
}

/**
 * サポートされている画像形式かチェック
 */
export function isValidImageFormat(filePath: string): boolean {
  const supportedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp']
  const ext = filePath.toLowerCase().slice(filePath.lastIndexOf('.'))
  return supportedExtensions.includes(ext)
}
