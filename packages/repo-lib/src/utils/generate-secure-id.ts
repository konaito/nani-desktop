import { nanoid } from 'nanoid'

export function generateSecureId(): string {
  return nanoid(21)
}

export function generateShortId(): string {
  return nanoid(10)
}
