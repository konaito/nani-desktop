import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const basicTranslate = sqliteTable('basic_translate', {
  id: text('id').primaryKey(),
  sourceText: text('source_text').notNull(),
  sourceLang: text('source_lang'),
  toLang: text('to_lang').notNull(),
  userNativeLangWhenCreated: text('user_native_lang_when_created').notNull(),
  translateLangWhenCreated: text('translate_lang_when_created').notNull(),
  userPlanWhenCreated: text('user_plan_when_created').notNull(),
  dialectBcp47: text('dialect_bcp47'),
  translationExcerpt: text('translation_excerpt'),
  metaKvList: text('meta_kv_list').notNull().default('{}'),
  aiReplyResults: text('ai_reply_results').notNull().default('[]'),
  createdAt: integer('created_at').notNull(),
  lastMessageAddedAt: integer('last_message_added_at').notNull(),
  allowParaphrase: integer('allow_paraphrase').notNull(),
  appVersion: text('app_version').notNull(),
  usedModel: text('used_model'),
  fileType: text('file_type'),
  thumbAspectRatio: text('thumb_aspect_ratio'),
  variant: text('variant'),
  parentId: text('parent_id'),
  childrenMetadata: text('children_metadata'),
  tagsDump: text('tags_dump'),
  customStyleInstruction: text('custom_style_instruction'),
  contextsDump: text('contexts_dump'),
  pagination: text('pagination'),
  refUrl: text('ref_url')
})

export const basicTranslateMessage = sqliteTable('basic_translate_message', {
  id: text('id').primaryKey(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at').notNull(),
  basicTranslateId: text('basic_translate_id').notNull().references(() => basicTranslate.id, { onDelete: 'cascade' })
})

export const localKv = sqliteTable('localkv', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at').notNull().default(0)
})
