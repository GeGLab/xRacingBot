import { Client, GatewayIntentBits } from 'discord.js';

import path from 'path';
import fs from 'fs';

import { YoutubeRssService } from '../infra/youtube/YoutubeRssService';
import { DiscordNotifier } from '../infra/discord/DiscordNotifier';
import { SqliteSubscriptionRepository } from '../infra/database/SqliteSubscriptionRepository';
import { YoutubeWebhookController } from '../infra/youtube/YoutubeWebhookController';

import { NotifyNewVideoUseCase } from '../application/use-cases/NotifyNewVideoUseCase';
import { HandleYoutubeWebhookUseCase } from '../application/use-cases/HandleYoutubeWebhookUseCase';
import { SubscribeChannelUseCase } from '../application/use-cases/SubscribeChannelUseCase';
import { UnsubscribeChannelUseCase } from '../application/use-cases/UnsubscribeChannelUseCase';

import { createInteractionHandler } from '../infra/discord/commands/handleInteraction';

import { env } from './env';

// ─── Discord Client ───────────────────────────────────────────────────────────
//
// Created here (not in server.ts) so every infra adapter that needs the client
// receives the exact same instance.  Login happens in server.ts after the HTTP
// server is already listening, ensuring the bot comes online only when the full
// application is healthy.

export const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// ─── Infrastructure adapters ──────────────────────────────────────────────────

const youtubeGateway = new YoutubeRssService();

const notificationService = new DiscordNotifier(discordClient);

// Persistent SQLite storage — data survives restarts.
// The .db file lives next to the project root by default; override with DATABASE_PATH env var.
const dbPath = env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'bot.db');

// Ensure the directory for the database file exists before opening the connection.
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const subscriptionRepository = new SqliteSubscriptionRepository(dbPath);

// ─── Graceful shutdown ────────────────────────────────────────────────────────
// Close the SQLite connection cleanly when the process exits, preventing
// WAL file corruption or data loss.

function shutdown(): void {
  console.log('[shutdown] Closing SQLite database…');
  subscriptionRepository.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ─── Use-cases ────────────────────────────────────────────────────────────────
//
// Each use-case depends only on the interfaces it declares — never on a
// concrete class.  Swapping an adapter (e.g. Prisma for in-memory) requires
// changing only this file.

export const notifyNewVideoUseCase = new NotifyNewVideoUseCase(
  youtubeGateway,
  notificationService,
  subscriptionRepository,
);

export const handleYoutubeWebhookUseCase = new HandleYoutubeWebhookUseCase(
  notificationService,
  subscriptionRepository,
);

export const subscribeChannelUseCase = new SubscribeChannelUseCase(subscriptionRepository);

export const unsubscribeChannelUseCase = new UnsubscribeChannelUseCase(subscriptionRepository);

// ─── Discord interaction handler ──────────────────────────────────────────────
//
// Factory builds the interactionCreate listener with all use-cases and the
// YouTube channel ID already bound.  server.ts just has to attach it to the
// client.

export const interactionHandler = createInteractionHandler(
  subscribeChannelUseCase,
  unsubscribeChannelUseCase,
  env.YOUTUBE_CHANNELS,
);

// ─── HTTP Controllers ─────────────────────────────────────────────────────────

export const youtubeWebhookController = new YoutubeWebhookController(handleYoutubeWebhookUseCase);
