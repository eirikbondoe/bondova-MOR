# bondova-MOR

A Supabase-to-Notion synchronization tool that keeps your Notion databases in sync with Supabase tables.

## Features

- Sync multiple Supabase tables to Notion databases
- Configurable via environment variables
- Automated scheduling via GitHub Actions
- Manual trigger support

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase project and API key
- Notion workspace and integration token
- Database IDs and table IDs configured

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### Running Locally

```bash
npm run sync:notion
```

## Documentation

- [Contributing Guide](./CONTRIBUTING.md)
- [Agent Instructions](./AGENTS.md)
- [Superprompt](./docs/superprompt.md)

## License

MIT
