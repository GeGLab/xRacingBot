import type { GuildNotificationSettings } from '../entities/GuildNotificationSettings';

export interface IGuildNotificationSettingsRepository {
  findByGuildId(guildId: string): Promise<GuildNotificationSettings>;
  save(settings: GuildNotificationSettings): Promise<void>;
}
