# Agents

## Purpose

This file makes agent participation visible to anyone working in the repository.

## Expected agent roles

- Planning agent: helps outline scope, tradeoffs, and implementation steps.
- Implementation agent: makes scoped changes approved for the task.
- Review agent: checks logic, risk, and alignment with repository rules.
- Documentation agent: keeps visible guidance consistent with repository behavior.

## Agent limits

- Agents must follow the repository documents that are visible in version control.
- Agents must not make destructive changes without explicit confirmation.
- Agents must not perform broad restructuring without explicit confirmation.
- Agents must not introduce hidden working rules that are missing from the repository docs.

## Human approval boundaries

Explicit human confirmation is required for:

- deleting files
- broad repository restructuring
- replacing starter documentation with project-specific implementation details
- changing the canonical superprompt or approval model

## Review model

- Agent output should be reviewed as a proposed change, not accepted blindly.
- When multiple agents help, their outputs should be compared against the same visible rules.
- Repository documentation should stay understandable without access to internal agent instructions.
