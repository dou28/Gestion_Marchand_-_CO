# Navigateur Interne — Starter (Next.js + Supabase + Google Sheets SA)

## Prérequis
- Supabase (2 projets: préprod & prod)
- Vercel
- Google Service Account (Drive + Sheets) et partage des dossiers par entreprise

## Setup
1. Copier `.env.example` → `.env.local` et remplir.
2. `npm i`
3. Migrations: `supabase db push` (ou exécuter le SQL sous `supabase/migrations/0001_init.sql`).
4. Déployer Edge Functions: `supabase functions deploy sheets-read` et `sheets-write` (ajouter secrets).
5. Définir `SHEETS_READ_URL` et `SHEETS_WRITE_URL` (URLs publiques Vercel/Supabase).

## Lancer
```bash
npm run dev
```

Routes: `/login` → `/companies` → `/sheets?companyId=...` → `/work/[sheetId]`.
