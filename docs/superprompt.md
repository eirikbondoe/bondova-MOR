# Superprompt - bondova-MOR

This is the canonical source of truth for agent guidance when working on bondova-MOR.

## Project Purpose

bondova-MOR syncs data from Supabase tables to Notion databases. It provides a reliable, configurable way to keep Notion databases in sync with Supabase data through:
- Local Node.js job execution
- Automated GitHub Actions scheduling
- Manual GitHub Actions triggers
- Environment-based configuration

## Architecture

The project follows a simple architecture:

1. **Sync Job** (`src/jobs/sync-notion.js`)
   - Reads from Supabase tables
   - Writes/updates Notion databases
   - Handles errors and logging
   - Supports multiple table-to-database mappings

2. **npm Script** (`package.json`)
   - Exposes the sync via `npm run sync:notion`
   - Can be run locally or in CI/CD

3. **GitHub Actions** (`.github/workflows/notion-sync.yml`)
   - Scheduled runs (configurable interval)
   - Manual dispatch trigger
   - Automatic retries on failure

## Configuration

All configuration is environment-based:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Supabase service key
- `NOTION_TOKEN` - Notion integration token
- `NOTION_DATABASE_*` - Notion database IDs
- `SUPABASE_TABLE_*` - Supabase table names

## Development

When modifying the project:
1. Keep sync logic contained in `src/jobs/sync-notion.js`
2. Use environment variables for all configuration
3. Support multiple table-to-database mappings
4. Maintain error handling and logging
5. Test locally before pushing

## Key Principles

- **Minimal complexity** - Single sync job, no web server
- **Configurable** - All settings via environment variables
- **Reliable** - Error handling, retries, logging
- **Automatable** - Works locally and in GitHub Actions
