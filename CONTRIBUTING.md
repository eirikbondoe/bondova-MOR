# Contributing to bondova-MOR

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure credentials
4. Test the sync: `npm run sync:notion`

## Project Structure

```
src/
  jobs/
    sync-notion.js    # Main sync job
.github/
  workflows/
    notion-sync.yml   # Scheduled sync workflow
```

## Running the Sync

### Local Development
```bash
npm run sync:notion
```

### Manual GitHub Actions Trigger
Use the GitHub Actions UI to manually trigger the workflow.

### Automated Scheduling
The workflow runs on a schedule (configured in `.github/workflows/notion-sync.yml`).

## Environment Variables

See `.env.example` for required environment variables.

## Code Style

- Use Node.js standard conventions
- No linting required for MVP
- Keep sync logic in `src/jobs/sync-notion.js`

## Debugging

Enable debug output by setting `DEBUG=*` before running:
```bash
DEBUG=* npm run sync:notion
```
