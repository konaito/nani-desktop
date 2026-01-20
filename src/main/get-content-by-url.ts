import { BrowserWindow, session } from 'electron'
import { lookup } from 'node:dns/promises'
import ipaddr from 'ipaddr.js'
import { URL } from 'node:url'

interface ContentResult {
  ok: boolean
  data?: {
    title: string
    textContent: string
    lang?: string
  }
  message?: string
}

const dnsCache = new Map<string, { expiresAtMs: number; entry: DnsEntry }>()
const DNS_CACHE_TTL_MS = 5 * 60 * 1000
const DNS_CACHE_MAX_SIZE = 100

interface DnsEntry {
  ok: boolean
  addresses?: Array<{ address: string }>
  message?: string
}

// DNSルックアップ（キャッシュ付き）
async function dnsLookupWithCache(hostname: string): Promise<Array<{ address: string }>> {
  const now = Date.now()

  // キャッシュクリーニング
  for (const [key, value] of dnsCache) {
    if (value.expiresAtMs <= now) {
      dnsCache.delete(key)
    }
  }
  if (dnsCache.size > DNS_CACHE_MAX_SIZE) {
    dnsCache.clear()
  }

  const cached = dnsCache.get(hostname)
  if (cached && cached.expiresAtMs > now) {
    if (!cached.entry.ok) {
      throw new Error(cached.entry.message)
    }
    return cached.entry.addresses || []
  }

  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true })
    const entry: DnsEntry = { ok: true, addresses }
    dnsCache.set(hostname, { expiresAtMs: now + DNS_CACHE_TTL_MS, entry })
    return addresses
  } catch {
    const entry: DnsEntry = { ok: false, message: `Site not found: ${hostname}` }
    dnsCache.set(hostname, { expiresAtMs: now + DNS_CACHE_TTL_MS, entry })
    throw new Error(entry.message)
  }
}

function isLocalhost(hostname: string): boolean {
  if (!hostname || hostname === 'localhost' || hostname === 'localhost.localdomain') {
    return true
  }
  return (
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.localdomain') ||
    hostname.endsWith('.internal')
  )
}

function isUnicastIp(ip: string): boolean {
  try {
    const addr = ipaddr.parse(ip)
    return addr.range() === 'unicast'
  } catch {
    return false
  }
}

async function validateHostname(hostname: string): Promise<void> {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, '')

  if (!normalized) {
    throw new Error('Hostname is empty')
  }

  if (normalized.includes('%')) {
    throw new Error(`Blocked hostname for security reasons: ${hostname}`)
  }

  if (isLocalhost(normalized)) {
    throw new Error(`Blocked hostname for security reasons: ${hostname}`)
  }

  if (ipaddr.isValid(normalized)) {
    if (!isUnicastIp(normalized)) {
      throw new Error(`Blocked IP address for security reasons: ${hostname}`)
    }
    return
  }

  const addresses = await dnsLookupWithCache(normalized)
  if (addresses.length === 0) {
    throw new Error(`DNS lookup returned no results for hostname: ${hostname}`)
  }

  for (const { address } of addresses) {
    if (!isUnicastIp(address)) {
      throw new Error(`Blocked IP address for security reasons: ${hostname}`)
    }
  }
}

