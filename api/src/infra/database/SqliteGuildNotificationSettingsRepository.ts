import Database from 'better-sqlite3';
import { GuildNotificationSettings } from '../../domain/entities/GuildNotificationSettings';
import type { IGuildNotificationSettingsRepository } from '../../domain/repositories/IGuildNotificationSettingsRepository';

interface SettingsRow {
  guild_id: string;
  mention_everyone: number;
}

export class SqliteGuildNotificationSettingsRepository
  implements IGuildNotificationSettingsRepository
{
  private readonly db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(`CREATE TABLE IF NOT EXISTS guild_notification_settings (
      guild_id TEXT PRIMARY KEY,
      mention_everyone INTEGER NOT NULL DEFAULT 0 CHECK (mention_everyone IN (0, 1)),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );`);
  }

  async findByGuildId(guildId: string): Promise<GuildNotificationSettings> {
    const row = this.db
      .prepare(
        'SELECT guild_id, mention_everyone FROM guild_notification_settings WHERE guild_id = ?',
      )
      .get(guildId) as SettingsRow | undefined;
    return row
      ? new GuildNotificationSettings(row.guild_id, row.mention_everyone === 1)
      : new GuildNotificationSettings(guildId);
  }

  async save(settings: GuildNotificationSettings): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO guild_notification_settings (guild_id, mention_everyone, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(guild_id) DO UPDATE SET mention_everyone = excluded.mention_everyone, updated_at = datetime('now')`,
      )
      .run(settings.guildId, settings.mentionEveryone ? 1 : 0);
  }

  close(): void {
    this.db.close();
  }
}
