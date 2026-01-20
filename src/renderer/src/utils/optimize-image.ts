/**
 * 画像最適化ユーティリティ
 * 画像の圧縮、リサイズ、フォーマット変換を行う
 */

export interface OptimizeImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0.0 - 1.0
  format?: 'image/jpeg' | 'image/png' | 'image/webp'
  enableSmartCrop?: boolean
}

export interface OptimizeImageResult {
  blob: Blob
  url: string
  width: number
  height: number
  originalSize: number
  optimizedSize: number
  compressionRatio: number
}

/**
 * 画像を最適化する
 */
export async function optimizeImage(
  file: File | Blob,
  options: OptimizeImageOptions = {}
): Promise<OptimizeImageResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'image/jpeg',
    enableSmartCrop = false
  } = options

  const originalSize = file.size

  // 画像を読み込む
  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap

  // リサイズが必要か判定
  const needsResize = width > maxWidth || height > maxHeight

  if (needsResize) {
    const scale = Math.min(maxWidth / width, maxHeight / height)
    width = Math.floor(width * scale)
    height = Math.floor(height * scale)
  }

  // Canvasを作成してリサイズ
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // 高品質なリサイズ
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, width, height)

  // Blobに変換
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      format,
      quality
    )
  })

  const url = URL.createObjectURL(blob)
  const optimizedSize = blob.size
  const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100

  return {
    blob,
    url,
    width,
    height,
    originalSize,
    optimizedSize,
    compressionRatio
  }
}

/**
 * 複数の画像を一括最適化
 */
export async function optimizeImages(
  files: File[],
  options: OptimizeImageOptions = {}
): Promise<OptimizeImageResult[]> {
  const results: OptimizeImageResult[] = []

  for (const file of files) {
    try {
      const result = await optimizeImage(file, options)
      results.push(result)
    } catch (error) {
      console.error(`Failed to optimize image: ${file.name}`, error)
      throw error
    }
  }

  return results
}

/**
 * Base64エンコードされた画像を最適化
 */
export async function optimizeBase64Image(
  base64: string,
  options: OptimizeImageOptions = {}
): Promise<string> {
  // Base64をBlobに変換
  const fetchResponse = await fetch(base64)
  const blob = await fetchResponse.blob()

  // 最適化
  const result = await optimizeImage(blob, options)

  // 最適化された画像をBase64に戻す
  const optimizedBase64 = await blobToBase64(result.blob)

  // 古いURLをクリーンアップ
  URL.revokeObjectURL(result.url)

  return optimizedBase64
}

/**
 * BlobをBase64に変換
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 画像の情報を取得
 */
export async function getImageInfo(file: File | Blob): Promise<{
  width: number
  height: number
  size: number
  type: string
}> {
  const bitmap = await createImageBitmap(file)
  return {
    width: bitmap.width,
    height: bitmap.height,
    size: file.size,
    type: file.type
  }
}

/**
 * 画像を回転
 */
export async function rotateImage(
  file: File | Blob,
  degrees: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // 回転後のサイズを計算
  const radians = (degrees * Math.PI) / 180
  const sin = Math.abs(Math.sin(radians))
  const cos = Math.abs(Math.cos(radians))

  canvas.width = bitmap.width * cos + bitmap.height * sin
  canvas.height = bitmap.width * sin + bitmap.height * cos

  // 中心点で回転
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(radians)
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        }  else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      file.type || 'image/png'
    )
  })
}

/**
 * 画像をトリミング
 */
export async function cropImage(
  file: File | Blob,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  ctx.drawImage(bitmap, x, y, width, height, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      file.type || 'image/png'
    )
  })
}

/**
 * 画像のサムネイルを生成
 */
export async function generateThumbnail(
  file: File | Blob,
  size: number = 200
): Promise<string> {
  const result = await optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.8,
    format: 'image/jpeg'
  })

  // Data URLとして返す
  const base64 = await blobToBase64(result.blob)

  // クリーンアップ
  URL.revokeObjectURL(result.url)

  return base64
}

/**
 * 画像ファイルサイズをフォーマット
 */
export function formatImageSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}

/**
 * 画像のアスペクト比を取得
 */
export async function getAspectRatio(file: File | Blob): Promise<number> {
  const info = await getImageInfo(file)
  return info.width / info.height
}

/**
 * 画像が横向きか判定
 */
export async function isLandscape(file: File | Blob): Promise<boolean> {
  const aspectRatio = await getAspectRatio(file)
  return aspectRatio > 1
}

/**
 * 画像が正方形か判定
 */
export async function isSquare(file: File | Blob): Promise<boolean> {
  const info = await getImageInfo(file)
  return info.width === info.height
}
