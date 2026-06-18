import Database from 'better-sqlite3';
import path from 'path';

/**
 * db-inspect.ts
 *
 * Quick CLI utility to inspect the contents of the bot's SQLite database.
 *
 * Usage:
 *   npx tsx src/scripts/db-inspect.ts              # uses default ./data/bot.db
 *   npx tsx src/scripts/db-inspect.ts path/to/db   # uses custom path
 */

const dbPath = process.argv[2] || path.resolve(process.cwd(), 'data', 'bot.db');

console.log('──────────────────────────────────────────');
console.log('  📂  Database Inspector');
console.log('──────────────────────────────────────────');
console.log(`  Path: ${dbPath}`);
console.log('');

let db: Database.Database;

try {
  db = new Database(dbPath, { readonly: true });
} catch (error) {
  console.error(`❌  Could not open database at "${dbPath}"`);
  console.error(`    Make sure the bot has been started at least once so the .db file is created.`);
  console.error('');
  console.error('    Raw error:', (error as Error).message);
  process.exit(1);
}

// ── List all tables ──────────────────────────────────────────────────────────

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all() as { name: string }[];

console.log(`📋  Tables found: ${tables.length === 0 ? '(none)' : tables.map((t) => t.name).join(', ')}`);
console.log('');

// ── guild_subscriptions ──────────────────────────────────────────────────────

interface SubscriptionRow {
  guild_id: string;
  channel_id: string;
  youtube_channel_id: string;
  last_video_id: string | null;
  created_at: string;
}

const hasSubscriptionsTable = tables.some((t) => t.name === 'guild_subscriptions');

if (!hasSubscriptionsTable) {
  console.log('⚠️   Table "guild_subscriptions" does not exist yet.');
  console.log('    The bot creates it automatically on first startup.');
  db.close();
  process.exit(0);
}

const rows = db.prepare('SELECT * FROM guild_subscriptions ORDER BY created_at DESC').all() as SubscriptionRow[];

console.log(`📺  guild_subscriptions: ${rows.length} row(s)`);
console.log('');

if (rows.length === 0) {
  console.log('    (empty — use /subscribe in Discord to add a subscription)');
} else {
  // Print a formatted table
  const divider = '─'.repeat(110);
  console.log(divider);
  console.log(
    '  ' +
      'guild_id'.padEnd(22) +
      'channel_id'.padEnd(22) +
      'youtube_channel_id'.padEnd(28) +
      'last_video_id'.padEnd(18) +
      'created_at',
  );
  console.log(divider);

  for (const row of rows) {
    console.log(
      '  ' +
        row.guild_id.padEnd(22) +
        row.channel_id.padEnd(22) +
        row.youtube_channel_id.padEnd(28) +
        (row.last_video_id ?? '(null)').padEnd(18) +
        row.created_at,
    );
  }

  console.log(divider);
}

console.log('');

// ── Summary ──────────────────────────────────────────────────────────────────

const uniqueGuilds = new Set(rows.map((r) => r.guild_id)).size;
const uniqueYtChannels = new Set(rows.map((r) => r.youtube_channel_id)).size;
const withLastVideo = rows.filter((r) => r.last_video_id !== null).length;
const withoutLastVideo = rows.filter((r) => r.last_video_id === null).length;

console.log('📊  Summary:');
console.log(`    • ${rows.length} subscription(s) total`);
console.log(`    • ${uniqueGuilds} unique guild(s)`);
console.log(`    • ${uniqueYtChannels} unique YouTube channel(s)`);
console.log(`    • ${withLastVideo} with last_video_id set (notified at least once)`);
console.log(`    • ${withoutLastVideo} with last_video_id = null (never notified yet)`);
console.log('');

db.close();
