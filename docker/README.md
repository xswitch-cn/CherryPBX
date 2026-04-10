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

## Start

```bash
make start-production
```

## Stop

```bash
make stop-production
```

## Notes

- The container listens on port `3000` and is published as `3003:3000` by default.
- `compose.yaml` uses an external Docker network named `webapp`. Create it first if needed:

```bash
docker network create webapp
```
