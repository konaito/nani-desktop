import { safeParse } from 'valibot'

export const commonSchemas = {
  email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  url: (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
  uuid: (uuid: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
}

export function validateEmail(email: string): boolean {
  return commonSchemas.email(email)
}

export function validateUrl(url: string): boolean {
  return commonSchemas.url(url)
}

export function validateUuid(uuid: string): boolean {
  return commonSchemas.uuid(uuid)
}
