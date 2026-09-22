# Agent Instructions

This document provides guidance for AI agents working on this project.

## Project Overview

bondova-MOR is a Supabase-to-Notion synchronization tool that syncs data from Supabase tables to Notion databases.

## Key Files

- `src/jobs/sync-notion.js` - Main synchronization logic
- `package.json` - Dependencies and npm scripts
- `.github/workflows/notion-sync.yml` - GitHub Actions workflow
- `.env.example` - Environment variable reference

## Development Guidelines

1. All sync logic should live in `src/jobs/sync-notion.js`
2. Configuration is supplied via environment variables
3. The sync runs as a Node.js job via `npm run sync:notion`
4. The job is exposed through a GitHub Actions workflow

## Common Tasks

### Adding a new Supabase table to Notion sync
1. Add the table configuration to `.env.example`
2. Update `sync-notion.js` to handle the new table mapping
3. Test locally with `npm run sync:notion`

### Modifying the sync schedule
Edit `.github/workflows/notion-sync.yml` and adjust the `schedule` cron expression.

### Debugging sync issues
Run locally with `DEBUG=*` environment variable set for verbose output.

## See Also

- [Superprompt](./docs/superprompt.md) - Canonical source of truth for agent guidance
