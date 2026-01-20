import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/main/db/localdb-schema.ts',
  out: './drizzle',
  dialect: 'sqlite'
})
