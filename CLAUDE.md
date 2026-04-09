# CLAUDE.md

## Hard Rules (Must Follow)

1. **After completing each task, must execute `make check` to ensure all lint and type checks pass before considering it complete.**
2. **Prohibited from autonomously executing `git commit`. After code modifications are complete, wait for user to manually commit.**
3. **After completing UI page-related tasks, must check i18n internationalization support to ensure all text uses multilingual versions, no hardcoded strings allowed.**

## Commands

**Package manager:** pnpm (required, not npm/yarn)

```bash
# Build & Check
make check
```
