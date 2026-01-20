export interface BasicTranslate {
  id: string
  sourceText: string
  sourceLang?: string
  toLang: string
  userNativeLangWhenCreated: string
  translateLangWhenCreated: string
  userPlanWhenCreated: string
  dialectBcp47?: string
  translationExcerpt?: string
  metaKvList: string
  aiReplyResults: string
  createdAt: number
  lastMessageAddedAt: number
  allowParaphrase: number
  appVersion: string
  usedModel?: string
  fileType?: string
  thumbAspectRatio?: string
  variant?: string
  parentId?: string
  childrenMetadata?: string
  tagsDump?: string
  customStyleInstruction?: string
  contextsDump?: string
  pagination?: string
  refUrl?: string
}

export interface BasicTranslateMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: number
  basicTranslateId: string
}

export interface LocalKv {
  key: string
  value: string
  updatedAt: number
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  autoUpdate: boolean
  showMenuBar: boolean
}

export interface SupportedLanguage {
  code: string
  name: string
  nativeName?: string
}

export interface HotKeyAction {
  id: string
  label: string
  defaultKey: string
}
