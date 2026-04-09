.PHONY: dev build start format lint check clean install

# env
env:
	cp .env.example .env

# Development
dev:
	pnpm dev

# Build for production
build:
	pnpm build

# Start production server
start:
	pnpm start

# Format code
format:
	pnpm format

# Lint code
lint:
	pnpm lint

# Install dependencies
install:
	pnpm install

# Clean build artifacts
clean:
	rm -rf .next out dist

# Update dependencies
update:
	pnpm update

# Type check
type-check:
	npx tsc --noEmit

# Check code (format + lint + type check)
check:
	pnpm format
	pnpm lint
	pnpm typecheck
