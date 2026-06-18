import Database from 'better-sqlite3';

import { GuildSubscription } from '../../domain/entities/GuildSubscription';
import type { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';

/**
 * Row shape returned by better-sqlite3 for the `guild_subscriptions` table.
 */
interface SubscriptionRow {
  guild_id: string;
  channel_id: string;
  youtube_channel_id: string;
  last_video_id: string | null;
}

/**
 * SqliteSubscriptionRepository
 *
 * Persistent implementation of ISubscriptionRepository backed by a local
 * SQLite database file via better-sqlite3.
 *
 * The table is created automatically on construction (IF NOT EXISTS),
 * so there is no separate migration step required.
 *
 * Identity key: (guild_id + youtube_channel_id) — one subscription per
 * guild per YouTube channel, matching the in-memory implementation contract.
 */
export class SqliteSubscriptionRepository implements ISubscriptionRepository {
  private readonly db: Database.Database;

  // ── Prepared statements (cached for performance) ─────────────────────────
  private readonly stmtFindAll: Database.Statement;
  private readonly stmtFindByYoutubeChannelId: Database.Statement;
  private readonly stmtFindByGuildAndChannel: Database.Statement;
  private readonly stmtInsert: Database.Statement;
  private readonly stmtUpdate: Database.Statement;
  private readonly stmtRemove: Database.Statement;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);

    // Enable WAL mode for better concurrent read performance
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this.createTable();

    // ── Prepare all statements once ──────────────────────────────────────
    this.stmtFindAll = this.db.prepare(`
      SELECT guild_id, channel_id, youtube_channel_id, last_video_id
      FROM guild_subscriptions
    `);

    this.stmtFindByYoutubeChannelId = this.db.prepare(`
      SELECT guild_id, channel_id, youtube_channel_id, last_video_id
      FROM guild_subscriptions
      WHERE youtube_channel_id = ?
    `);

    this.stmtFindByGuildAndChannel = this.db.prepare(`
      SELECT guild_id, channel_id, youtube_channel_id, last_video_id
      FROM guild_subscriptions
      WHERE guild_id = ? AND youtube_channel_id = ?
    `);

    this.stmtInsert = this.db.prepare(`
      INSERT INTO guild_subscriptions (guild_id, channel_id, youtube_channel_id, last_video_id)
      VALUES (?, ?, ?, ?)
    `);

    this.stmtUpdate = this.db.prepare(`
      UPDATE guild_subscriptions
      SET channel_id = ?, last_video_id = ?
      WHERE guild_id = ? AND youtube_channel_id = ?
    `);

    this.stmtRemove = this.db.prepare(`
      DELETE FROM guild_subscriptions
      WHERE guild_id = ? AND youtube_channel_id = ?
    `);
  }

  // ── ISubscriptionRepository implementation ─────────────────────────────────

  async findAll(): Promise<GuildSubscription[]> {
    const rows = this.stmtFindAll.all() as SubscriptionRow[];
    return rows.map(SqliteSubscriptionRepository.rowToEntity);
  }

  async findByYoutubeChannelId(youtubeChannelId: string): Promise<GuildSubscription[]> {
    const rows = this.stmtFindByYoutubeChannelId.all(youtubeChannelId) as SubscriptionRow[];
    return rows.map(SqliteSubscriptionRepository.rowToEntity);
  }

  async findByGuildAndChannel(
    guildId: string,
    youtubeChannelId: string,
  ): Promise<GuildSubscription | null> {
    const row = this.stmtFindByGuildAndChannel.get(guildId, youtubeChannelId) as
      | SubscriptionRow
      | undefined;
    return row ? SqliteSubscriptionRepository.rowToEntity(row) : null;
  }

  async add(subscription: GuildSubscription): Promise<void> {
    this.stmtInsert.run(
      subscription.guildId,
      subscription.channelId,
      subscription.youtubeChannelId,
      subscription.lastVideoId,
    );
  }

  async update(subscription: GuildSubscription): Promise<void> {
    this.stmtUpdate.run(
      subscription.channelId,
      subscription.lastVideoId,
      subscription.guildId,
      subscription.youtubeChannelId,
    );
  }

  async remove(guildId: string, youtubeChannelId: string): Promise<void> {
    this.stmtRemove.run(guildId, youtubeChannelId);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Gracefully closes the database connection.
   * Call this on process shutdown (e.g. SIGINT / SIGTERM handler).
   */
  close(): void {
    this.db.close();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private createTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS guild_subscriptions (
        guild_id            TEXT NOT NULL,
        channel_id          TEXT NOT NULL,
        youtube_channel_id  TEXT NOT NULL,
        last_video_id       TEXT,
        created_at          TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (guild_id, youtube_channel_id)
      );
    `);
  }

  private static rowToEntity(row: SubscriptionRow): GuildSubscription {
    return new GuildSubscription(
      row.guild_id,
      row.channel_id,
      row.youtube_channel_id,
      row.last_video_id,
    );
  }
}
