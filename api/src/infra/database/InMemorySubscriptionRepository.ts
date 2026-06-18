import type { GuildSubscription } from '../../domain/entities/GuildSubscription';
import type { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';

/**
 * InMemorySubscriptionRepository
 *
 * In-memory implementation of ISubscriptionRepository.
 * Used in tests and as the default implementation when no database is
 * configured. Seeded with initial data via the constructor.
 *
 * Identity key: (guildId + youtubeChannelId) — one subscription per
 * guild per YouTube channel.
 */
export class InMemorySubscriptionRepository implements ISubscriptionRepository {
  private subscriptions: GuildSubscription[];

  constructor(initialData: GuildSubscription[] = []) {
    // Shallow copy so external mutations don't affect the store
    this.subscriptions = [...initialData];
  }

  async findAll(): Promise<GuildSubscription[]> {
    return [...this.subscriptions];
  }

  async findByYoutubeChannelId(youtubeChannelId: string): Promise<GuildSubscription[]> {
    return this.subscriptions.filter((s) => s.youtubeChannelId === youtubeChannelId);
  }

  async findByGuildAndChannel(
    guildId: string,
    youtubeChannelId: string,
  ): Promise<GuildSubscription | null> {
    return (
      this.subscriptions.find(
        (s) => s.guildId === guildId && s.youtubeChannelId === youtubeChannelId,
      ) ?? null
    );
  }

  async add(subscription: GuildSubscription): Promise<void> {
    this.subscriptions.push(subscription);
  }

  async update(subscription: GuildSubscription): Promise<void> {
    const index = this.subscriptions.findIndex(
      (s) =>
        s.guildId === subscription.guildId && s.youtubeChannelId === subscription.youtubeChannelId,
    );

    if (index !== -1) {
      this.subscriptions[index] = subscription;
    }
    // Silently ignore update for non-existent subscriptions
    // (use add() to insert new ones)
  }

  async remove(guildId: string, youtubeChannelId: string): Promise<void> {
    this.subscriptions = this.subscriptions.filter(
      (s) => !(s.guildId === guildId && s.youtubeChannelId === youtubeChannelId),
    );
  }

  /** Exposes internal count — useful in tests. */
  get size(): number {
    return this.subscriptions.length;
  }
}
