import type { GuildSubscription } from '../entities/GuildSubscription';

/**
 * ISubscriptionRepository — Domain Repository Interface (Port)
 *
 * Defines the persistence contract for GuildSubscription aggregates.
 * Implementations live in infra/database — the domain never knows about
 * databases, ORMs, or any storage technology.
 */
export interface ISubscriptionRepository {
  /** Returns every subscription across all guilds. */
  findAll(): Promise<GuildSubscription[]>;

  /** Returns subscriptions monitoring a specific YouTube channel. */
  findByYoutubeChannelId(youtubeChannelId: string): Promise<GuildSubscription[]>;

  /**
   * Finds a single subscription by its composite identity key.
   * Returns null if no match exists.
   */
  findByGuildAndChannel(
    guildId: string,
    youtubeChannelId: string,
  ): Promise<GuildSubscription | null>;

  /** Inserts a new subscription into the store. */
  add(subscription: GuildSubscription): Promise<void>;

  /** Persists the updated state of a subscription (e.g. new lastVideoId). */
  update(subscription: GuildSubscription): Promise<void>;

  /** Removes a subscription by its composite identity key. */
  remove(guildId: string, youtubeChannelId: string): Promise<void>;
}
