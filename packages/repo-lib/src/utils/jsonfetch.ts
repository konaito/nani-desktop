export interface JsonRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

export interface JsonResponse<T = unknown> {
  ok: boolean
  status: number
  data: T | null
  error: string | null
}

export async function jsonFetch<T = unknown>(
  url: string,
  options: JsonRequestOptions = {}
): Promise<JsonResponse<T>> {
  const { method = 'GET', headers = {}, body, timeout = 30000 } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const data = response.ok ? await response.json() : null

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: response.ok ? null : response.statusText
    }
  } catch (error) {
    clearTimeout(timeoutId)

    return {
      ok: false,
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function postJson<T = unknown>(
  url: string,
  body: unknown,
  options?: Omit<JsonRequestOptions, 'body' | 'method'>
): Promise<JsonResponse<T>> {
  return jsonFetch<T>(url, { ...options, method: 'POST', body })
}

export async function getJson<T = unknown>(
  url: string,
  options?: Omit<JsonRequestOptions, 'method'>
): Promise<JsonResponse<T>> {
  return jsonFetch<T>(url, { ...options, method: 'GET' })
}
