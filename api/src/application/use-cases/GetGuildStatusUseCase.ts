import type { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import type { IGuildNotificationSettingsRepository } from '../../domain/repositories/IGuildNotificationSettingsRepository';
import type { GuildSubscription } from '../../domain/entities/GuildSubscription';
import type { GuildNotificationSettings } from '../../domain/entities/GuildNotificationSettings';

export interface GuildStatus {
  subscriptions: GuildSubscription[];
  preferences: GuildNotificationSettings;
}

export class GetGuildStatusUseCase {
  constructor(
    private readonly subscriptions: ISubscriptionRepository,
    private readonly settings: IGuildNotificationSettingsRepository,
  ) {}

  async execute(guildId: string): Promise<GuildStatus> {
    const [subscriptions, preferences] = await Promise.all([
      this.subscriptions.findAll(),
      this.settings.findByGuildId(guildId),
    ]);
    return {
      subscriptions: subscriptions.filter((subscription) => subscription.guildId === guildId),
      preferences,
    };
  }
}
