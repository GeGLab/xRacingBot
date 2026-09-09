import dotenv from 'dotenv';
dotenv.config();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface YouTubeChannel {
  name: string;
  id: string;
}

// ─── Runtime validation ───────────────────────────────────────────────────────
// Called at module load time — if a required variable is missing the process
// exits immediately with a clear error rather than a cryptic undefined crash
// somewhere deep in the application.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `[env] Missing required environment variable: "${name}"\n` +
        `      Copy .env.example to .env and fill in the value.`,
    );
  }
  return value.trim();
}

function optionalEnv(name: string, defaultValue = ''): string {
  return process.env[name]?.trim() ?? defaultValue;
}

function optionalHttpsUrl(name: string): string {
  const value = optionalEnv(name);
  if (!value) return '';
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`[env] Environment variable "${name}" must be a valid absolute URL.`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`[env] Environment variable "${name}" must use HTTPS.`);
  }
  return parsed.toString().replace(/\/$/, '');
}

function requirePort(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(
      `[env] Environment variable "${name}" must be a valid port number (1–65535), got: "${raw}"`,
    );
  }
  return parsed;
}

/**
 * Parses a comma-separated list of YouTube channels from an environment variable.
 * Format: "Name:ChannelID,Name:ChannelID"
 * Example: "XRACING:UCW3oIxTLllTLK3Vy9jzdoEg,XRACING Quedas:UC_other_id"
 */
function parseYoutubeChannels(name: string): YouTubeChannel[] {
  const raw = requireEnv(name);

  const channels = raw.split(',').map((entry, index) => {
    const trimmed = entry.trim();
    const colonIndex = trimmed.indexOf(':');

    if (colonIndex === -1) {
      throw new Error(
        `[env] Invalid format in "${name}" at entry ${index + 1}: "${trimmed}"\n` +
          `      Expected "Name:ChannelID" but no colon was found.`,
      );
    }

    const channelName = trimmed.slice(0, colonIndex).trim();
    const channelId = trimmed.slice(colonIndex + 1).trim();

    if (channelName.length === 0 || channelId.length === 0) {
      throw new Error(
        `[env] Invalid format in "${name}" at entry ${index + 1}: "${trimmed}"\n` +
          `      Both name and channel ID must be non-empty. Format: "Name:ChannelID"`,
      );
    }

    return { name: channelName, id: channelId };
  });

  return channels;
}

// ─── Validated environment object ────────────────────────────────────────────

export const env = {
  // ── Discord ────────────────────────────────────────────────────────────────
  /** Bot token from https://discord.com/developers/applications */
  DISCORD_TOKEN: requireEnv('DISCORD_TOKEN'),

  // ── YouTube ────────────────────────────────────────────────────────────────
  /**
   * Comma-separated list of YouTube channels to monitor.
   * Format: "Name:ChannelID,Name:ChannelID"
   * Example: "XRACING:UCW3oIxTLllTLK3Vy9jzdoEg,XRACING Quedas:UC_other_id"
   */
  YOUTUBE_CHANNELS: parseYoutubeChannels('YOUTUBE_CHANNELS'),

  // ── HTTP Server ────────────────────────────────────────────────────────────
  /** TCP port for the Express webhook server. Defaults to 3000. */
  PORT: requirePort('PORT', 3000),

  // ── YouTube PubSubHubbub ───────────────────────────────────────────────────
  /**
   * Publicly reachable URL that YouTube's hub will POST notifications to.
   * Example: "https://yourapp.ngrok.io/webhook/youtube"
   * Leave empty to skip automatic hub subscription (cron-only mode).
   */
  YOUTUBE_CALLBACK_URL: optionalHttpsUrl('YOUTUBE_CALLBACK_URL'),

  /** Optional HMAC secret for verifying webhook payload authenticity. */
  WEBHOOK_SECRET: optionalEnv('WEBHOOK_SECRET'),

  // ── Database ───────────────────────────────────────────────────────────────
  /**
   * File path for the SQLite database.
   * The directory will be created automatically if it doesn't exist.
   * Defaults to "./data/bot.db".
   */
  DATABASE_PATH: optionalEnv('DATABASE_PATH', './data/bot.db'),

  // ── Runtime helpers ────────────────────────────────────────────────────────
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
} as const;

if (env.YOUTUBE_CALLBACK_URL && !env.WEBHOOK_SECRET) {
  throw new Error('[env] WEBHOOK_SECRET is required when YOUTUBE_CALLBACK_URL is configured.');
}

export type Env = typeof env;
