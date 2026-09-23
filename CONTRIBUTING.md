# Contributing to bondova-MOR

Welcome! bondova-MOR is a system where Skape generates ideas that are analyzed by our custom-built analysis motor.

## Getting Started

1. **Read the project guide** in `docs/superprompt.md` - this is the canonical source of truth for understanding the project architecture and goals
2. **Set up your environment** - see Local Development below
3. **Review the roadmap** in the main README

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run tests
npm test

# Run the analysis motor
npm start
```

### Project Structure

- `src/` - Source code for the analysis motor
  - `skape-adapter/` - Skape integration layer
  - `motor/` - Core analysis engine
  - `storage/` - Database and state management
- `tests/` - Test files
- `docs/` - Project documentation

## Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make focused, atomic commits
3. Write or update tests for your changes
4. Ensure all tests pass: `npm test`
5. Submit a pull request with a clear description

## Code Style

- Use ESLint configuration provided in the project
- Follow existing code patterns in the repository
- Add comments for complex logic

## Questions or Issues?

- Check `docs/superprompt.md` for architectural guidance
- Review existing issues on GitHub
- Reach out to the project maintainers

Thank you for contributing!
