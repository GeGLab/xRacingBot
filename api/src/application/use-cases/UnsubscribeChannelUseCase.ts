import type { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';

export interface UnsubscribeInput {
  /** Discord guild (server) ID */
  guildId: string;
  /** YouTube channel ID to stop monitoring */
  youtubeChannelId: string;
}

export interface UnsubscribeResult {
  /** True if the guild was subscribed and has now been removed. */
  wasSubscribed: boolean;
}

/**
 * UnsubscribeChannelUseCase
 *
 * Removes a Discord guild's subscription so it no longer receives
 * notifications for the given YouTube channel. Idempotent — calling
 * for a non-existent subscription is a no-op.
 */
export class UnsubscribeChannelUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(input: UnsubscribeInput): Promise<UnsubscribeResult> {
    const existing = await this.repository.findByGuildAndChannel(
      input.guildId,
      input.youtubeChannelId,
    );

    if (!existing) {
      return { wasSubscribed: false };
    }

    await this.repository.remove(input.guildId, input.youtubeChannelId);
    return { wasSubscribed: true };
  }
}
