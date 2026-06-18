# xRacing Notifier

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-14-5865F2?logo=discord&logoColor=white)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

A production-ready Discord bot that monitors YouTube channels and instantly delivers rich embed notifications to Discord text channels whenever a new video is published. Supports both **RSS polling** (cron-based, no API key required) and **real-time push** via YouTube's PubSubHubbub webhook.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running](#running)
- [YouTube PubSubHubbub Setup](#youtube-pubsubhubbub-setup)
- [Switching to Prisma](#switching-to-prisma)
- [Project Structure](#project-structure)

---

## Overview

xRacing Notifier watches one or more YouTube channels on behalf of multiple Discord servers. When a new video appears, it sends a formatted embed with the video title and URL to every Discord channel that has subscribed.

Two complementary delivery modes are supported and can run simultaneously:

| Mode | How it works | API key? |
|---|---|---|
| **RSS Polling** | A cron job calls `NotifyNewVideoUseCase` on a schedule, fetching the public Atom feed (`feeds/videos.xml`) | No |
| **PubSubHubbub** | YouTube POSTs to your webhook endpoint the moment a video is published; `HandleYoutubeWebhookUseCase` processes it | No |

### High-level Flow (ASCII)

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │                          Entry Points                               │
 │                                                                     │
 │   Cron Job (checkNewVideos)        HTTP Server (Express)            │
 │   src/main/jobs/                   src/infra/http/app.ts            │
 └──────────────┬──────────────────────────────┬──────────────────────┘
                │                              │
                ▼                              ▼
 ┌─────────────────────────────────────────────────────────────────────┐
 │                       Application Layer                             │
 │                                                                     │
 │   NotifyNewVideoUseCase          HandleYoutubeWebhookUseCase        │
 │   (poll → fetch → diff → notify) (push → parse → diff → notify)    │
 │                                                                     │
 │   IYoutubeGateway (port)         INotificationService (port)        │
 │   ISubscriptionRepository (port)                                    │
 └────────┬───────────────────────────────┬────────────────────────────┘
          │ implements                    │ implements
          │                              │
 ┌────────▼──────────┐     ┌─────────────▼──────────────────────────────┐
 │   Domain Layer    │     │          Infrastructure Layer               │
 │                   │     │                                             │
 │  Video            │     │  YoutubeRssService  (RSS feed via axios)    │
 │  GuildSubscription│     │  DiscordNotifier    (discord.js embed)      │
 │  ISubscription-   │     │  InMemorySubscription-                      │
 │  Repository       │     │    Repository      (default / tests)        │
 │  (interface)      │     │  YoutubeWebhookController                   │
 └───────────────────┘     │  Express app (createApp factory)            │
                           └─────────────────────────────────────────────┘
```

---

## Architecture

The project follows **Clean Architecture** (Ports & Adapters / Hexagonal). Each layer has a strict dependency rule: inner layers never import from outer layers.

```
Domain  ←  Application  ←  Infrastructure  ←  Main
```

### Layer Responsibilities

| Layer | Location | Depends on | Contents |
|---|---|---|---|
| **Domain** | `src/domain/` | nothing | Entities, repository interfaces |
| **Application** | `src/application/` | Domain only | Use-cases, service ports (interfaces) |
| **Infrastructure** | `src/infra/` | Application + Domain | Concrete adapters (Discord, YouTube, DB) |
| **Main** | `src/main/` | Everything | Composition root, env loading, server bootstrap |

### Key Design Decisions

- **Dependency Inversion** — use-cases receive their dependencies (gateway, notifier, repository) via constructor injection. They are testable in isolation using plain `vi.fn()` mocks.
- **No API key** — the RSS gateway reads YouTube's public Atom feed, so no Google Cloud project is required.
- **Idempotency** — `lastVideoId` is stored per subscription; re-running the cron or re-receiving the same webhook payload is a no-op.
- **Swap-able storage** — the repository is behind `ISubscriptionRepository`. `InMemorySubscriptionRepository` is the default; Prisma drops in by replacing one line in `container.ts`.

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20 or later |
| npm | 9 or later |
| A Discord application & bot token | [Create one here](https://discord.com/developers/applications) |
| (Optional) A public HTTPS URL | Required only for PubSubHubbub — use [ngrok](https://ngrok.com/) during development |

### 1 — Clone

```bash
git clone https://github.com/your-org/xracingnotifier.git
cd xracingnotifier
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in every variable (see the [Configuration](#configuration) table below).

### 4 — Invite the bot to your server

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Select your application → **OAuth2 → URL Generator**.
3. Scopes: `bot` · Bot Permissions: `Send Messages`, `Embed Links`, `View Channels`.
4. Open the generated URL and invite the bot to your server.

### 5 — Run in development mode

```bash
npm run dev
```

The server starts on `http://localhost:3000` (or the `PORT` you configured). You should see:

```
🚀 App iniciado
Token: OK
```

---

## Configuration

All configuration is loaded from environment variables. Copy `.env.example` to `.env` and fill in the values. **Never commit `.env` to version control.**

| Variable | Required | Description |
|---|---|---|
| `DISCORD_TOKEN` | ✅ | Bot token from the Discord Developer Portal. |
| `DEFAULT_GUILD_ID` | ✅ | Snowflake ID of the Discord server to seed the default subscription. Right-click the server name → *Copy Server ID* (requires Developer Mode). |
| `DEFAULT_CHANNEL_ID` | ✅ | Snowflake ID of the Discord text channel where notifications are posted. Right-click the channel → *Copy Channel ID*. |
| `YOUTUBE_CHANNEL_ID` | ✅ | YouTube channel ID to monitor (the `UC…` string from the channel URL). |
| `PORT` | ❌ | Port the Express HTTP server listens on. Defaults to `3000`. |
| `YOUTUBE_CALLBACK_URL` | ❌ | Publicly accessible URL that YouTube will POST new-video notifications to. Required for PubSubHubbub. Example: `https://abc123.ngrok.io/webhook/youtube`. |
| `WEBHOOK_SECRET` | ❌ | Optional HMAC secret for verifying incoming PubSubHubbub payloads. Reserved for future use. |

> **Finding your YouTube channel ID**
> Open the channel page in a browser. The URL will either contain `@handle` or a direct `UC…` ID.
> If you see a handle, go to the page source and search for `"channelId"` — the `UC…` string is right there.

---

## Running

### Development (with hot-reload)

```bash
npm run dev
```

Uses `tsx watch` to transpile TypeScript on-the-fly and restart on every file change.

### Build (compile to JavaScript)

```bash
npm run build
```

Outputs to `dist/`. The TypeScript compiler applies all settings from `tsconfig.json`.

### Production start

```bash
npm run start
```

Runs the pre-compiled `dist/main/server.js` with plain Node.js — no TypeScript overhead.

### Run tests

```bash
npm test
```

Runs the full Vitest suite. All spec files are discovered from `tests/**/*.spec.ts`.

```
 ✓ tests/use-cases/NotifyNewVideoUseCase.spec.ts          (6 tests)
 ✓ tests/repositories/InMemorySubscriptionRepository.spec.ts  (8 tests)
 ✓ tests/youtube/YoutubeRssService.spec.ts                (6 tests)
```

### Run tests in watch mode

```bash
npm run test:watch
```

Vitest re-runs affected test files automatically as you edit source or test files.

### Coverage report

```bash
npm run coverage
```

Generates an HTML report at `coverage/index.html` and a JSON summary at `coverage/coverage-summary.json`. Open the HTML file in a browser for a line-by-line breakdown.

---

## YouTube PubSubHubbub Setup

YouTube's [PubSubHubbub hub](https://pubsubhubbub.appspot.com/) pushes an Atom XML payload to your callback URL within seconds of a new video being published. This eliminates polling latency entirely.

### Step 1 — Expose a public URL

During local development, use [ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

Copy the `https://` forwarding URL (e.g. `https://abc123.ngrok.io`) and set `YOUTUBE_CALLBACK_URL` accordingly:

```
YOUTUBE_CALLBACK_URL=https://abc123.ngrok.io/webhook/youtube
```

Restart the dev server after changing `.env`.

### Step 2 — Register the subscription with Google's hub

Send a `POST` to `https://pubsubhubbub.appspot.com/subscribe` with the following form-encoded body:

```
hub.callback     = https://your-public-domain.com/webhook/youtube
hub.mode         = subscribe
hub.topic        = https://www.youtube.com/xml/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID
hub.verify       = async
hub.lease_seconds= 432000
```

You can do this with `curl`:

```bash
curl -X POST https://pubsubhubbub.appspot.com/subscribe \
  -d "hub.callback=https://your-public-domain.com/webhook/youtube" \
  -d "hub.mode=subscribe" \
  -d "hub.topic=https://www.youtube.com/xml/feeds/videos.xml?channel_id=UCuAXFkgsw1L7xaCfnd5JJOw" \
  -d "hub.verify=async" \
  -d "hub.lease_seconds=432000"
```

### Step 3 — Verification handshake

After receiving the POST, Google's hub will immediately send a `GET` request to your `/webhook/youtube` endpoint with a `hub.challenge` query parameter. The `YoutubeWebhookController.handleVerification` handler echoes back the challenge to confirm ownership.

Make sure your server is running and accessible before sending the subscription request.

### Step 4 — Renewal

Hub subscriptions expire (default lease is ~5 days). Re-send the `POST` above before expiry, or set up a cron job to re-subscribe automatically. The hub will also send a new challenge on renewal.

---

## Switching to Prisma

The default `InMemorySubscriptionRepository` stores subscriptions in memory — data is lost on restart. To persist subscriptions across restarts, swap in a Prisma-backed repository in four steps:

### 1 — Install Prisma

```bash
npm install @prisma/client
npm install --save-dev prisma
```

### 2 — Initialise Prisma and create the schema

```bash
npx prisma init --datasource-provider sqlite
```

Add the `GuildSubscription` model to `prisma/schema.prisma`:

```prisma
model GuildSubscription {
  id                String  @id @default(cuid())
  guildId           String
  channelId         String
  youtubeChannelId  String
  lastVideoId       String?

  @@unique([guildId, youtubeChannelId])
}
```

Run the migration:

```bash
npx prisma migrate dev --name init
```

### 3 — Implement PrismaSubscriptionRepository

Create `src/infra/database/PrismaSubscriptionRepository.ts` implementing `ISubscriptionRepository`, injecting a `PrismaClient` instance.

### 4 — Update the composition root

Open `src/main/container.ts` and replace:

```typescript
// Before
import { InMemorySubscriptionRepository } from '../infra/database/InMemorySubscriptionRepository';
const repo = new InMemorySubscriptionRepository([defaultSubscription]);
```

```typescript
// After
import { PrismaClient } from '@prisma/client';
import { PrismaSubscriptionRepository } from '../infra/database/PrismaSubscriptionRepository';
const repo = new PrismaSubscriptionRepository(new PrismaClient());
```

No other file needs to change — because every use-case depends only on `ISubscriptionRepository`, not on any concrete class.

---

## Project Structure

```
xracingnotifier/
│
├── src/
│   │
│   ├── domain/                         # Inner-most layer — no external dependencies
│   │   ├── entities/
│   │   │   ├── Video.ts                # Value object: id, title, url, publishedAt
│   │   │   └── GuildSubscription.ts    # Aggregate: tracks lastVideoId per guild+channel
│   │   └── repositories/
│   │       └── ISubscriptionRepository.ts  # Port: findAll, findByYoutubeChannelId, update
│   │
│   ├── application/                    # Use-cases + outbound ports
│   │   ├── services/
│   │   │   ├── INotificationService.ts # Port: send({ channelId, title, url })
│   │   │   └── IYoutubeGateway.ts      # Port: getLatestVideo(channelId): Video | null
│   │   └── use-cases/
│   │       ├── NotifyNewVideoUseCase.ts         # Cron path: poll → diff → notify
│   │       └── HandleYoutubeWebhookUseCase.ts   # Push path: receive → diff → notify
│   │
│   ├── infra/                          # Concrete adapters — implement the ports
│   │   ├── database/
│   │   │   ├── InMemorySubscriptionRepository.ts  # Default impl (no DB required)
│   │   │   └── prisma/                            # (placeholder for Prisma migration)
│   │   ├── discord/
│   │   │   ├── DiscordClient.ts        # discord.js Client singleton / bootstrap
│   │   │   └── DiscordNotifier.ts      # INotificationService → sends rich embeds
│   │   ├── http/
│   │   │   ├── app.ts                  # Express factory (createApp) — testable, no listen()
│   │   │   └── webhook/
│   │   │       └── youtube.webhook.ts  # Route-level wiring for webhook endpoints
│   │   └── youtube/
│   │       ├── YoutubeRssService.ts    # IYoutubeGateway → fetches Atom feed via axios
│   │       ├── YoutubeTypes.ts         # xml2js-parsed feed shape (TypeScript interfaces)
│   │       └── YoutubeWebhookController.ts  # Handles GET (verify) + POST (notify)
│   │
│   └── main/                           # Composition root — wires everything together
│       ├── container.ts                # Instantiates and injects all dependencies
│       ├── env.ts                      # Validated environment variables (dotenv)
│       ├── server.ts                   # Bootstrap: starts Express + Discord client
│       └── jobs/
│           └── checkNewVideos.job.ts   # Cron job: schedules NotifyNewVideoUseCase
│
├── tests/                              # Vitest test suites (mirrors src/ structure)
│   ├── use-cases/
│   │   └── NotifyNewVideoUseCase.spec.ts           # 6 tests — mocked gateway/notifier/repo
│   ├── repositories/
│   │   └── InMemorySubscriptionRepository.spec.ts  # 8 tests — real repo, no mocks
│   └── youtube/
│       └── YoutubeRssService.spec.ts               # 6 tests — axios mocked, XML fixtures
│
├── prisma/                             # Prisma schema and migrations (empty until needed)
│
├── coverage/                           # Generated by `npm run coverage` — not committed
├── dist/                               # Generated by `npm run build` — not committed
│
├── .env                                # Local secrets — NEVER commit
├── .env.example                        # Template for all required env variables
├── .prettierrc                         # Prettier formatting rules
├── eslint.config.mjs                   # ESLint flat config (typescript-eslint)
├── vitest.config.ts                    # Vitest: globals, node env, v8 coverage
├── tsconfig.json                       # TypeScript: ES2022, CommonJS, strict
├── package.json                        # Scripts + dependencies
└── README.md                           # You are here
```

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes — ensure all tests pass: `npm test`
3. Keep coverage above 80%: `npm run coverage`
4. Submit a pull request with a clear description of the change.

---

## License

ISC © xRacing Notifier contributors