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
- `NOTION_KEY_PROPERTY` (optional, default `Name`)
- `NOTION_KEY_PROPERTY_TYPE` (optional: `title` or `rich_text`, default `title`)
- `NOTION_TITLE_PROPERTY` (optional, default `Name`, must be a writable Notion `title` property)
- `NOTION_PAYLOAD_PROPERTY` (optional, default `Payload`)

The target Notion database must include both:
- A writable `title` property (used for page creation, configured via `NOTION_TITLE_PROPERTY`)
- A writable `rich_text` property for payload storage (`NOTION_PAYLOAD_PROPERTY`)

## GitHub Actions

Workflow: `.github/workflows/notion-sync.yml`
- Schedule: every 6 hours (`0 */6 * * *`)
- Manual run: open the repository **Actions** tab, choose **Supabase to Notion Sync**, then click **Run workflow**.

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
- `NOTION_TITLE_PROPERTY`
- `NOTION_PAYLOAD_PROPERTY`