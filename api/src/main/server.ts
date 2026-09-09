import { createApp } from '../infra/http/app';
import { startCheckNewVideosJob } from './jobs/checkNewVideos.job';
import { startYoutubeWebSubRenewalJob } from './jobs/renewYoutubeWebSub.job';
import { registerSlashCommands } from '../infra/discord/commands/registerCommands';
import {
  discordClient,
  notifyNewVideoUseCase,
  youtubeWebhookController,
  interactionHandler,
  youtubeWebSubService,
  closeInfrastructure,
} from './container';
import { env } from './env';

/**
 * bootstrap
 *
 * Application entry-point. Starts all long-running services in order:
 *
 *   1. Express HTTP server  — must be listening before Discord comes online
 *                             so the webhook endpoint is reachable from the
 *                             very first moment the bot appears in a guild.
 *
 *   2. Discord bot login    — fires the "ready" event once the WebSocket
 *                             handshake with Discord's gateway is complete.
 *
 *   3. Slash commands       — registered globally after "ready" so the bot
 *                             exposes /subscribe and /unsubscribe in every
 *                             server it joins.
 *
 *   4. Cron job             — starts the 5-minute RSS polling loop only after
 *                             Discord is confirmed ready, so the first tick
 *                             can always deliver notifications.
 *
 * Graceful shutdown is wired to SIGINT / SIGTERM so Docker, PM2, and
 * Ctrl-C all clean up sockets before the process exits.
 */
async function bootstrap(): Promise<void> {
  console.log('──────────────────────────────────────────');
  console.log('  xRacing Notifier  |  starting up…');
  console.log('──────────────────────────────────────────');
  console.log(`  Environment : ${env.NODE_ENV}`);
  console.log(`  HTTP port   : ${env.PORT}`);
  console.log('──────────────────────────────────────────');

  // ── 1. HTTP server ────────────────────────────────────────────────────────
  const app = createApp(youtubeWebhookController);

  const httpServer = app.listen(env.PORT, () => {
    console.log(`[http]    ✅  Listening on port ${env.PORT}`);
    console.log(`[http]    🔗  Webhook endpoint: POST /webhook/youtube`);
    console.log(`[http]    🔗  Health check:     GET  /health`);
  });

  await youtubeWebSubService.subscribeAll(env.YOUTUBE_CHANNELS).catch((error) => {
    console.error('[websub] Initial subscription failed; polling fallback remains active:', error);
  });
  startYoutubeWebSubRenewalJob(youtubeWebSubService, env.YOUTUBE_CHANNELS);

  // ── 2. Discord bot ────────────────────────────────────────────────────────
  discordClient.once('ready', async (readyClient) => {
    console.log(`[discord] ✅  Logged in as ${readyClient.user.tag}`);

    // ── 3. Register slash commands globally ──────────────────────────────────
    try {
      await registerSlashCommands(readyClient, env.YOUTUBE_CHANNELS);
    } catch (error) {
      console.error('[discord] ❌  Failed to register slash commands:', error);
    }

    // ── 4. Cron job — start only after Discord is confirmed ready ───────────
    startCheckNewVideosJob(notifyNewVideoUseCase);
  });

  // ── Wire the interaction handler for /subscribe and /unsubscribe ──────────
  discordClient.on('interactionCreate', (interaction) => {
    void interactionHandler(interaction);
  });

  discordClient.on('error', (error) => {
    console.error('[discord] ❌  Client error:', error);
  });

  discordClient.on('warn', (message) => {
    console.warn('[discord] ⚠️   Warning:', message);
  });

  console.log('[discord] 🔐  Logging in…');
  await discordClient.login(env.DISCORD_TOKEN);

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[shutdown] 🛑  Received ${signal} — shutting down gracefully…`);

    // Stop accepting new HTTP connections
    httpServer.close(() => {
      console.log('[shutdown] ✅  HTTP server closed.');
    });

    // Close the Discord WebSocket connection cleanly
    discordClient.destroy();
    console.log('[shutdown] ✅  Discord client destroyed.');
    closeInfrastructure();

    console.log('[shutdown] 👋  Bye!');
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error: unknown) => {
  console.error('❌  Fatal error during bootstrap:', error);
  process.exit(1);
});
