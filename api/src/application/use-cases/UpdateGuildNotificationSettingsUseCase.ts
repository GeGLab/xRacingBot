import { GuildNotificationSettings } from '../../domain/entities/GuildNotificationSettings';
import type { IGuildNotificationSettingsRepository } from '../../domain/repositories/IGuildNotificationSettingsRepository';

export class UpdateGuildNotificationSettingsUseCase {
  constructor(private readonly settings: IGuildNotificationSettingsRepository) {}

  async execute(guildId: string, mentionEveryone: boolean): Promise<void> {
    await this.settings.save(new GuildNotificationSettings(guildId, mentionEveryone));
  }
}
