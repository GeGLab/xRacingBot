[Leia em Português (Brasil)](README.pt-BR.md)

# Bora de xracing

> New video. Meet in voice chat.

A fan-made Discord bot that posts new **xracing Videos** and **xracing Quedas** uploads in your server, so friends know when to get together and watch. This repository includes the bot, its HTTP backend, and a bilingual landing page.

An independent, free fan project with no affiliation, sponsorship, or partnership with xracing, YouTube, or Discord.

## Features

- Subscribe a Discord text channel to one or all configured YouTube channels.
- Receive video links through YouTube WebSub notifications, with RSS polling every five minutes as a fallback.
- Use public YouTube Atom feeds without a Google API key.
- Store subscriptions, the last notified video ID, and server ping preferences in SQLite.
- Check subscription status and send a test notification from Discord.
- Enable or disable `@everyone` mentions per server; mentions are disabled by default.
- Receive signed webhooks with HMAC verification and automatic WebSub subscription renewal.
- Explore a responsive landing page in Brazilian Portuguese and English, with a Discord bot invitation.
- Run the backend and frontend with Docker Compose.

The bot posts video links. Friends join voice chat and share their screens themselves.

## How it works

```text
YouTube uploads
    | WebSub webhook / RSS polling
    v
Application use cases <--> SQLite subscriptions and preferences
    |
    v
Discord text channel --> Friends meet in voice chat
```

Each subscription stores its last notified video ID to skip repeated entries. Both notification paths only announce videos published on the current UTC date; older videos are recorded as seen without an alert. RSS polling checks the latest upload for each subscribed YouTube channel, rather than replaying the full upload history.

## Tech stack and structure

| Component | Technologies |
| --- | --- |
| Bot and backend | TypeScript, Node.js, discord.js, Express |
| YouTube integration | WebSub / PubSubHubbub, Atom feeds, node-cron |
| Persistence | SQLite via better-sqlite3 |
| Landing page | React 19, Vite, Tailwind CSS |
| Testing and tooling | Vitest, ESLint, TypeScript |
| Containers | Docker Compose, Nginx for the frontend |

```text
api/
  src/domain/         Entities and repository contracts
  src/application/    Use cases and service contracts
  src/infra/          Discord, YouTube, SQLite, and HTTP adapters
  src/main/           Configuration, dependency wiring, jobs, and startup
  tests/              Tests for use cases, repositories, and YouTube adapters
front/
  src/                React components, translations, and site configuration
  public/             Images, icons, and static metadata
docker-compose.yml    Backend, frontend, and persistent SQLite volume
```

The backend follows Clean Architecture, separating business rules from Discord, YouTube, HTTP, and database integrations.

## Run locally

You need Node.js 20 or later, npm, and a bot application created in the [Discord Developer Portal](https://discord.com/developers/applications).

```bash
git clone https://github.com/guilhermeSDB/xracing-notifier.git
cd xracing-notifier
npm ci --prefix api
npm ci --prefix front
```

### Configure the backend

Create `api/.env` with the following settings and replace the token:

```dotenv
DISCORD_TOKEN=your_discord_bot_token
YOUTUBE_CHANNELS=xracing:UCW3oIxTLllTLK3Vy9jzdoEg,xracing Quedas:UCfjNkkpiOZjPnvfV1mcrwmQ
DATABASE_PATH=./data/bot.db
PORT=3000
YOUTUBE_CALLBACK_URL=
WEBHOOK_SECRET=
```

This configuration runs with RSS polling only, so local development does not require a public webhook URL. The backend reads `YOUTUBE_CHANNELS` (plural), using comma-separated `name:channel_id` entries. Keep tokens and `.env` files out of version control.

Start the backend in one terminal, from the repository root:

```bash
cd api
npm run dev
```

The HTTP health endpoint is available at `http://localhost:3000/health`. Slash commands are registered globally after the bot connects to Discord.

### Configure the landing page

Create `front/.env` using `front/.env.example` as a reference:

```dotenv
VITE_DISCORD_CLIENT_ID=your_discord_application_id
VITE_SITE_URL=http://localhost:5173
```

Use the Application ID of your own bot to generate its invitation. Start the frontend in a second terminal, from the repository root:

```bash
cd front
npm run dev
```

Open `http://localhost:5173` and use the invitation button to add your bot to a server. The landing page defaults to Portuguese; `?lang=en` selects English and `?lang=pt-BR` selects Brazilian Portuguese. Bot responses and notifications currently remain in Portuguese.

## Discord commands

All commands currently require the **Manage Server** permission and must be used inside a server. Select a configured YouTube channel or **Todos** (all) where applicable.

| Command | Behavior |
| --- | --- |
| `/subscribe canal:<option>` | Subscribe the current text channel to the selected YouTube channel(s). |
| `/unsubscribe canal:<option>` | Remove the server's subscription to the selected YouTube channel(s). |
| `/status` | Privately show subscriptions, destination channels, and ping preferences. |
| `/test` | Post a test notification in the current channel without mentioning anyone. |
| `/configurar-ping modo:<option>` | Choose **Sem menção** (no mention) or **Mencionar @everyone**. |

The bot needs permission to view and send messages in the destination channel. Enable **Embed Links** for video previews. An `@everyone` ping requires both the server preference and the bot's **Mention Everyone** permission in that channel.

There is one destination per server and YouTube channel. To change it, unsubscribe and then subscribe again in the new text channel.

## WebSub and deployment

To enable push notifications, set these variables in the backend environment:

```dotenv
YOUTUBE_CALLBACK_URL=https://api.example.com/webhook/youtube
WEBHOOK_SECRET=replace_with_a_long_random_secret
```

The callback must be a public HTTPS URL pointing to `/webhook/youtube`. The route accepts `GET` requests for hub verification and `POST` requests for notifications. A secret is required when a callback URL is configured. The backend subscribes at startup and schedules subscription renewal; RSS polling remains active.

The landing page can be served as a static site from `front/dist`. The bot needs a continuously running process for its Discord Gateway connection and persistent storage for SQLite.

### Docker Compose

Create a root `.env` from `.env.example` and set `DISCORD_TOKEN`, `YOUTUBE_CALLBACK_URL`, and `WEBHOOK_SECRET`. Unlike the local RSS-only setup, the supplied Compose file requires all three values.

For your own deployment, update the YouTube channels and frontend build arguments (`VITE_DISCORD_CLIENT_ID` and `VITE_SITE_URL`) directly in `docker-compose.yml`: those values are currently fixed in the file, rather than read from the root `.env`.

```bash
docker compose up -d --build
```

The frontend is exposed on port `80`, the backend on port `3000`, and the database is stored in the `sqlite_data` volume. Put an HTTPS reverse proxy in front of the backend for WebSub. To run only the bot and backend:

```bash
docker compose up -d --build api
```

## Development checks

Run from the repository root:

```bash
npm test --prefix api
npm run typecheck --prefix api
npm run lint --prefix api
npm run build --prefix api
npm run build --prefix front
```

Backend tests cover notification rules, subscription use cases, repositories, RSS parsing, and WebSub requests. Frontend production builds include TypeScript checks.

## Credits

Built by [G&G Desenvolvimento, Brazil](https://geg.dev.br/pt/), inspired by watching xracing with friends on Discord.
