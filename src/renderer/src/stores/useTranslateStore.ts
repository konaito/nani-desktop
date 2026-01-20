import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { dbApi } from '../utils/api'

interface TranslateMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: number
}

interface Translate {
  id: string
  sourceText: string
  sourceLang?: string
  toLang: string
  translationExcerpt?: string
  createdAt: number
  lastMessageAddedAt: number
  messages: TranslateMessage[]
  tags?: string[]
  customStyleInstruction?: string
}

interface TranslateState {
  translates: Translate[]
  selectedId: string | null
  loading: boolean
  error: string | null

  // Actions
  fetchTranslates: () => Promise<void>
  setSelectedId: (id: string | null) => void
  createTranslate: (data: Omit<Translate, 'id' | 'createdAt' | 'lastMessageAddedAt' | 'messages'>) => Promise<void>
  updateTranslate: (id: string, updates: Partial<Translate>) => Promise<void>
  deleteTranslate: (id: string) => Promise<void>
  addMessage: (translateId: string, message: Omit<TranslateMessage, 'id' | 'createdAt'>) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTranslateStore = create<TranslateState>()(
  subscribeWithSelector((set, get) => ({
    translates: [],
    selectedId: null,
    loading: false,
    error: null,

    fetchTranslates: async () => {
      set({ loading: true, error: null })
      try {
        const data = await dbApi.getTranslates() as any[]
        const translates = data.map(t => ({
          ...t,
          messages: [],
          tags: t.tagsDump ? JSON.parse(t.tagsDump) : []
        }))
        set({ translates, loading: false })
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to fetch translates', loading: false })
      }
    },

    setSelectedId: (selectedId) => set({ selectedId }),

    createTranslate: async (data) => {
      set({ loading: true, error: null })
      try {
        const now = Math.floor(Date.now() / 1000)
        const newTranslate = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: now,
          lastMessageAddedAt: now,
          messages: []
        }
        await dbApi.createTranslate(newTranslate)

        const messages = await dbApi.getMessages(newTranslate.id) as any[]

        set((state) => ({
          translates: [{ ...newTranslate, messages }, ...state.translates],
          selectedId: newTranslate.id,
          loading: false
        }))
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to create translate', loading: false })
      }
    },

    updateTranslate: async (id, updates) => {
      set({ loading: true, error: null })
      try {
        const current = get().translates.find(t => t.id === id)
        if (!current) return

        const updated = { ...current, ...updates }
        await dbApi.updateTranslate(id, updated)

        set((state) => ({
          translates: state.translates.map(t => (t.id === id ? updated : t)),
          loading: false
        }))
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to update translate', loading: false })
      }
    },

    deleteTranslate: async (id) => {
      set({ loading: true, error: null })
      try {
        await dbApi.deleteTranslate(id)

        set((state) => ({
          translates: state.translates.filter(t => t.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
          loading: false
        }))
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to delete translate', loading: false })
      }
    },

    addMessage: async (translateId, message) => {
      try {
        const now = Math.floor(Date.now() / 1000)
        const newMessage = {
          ...message,
          id: crypto.randomUUID(),
          createdAt: now
        }

        await dbApi.createMessage({
          ...newMessage,
          basicTranslateId: translateId
        })

        set((state) => ({
          translates: state.translates.map(t => {
            if (t.id === translateId) {
              return {
                ...t,
                messages: [...t.messages, newMessage],
                lastMessageAddedAt: now
              }
            }
            return t
          })
        }))
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to add message' })
      }
    },

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error })
  }))
)
