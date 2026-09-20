# bondova-MOR

Minimal automation scaffold for a one-way data flow:

- **Supabase** is the source of truth for structured data
- **Notion** receives synced views and summaries
- **Google Drive** receives timestamped backup snapshots
- **GitHub** stores code and scheduled automation

## What is included

- `src/jobs/sync-notion.js` — syncs one Supabase table into one Notion database
- `src/jobs/backup-drive.js` — exports one Supabase table to a timestamped JSON snapshot and uploads it to Drive
- `src/jobs/run-all.js` — runs backup first, then Notion sync
- `.github/workflows/notion-sync.yml` — hourly Notion sync workflow
- `.github/workflows/supabase-backup.yml` — daily Drive backup workflow
- `artifacts/status/*.json` — per-job status snapshots for the latest run

## Setup

1. Copy `.env.example` into your own secret management flow.
2. Create GitHub Actions secrets for every required environment variable.
3. Choose one Supabase table for the first milestone.
4. Create one Notion database with properties that match `NOTION_FIELD_MAP_JSON` plus:
   - a rich text property named by `NOTION_SOURCE_ID_PROPERTY`
   - a rich text property named by `NOTION_SYNC_HASH_PROPERTY`
5. Share the target Drive folder with the Google service account email.

## Environment variables

### Shared Supabase configuration

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SCHEMA` (default `public`)
- `SUPABASE_TABLE`
- `SUPABASE_SELECT` (default `*`)
- `SUPABASE_PAGE_SIZE` (default `1000`)
- `SUPABASE_ORDER_FIELD` (default `id`)
- `SUPABASE_FILTERS_JSON` — JSON array of filters like `[{"column":"status","operator":"eq","value":"active"}]`

### Notion sync configuration

- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`
- `NOTION_SOURCE_ID_FIELD` — Supabase column used as the durable source identifier
- `NOTION_SOURCE_ID_PROPERTY` — rich text property in Notion used to store the source identifier
- `NOTION_SYNC_HASH_PROPERTY` — rich text property in Notion used to store the last synced hash
- `NOTION_FIELD_MAP_JSON` — JSON object mapping Notion properties to Supabase fields and Notion property types
- `NOTION_TITLE_FALLBACK` — fallback content for empty Notion title fields

Example:

```json
{
  "Name": { "source": "name", "type": "title" },
  "Status": { "source": "status", "type": "rich_text" },
  "Updated At": { "source": "updated_at", "type": "date" }
}
```

Supported Notion property types in the mapper:

- `title`
- `rich_text`
- `number`
- `checkbox`
- `url`
- `email`
- `phone_number`
- `select`
- `multi_select`
- `date`

### Drive backup configuration

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_DRIVE_FOLDER_ID`
- `BACKUP_OUTPUT_DIR` (default `artifacts/backups`)
- `BACKUP_FILE_PREFIX` (default `supabase-export`)

## Local usage

Run tests:

```bash
npm test
```

Run the Notion sync job:

```bash
npm run sync:notion
```

Run the Drive backup job:

```bash
npm run backup:drive
```

Run backup + sync:

```bash
npm run run:all
```

## Data-flow rules in this first version

- One-way flow only
- No manual editing in Notion for fields managed by the sync job
- No two-way sync logic
- All behavior changes should go through GitHub commits
- Jobs are idempotent for unchanged records through the stored sync hash

## Observability

Each job writes a JSON status file in `artifacts/status/` with the latest summary, including row counts and success or failure state. GitHub Actions also uploads those status files as build artifacts.
