# CherryPBX

A lightweight Web UI for IP-PBX systems with XSwitch as the backend.

It's still in early development, but we've chosen to build in public so everyone can follow our progress.

README in other languages:

- [中文说明](README-zh.md)

## About XSwitch

[XSwitch](https://xswitch.cn) is a VoIP system based on FreeSWITCH. It can be used as an IP-PBX, a video conferencing system, a call center server, or a gateway connecting to telecom carriers, other SIP services, WebRTC, and LLM services.

XSwitch has a nice Web UI (XUI), but it's not open source. People often ask for various features and functions that, while reasonable and useful, go far beyond XUI's design scope, which focuses primarily on FreeSWITCH management.

That's why we created CherryPBX - to build an open-source IP-PBX Web UI that everyone can use and customize to meet their specific needs. XSwitch provides powerful and comprehensive APIs, so you can potentially build any type of system - call centers, voice agents, and more.

## About Cherry Call

[Cherry Call](https://xswitch.cn/apps) is a streamlined app that integrates phone, contacts, meetings, and settings functionalities. It supports high-definition audio and video calls as well as conferencing features. It can be used in conjunction with CherryPBX.

## Tech Stack

- Next.js 16 + React 19 + TypeScript 5
- Tailwind CSS v4 + shadcn/ui

E.g.

```
$ pnpm --version && node --version
9.5.0
v22.12.0
```

## env

Create `.env`

```sh
make env
```

Check Makefile to find out how to do that manually if you don't have a `make` command on your computer.

Change `BACKEND_URL` to point to your XSwitch server URL before developing or running the application. It defaults to `https://demo.xswitch.cn`, which is a public demo. Visit https://docs.xswitch.cn/faq/#demo to find the username and password for logging in. Alternatively you can point to your own server (e.g. `http://localhost:8081`) if you installed XSwitch locally.

## Install dependencies

Run the following commands before development and production:

```bash
make install
```

## Development

```bash
make dev
```

## Build

```bash
make build
```

## Lint

```bash
make check
```