async function validateUrl(url: URL): Promise<void> {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Unsupported protocol: ${url.protocol}`)
  }

  await validateHostname(url.hostname)
}

// Readabilityを呼び出すJavaScriptコード
function getReadabilityScript(): string {
  return `
    (function() {
      try {
        if (!window.__naniReadability || typeof window.__naniReadability.parse !== 'function') {
          return { ok: false, message: 'window.__naniReadability.parse is not available' };
        }
        const result = window.__naniReadability.parse();
        if (!result) {
          return { ok: false, message: 'Readability returned null' };
        }
        if (typeof result.title !== 'string' || typeof result.textContent !== 'string') {
          return { ok: false, message: 'Readability returned unexpected shape' };
        }
        return {
          ok: true,
          data: {
            title: result.title,
            textContent: result.textContent,
            lang: typeof result.lang === 'string' ? result.lang : null
          }
        };
      } catch (e) {
        return { ok: false, message: e instanceof Error ? e.message : String(e) };
      }
    })()
  `
}

const CRAWL_PARTITION = 'nopersist:crawl'
let requestHandlerInitialized = false

// セキュリティ設定の初期化
function initializeRequestHandler() {
  if (requestHandlerInitialized) return
  requestHandlerInitialized = true

  const sess = session.fromPartition(CRAWL_PARTITION)

  // 権限リクエストをすべてブロック
  sess.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false)
  })

  sess.setPermissionCheckHandler(() => false)

  // ダウンロードをブロック
  sess.on('will-download', (_event, _item, _webContents) => {
    // _event.preventDefault()
    // _item.cancel()
  })

  // リクエストフィルタリング
  const BLOCKED_RESOURCE_TYPES = new Set(['image', 'media', 'font'])

  sess.webRequest.onBeforeRequest((details, callback) => {
    if (BLOCKED_RESOURCE_TYPES.has(details.resourceType)) {
      callback({ cancel: true })
      return
    }

    callback({ cancel: false })
  })
}

async function getContentByUrl(urlString: string, timeoutMs: number = 20000): Promise<ContentResult> {
  try {
    const url = normalizeUrl(urlString)
    await validateUrl(url)

    return await fetchContent(url, timeoutMs)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error)
    }
  }
}

function normalizeUrl(urlString: string): URL {
  // X.com (Twitter) の特別処理
  const url = new URL(urlString)
  try {
    if (url.hostname === 'x.com' || url.hostname.endsWith('.x.com')) {
      const match = url.pathname.match(/\/status\/(\d+)/)
      if (match && match[1]) {
        const tweetId = match[1]
        return new URL(`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`)
      }
    }
  } catch {}
  return url
}

async function fetchContent(url: URL, timeoutMs: number): Promise<ContentResult> {
  initializeRequestHandler()

  const window = new BrowserWindow({
    show: false,
    skipTaskbar: true,
    width: 1280,
    height: 5000,
    webPreferences: {
      preload: undefined, // 必要に応じてpreloadスクリプトを指定
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })

  window.webContents.setAudioMuted(true)

  // ナビゲーション制御
  const blockNewWindow = (_event: any, urlString: string) => {
    try {
      const url = new URL(urlString)
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return
      }
    } catch {}
    // _event.preventDefault()
  }

  window.webContents.on('will-navigate', blockNewWindow)
  window.webContents.on('will-redirect', blockNewWindow)

  try {
    // ページの読み込み
    await Promise.race([
      window.loadURL(url.toString()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timed out: loadURL ${url}`)), timeoutMs)
      )
    ])

    // スリープ（ページのレンダリング待ち）
    await sleep(1500)

    // Readabilityでコンテンツ抽出
    const result = await Promise.race([
      window.webContents.executeJavaScript(getReadabilityScript()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timed out: readability')), timeoutMs)
      )
    ])

    if (!isReadabilityResult(result)) {
      throw new Error('Readability execution returned unexpected result')
    }

    if (!result.ok) {
      throw new Error(result.message)
    }

    return { ok: true, ...result.data }
  } finally {
    window.destroy()
  }
}

function isReadabilityResult(
  result: unknown
): result is { ok: boolean; data?: { title: string; textContent: string }; message?: string } {
  if (typeof result !== 'object' || result === null) return false
  const r = result as Record<string, unknown>
  if (typeof r.ok !== 'boolean') return false
  if (r.ok) {
    return (
      typeof r.data === 'object' &&
      r.data !== null &&
      typeof (r.data as { title: unknown }).title === 'string' &&
      typeof (r.data as { textContent: unknown }).textContent === 'string'
    )
  }
  return typeof r.message === 'string'
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { getContentByUrl }
export type { ContentResult }
