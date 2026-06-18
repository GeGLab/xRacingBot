import { GuildSubscription } from '../../domain/entities/GuildSubscription';
import type { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';

export interface SubscribeInput {
  /** Discord guild (server) ID */
  guildId: string;
  /** Discord text-channel ID where notifications will be posted */
  channelId: string;
  /** YouTube channel ID to monitor */
  youtubeChannelId: string;
}

export interface SubscribeResult {
  /** True if this guild was already subscribed (no action taken). */
  alreadyExists: boolean;
}

/**
 * SubscribeChannelUseCase
 *
 * Registers a Discord guild to receive notifications when a YouTube
 * channel publishes a new video. Idempotent — calling twice for the
 * same guild + YouTube channel is a no-op.
 */
export class SubscribeChannelUseCase {
  constructor(private readonly repository: ISubscriptionRepository) {}

  async execute(input: SubscribeInput): Promise<SubscribeResult> {
    const existing = await this.repository.findByGuildAndChannel(
      input.guildId,
      input.youtubeChannelId,
    );

    if (existing) {
      return { alreadyExists: true };
    }

    const subscription = new GuildSubscription(
      input.guildId,
      input.channelId,
      input.youtubeChannelId,
    );

    await this.repository.add(subscription);
    return { alreadyExists: false };
  }
}
