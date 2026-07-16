import { PrismaClient } from '@prisma/client'

// Force-load .env file to override any system-level DATABASE_URL
// (Next.js loads .env automatically, but system env vars take precedence)
import { config } from 'dotenv'
config({ path: '.env', override: true })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use the DATABASE_URL from .env (overridden by dotenv above)
const databaseUrl = process.env.DATABASE_URL

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
