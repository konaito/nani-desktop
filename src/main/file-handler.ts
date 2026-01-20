import { readFile } from 'node:fs/promises'
import { fileTypeFromBuffer } from 'file-type'
import * as ocr from './ocr'

export interface FileUploadResult {
  success: boolean
  text?: string
  fileType?: string
  mimeType?: string
  error?: string
}

/**
 * ファイルをアップロードしてテキストを抽出
 */
export async function handleFileUpload(filePath: string): Promise<FileUploadResult> {
  try {
    const buffer = await readFile(filePath)
    const fileType = await fileTypeFromBuffer(buffer)

    if (!fileType) {
      return {
        success: false,
        error: 'Unable to determine file type'
      }
    }

    // 画像ファイルの場合はOCR
    if (fileType.mime.startsWith('image/')) {
      const ocrResult = await ocr.performOcr(filePath)

      return {
        success: true,
        text: ocrResult.text,
        fileType: fileType.ext,
        mimeType: fileType.mime
      }
    }

    // PDFやテキストファイルの場合
    if (fileType.ext === 'pdf') {
      // TODO: PDFテキスト抽出の実装
      return {
        success: false,
        error: 'PDF support not yet implemented'
      }
    }

    if (fileType.ext === 'txt' || fileType.mime.startsWith('text/')) {
      const text = buffer.toString('utf-8')

      return {
        success: true,
        text,
        fileType: fileType.ext,
        mimeType: fileType.mime
      }
    }

    return {
      success: false,
      error: `Unsupported file type: ${fileType.ext}`
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * サポートされているファイル形式かチェック
 */
export function isSupportedFileType(filePath: string): boolean {
  const supportedExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.bmp',
    '.tiff',
    '.webp',
    '.pdf',
    '.txt',
    '.md'
  ]
  const ext = filePath.toLowerCase().slice(filePath.lastIndexOf('.'))
  return supportedExtensions.includes(ext)
}
