# bondova-MOR

Supabase → Notion sync for selected table rows.

## Requirements

- Node.js 22+

## Setup

1. Install dependencies:
   - `npm ci`
2. Copy `.env.example` to `.env`
3. Fill in all required environment variables

## Run locally

- `npm run sync:notion`

## Environment variables

- `SUPABASE_URL` (required)
- `SUPABASE_SERVICE_ROLE_KEY` (required)
- `SUPABASE_TABLE` (required)
- `SUPABASE_SELECT` (optional, default `*`)
- `SUPABASE_ID_COLUMN` (optional, default `id`)
- `NOTION_TOKEN` (required)
- `NOTION_DATABASE_ID` (required)
- `NOTION_KEY_PROPERTY` (optional, default `Supabase ID`)
- `NOTION_KEY_PROPERTY_TYPE` (optional: `title` or `rich_text`, default `rich_text`)
- `NOTION_PAYLOAD_PROPERTY` (optional, default `Payload`)

## GitHub Actions

Workflow: `.github/workflows/notion-sync.yml`

Required GitHub Secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_TABLE`
- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`

Optional GitHub Secrets:
- `SUPABASE_SELECT`
- `SUPABASE_ID_COLUMN`
- `NOTION_KEY_PROPERTY`
- `NOTION_KEY_PROPERTY_TYPE`
- `NOTION_PAYLOAD_PROPERTY`