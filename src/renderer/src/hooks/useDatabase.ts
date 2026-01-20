import { useEffect, useState } from 'react'
import { dbApi } from '../utils/api'
import type { BasicTranslate, BasicTranslateMessage } from '../../../types'

export function useTranslates() {
  const [translates, setTranslates] = useState<BasicTranslate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = (await dbApi.getTranslates()) as BasicTranslate[]
        setTranslates(data)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { translates, loading, error }
}

export function useTranslate(id: string) {
  const [translate, setTranslate] = useState<BasicTranslate | null>(null)
  const [messages, setMessages] = useState<BasicTranslateMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = (await dbApi.getTranslateById(id)) as BasicTranslate
        setTranslate(data)

        if (data) {
          const msgs = (await dbApi.getMessages(id)) as BasicTranslateMessage[]
          setMessages(msgs)
        }
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      load()
    }
  }, [id])

  return { translate, messages, loading, error }
}
