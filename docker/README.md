# Web Docker Deployment

## Env

Create the Docker env file before building:

```bash
cp .env.example .env
```

Set the Docker environment variables in `.env`:

```env
NEXT_PUBLIC_BACKEND_URL="/"
NEXT_PUBLIC_BACKEND_URL_TARGET="https://your-xswitch-host"
```

Do not include `/api` in `NEXT_PUBLIC_BACKEND_URL_TARGET`.

## Build

```bash
make build-production
```

This command builds the image directly with `docker build`. `compose.yaml` is only used to start and stop containers.

## Start

```bash
make network
make start-production
```

## Stop

```bash
make stop-production
```

## Notes

- The container listens on port `3000` and is published as `3003:3000` by default.
- `compose.yaml` only starts an already-built image and will not build the image for you.
- Run `make network` once before starting if the external `webapp` network does not exist yet.
