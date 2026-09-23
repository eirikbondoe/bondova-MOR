# AI Agent Instructions for bondova-MOR

This document provides guidance for AI agents working on this project.

## Project Overview

**bondova-MOR** is a system with two primary components:

1. **Skape** - An external ideas generator
2. **Motor** - Our custom-built analysis engine that processes and analyzes ideas from Skape

## Key Context

- See `docs/superprompt.md` for the canonical project guide and architectural decisions
- The project follows Node.js conventions for tooling and configuration
- Starter documentation pattern: README, CONTRIBUTING, AGENTS, and superprompt
- Focus on clarity and maintainability in code

## Agent Priorities

1. **Understand Architecture First** - Read `docs/superprompt.md` before making changes
2. **Preserve Existing Files** - Only add new files or enhance existing ones; do not delete or significantly modify core files without explicit user confirmation
3. **Follow Project Patterns** - Adhere to the established directory structure and coding conventions
4. **Test Thoroughly** - Ensure all changes are tested before submission
5. **Document Changes** - Keep README and docs updated with any architectural changes

## Common Tasks

### Adding Features
1. Review the project architecture in `docs/superprompt.md`
2. Identify which component(s) are affected (Skape adapter, Motor, or Storage)
3. Implement with tests
4. Update relevant documentation

### Code Review
- Check for alignment with project architecture
- Ensure changes don't conflict with established patterns
- Verify tests are present and passing

### Documentation Updates
- Keep `README.md` high-level and vision-focused
- Use `docs/superprompt.md` for detailed technical decisions
- Keep CONTRIBUTING.md current with setup instructions

## Environment Setup

- Node.js based project
- Uses npm for package management
- Environment variables configured via `.env.local` (template in `.env.example`)
- Tests run via `npm test`

## Questions?

Refer to `docs/superprompt.md` for detailed project guidance and architectural decisions.
