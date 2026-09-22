# Superprompt

## Status

This document is the canonical superprompt for the repository starter structure.

## Goals

- Keep the starter repository simple and visible.
- Make agent participation understandable to humans.
- Reuse the same structure across repositories with minimal project-specific edits.

## Required visible files

- `README.md`
- `CONTRIBUTING.md`
- `AGENTS.md`
- `docs/superprompt.md`

## Agent visibility rules

- The repository must visibly describe which agents may help.
- The repository must visibly describe what those agents are allowed to do.
- The repository must visibly describe what requires explicit human approval.
- The repository must visibly describe how agent output should be reviewed.

## Approval rules

- No destructive changes without explicit confirmation.
- No broad repository restructuring without explicit confirmation.
- No hidden prompt-only behavior that is missing from visible repository documents.

## Portability rules

- Reuse the same file names across starter repositories.
- Keep agent rules and the approval model mostly identical across repositories.
- Change only the project-specific context when adapting this structure to another repository.

## Usage

Use this document as the source of truth for starter-repository agent guidance, and update the linked repository files when the shared model changes.
