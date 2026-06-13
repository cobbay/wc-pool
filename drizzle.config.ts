import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './app/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Uses DATABASE_URL from .env.local (dev) when running locally
    // Uses DATABASE_URL from .env (prod) when running in production
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});

