# bondova-MOR

A system where **Skape** generates ideas that are analyzed by our custom-built **Analysis Motor**.

## Project Vision

bondova-MOR processes the following flow:

```
Skape (Ideas Source) → Adapter → Analysis Motor → Storage → Results
```

## Architecture

- **Skape Adapter** - Normalizes ideas from Skape
- **Analysis Motor** - Core analysis engine for idea evaluation
- **Storage Layer** - Persists and retrieves analysis results

See `docs/superprompt.md` for detailed architecture documentation.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run tests
npm test

# Start development
npm run dev
```

## Project Structure

```
bondova-MOR/
├── src/
│   ├── skape-adapter/     # Skape integration
│   ├── motor/             # Analysis engine
│   ├── storage/           # Database layer
│   └── index.js           # Entry point
├── tests/                 # Test files
├── docs/                  # Documentation
│   └── superprompt.md     # Architecture guide (canonical)
├── CONTRIBUTING.md        # How to contribute
├── AGENTS.md              # AI agent guidance
├── package.json           # Dependencies and scripts
└── .env.example          # Environment template
```

## Documentation

- **[docs/superprompt.md](docs/superprompt.md)** - Canonical project guide and architecture decisions
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contributor guidelines
- **[AGENTS.md](AGENTS.md)** - AI agent instructions

## Development Status

### Phase 1: Foundation & Structure ✓ (In Progress)
- [x] Project architecture defined
- [x] Starter documentation added
- [x] Project structure initialized
- [x] npm setup complete

### Phase 2: Core Implementation
- [ ] Skape integration implementation
- [ ] Analysis motor development
- [ ] Storage layer implementation

### Phase 3: Operations & CI/CD
- [ ] GitHub Actions workflows
- [ ] Deployment configuration

## Getting Involved

1. Read the architecture in `docs/superprompt.md`
2. Check `CONTRIBUTING.md` for development setup
3. See `AGENTS.md` if you're an AI contributor
4. Start with Phase 2 implementation tasks