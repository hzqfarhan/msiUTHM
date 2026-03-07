# Setup Script for MSI UTHM Companion

1. **Environment Variables**:
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   Then fill in your Supabase URL and Anon Key. The app **will crash** (showing an "offline" or error state) if these are missing.

2. **Database**:
   Run the SQL migrations in `supabase/migrations/` in your Supabase SQL Editor.

3. **Storage**:
   Create a public bucket named `uploads` in Supabase Storage.

4. **Run**:
   ```bash
   npm run dev
   ```
   If you see a Turbopack error, run:
   ```bash
   npm run dev -- --webpack
   ```
