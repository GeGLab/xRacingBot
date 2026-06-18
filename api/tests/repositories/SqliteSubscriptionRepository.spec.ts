import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { SqliteSubscriptionRepository } from '../../src/infra/database/SqliteSubscriptionRepository';
import { GuildSubscription } from '../../src/domain/entities/GuildSubscription';

describe('SqliteSubscriptionRepository', () => {
  let repo: SqliteSubscriptionRepository;

  beforeEach(() => {
    // Use ':memory:' so each test gets a fresh, isolated database
    repo = new SqliteSubscriptionRepository(':memory:');
  });

  afterEach(() => {
    repo.close();
  });

  // ── Helper ───────────────────────────────────────────────────────────────

  function makeSub(overrides: Partial<Record<'guildId' | 'channelId' | 'youtubeChannelId' | 'lastVideoId', string | null>> = {}): GuildSubscription {
    return new GuildSubscription(
      overrides.guildId ?? 'guild-1',
      overrides.channelId ?? 'channel-1',
      overrides.youtubeChannelId ?? 'UC_yt_123',
      (overrides.lastVideoId as string | null) ?? null,
    );
  }

  // ── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns an empty array when the database has no subscriptions', async () => {
      const result = await repo.findAll();
      expect(result).toEqual([]);
    });

    it('returns all subscriptions that have been added', async () => {
      await repo.add(makeSub({ guildId: 'g1' }));
      await repo.add(makeSub({ guildId: 'g2' }));
      await repo.add(makeSub({ guildId: 'g3', youtubeChannelId: 'UC_other' }));

      const result = await repo.findAll();
      expect(result).toHaveLength(3);
    });

    it('returns GuildSubscription instances with correct properties', async () => {
      await repo.add(makeSub({ guildId: 'g1', channelId: 'ch1', youtubeChannelId: 'UC_x', lastVideoId: 'vid-1' }));

      const [sub] = await repo.findAll();
      expect(sub).toBeInstanceOf(GuildSubscription);
      expect(sub.guildId).toBe('g1');
      expect(sub.channelId).toBe('ch1');
      expect(sub.youtubeChannelId).toBe('UC_x');
      expect(sub.lastVideoId).toBe('vid-1');
    });
  });

  // ── findByYoutubeChannelId ───────────────────────────────────────────────

  describe('findByYoutubeChannelId', () => {
    it('returns only subscriptions matching the given YouTube channel ID', async () => {
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_a' }));
      await repo.add(makeSub({ guildId: 'g2', youtubeChannelId: 'UC_a' }));
      await repo.add(makeSub({ guildId: 'g3', youtubeChannelId: 'UC_b' }));

      const result = await repo.findByYoutubeChannelId('UC_a');
      expect(result).toHaveLength(2);
      expect(result.every((s) => s.youtubeChannelId === 'UC_a')).toBe(true);
    });

    it('returns an empty array when no subscriptions match', async () => {
      await repo.add(makeSub({ youtubeChannelId: 'UC_a' }));

      const result = await repo.findByYoutubeChannelId('UC_nonexistent');
      expect(result).toEqual([]);
    });
  });

  // ── findByGuildAndChannel ────────────────────────────────────────────────

  describe('findByGuildAndChannel', () => {
    it('returns the subscription matching the composite key', async () => {
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_a', channelId: 'ch-99' }));
      await repo.add(makeSub({ guildId: 'g2', youtubeChannelId: 'UC_a' }));

      const result = await repo.findByGuildAndChannel('g1', 'UC_a');
      expect(result).not.toBeNull();
      expect(result!.guildId).toBe('g1');
      expect(result!.channelId).toBe('ch-99');
      expect(result!.youtubeChannelId).toBe('UC_a');
    });

    it('returns null when no subscription matches', async () => {
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_a' }));

      const result = await repo.findByGuildAndChannel('g1', 'UC_nonexistent');
      expect(result).toBeNull();
    });

    it('returns null when guild matches but YouTube channel does not', async () => {
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_a' }));

      const result = await repo.findByGuildAndChannel('g1', 'UC_b');
      expect(result).toBeNull();
    });

    it('returns null when YouTube channel matches but guild does not', async () => {
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_a' }));

      const result = await repo.findByGuildAndChannel('g999', 'UC_a');
      expect(result).toBeNull();
    });
  });

  // ── add ──────────────────────────────────────────────────────────────────

  describe('add', () => {
    it('inserts a new subscription that can be retrieved afterwards', async () => {
      const sub = makeSub({ guildId: 'g1', youtubeChannelId: 'UC_x' });
      await repo.add(sub);

      const found = await repo.findByGuildAndChannel('g1', 'UC_x');
      expect(found).not.toBeNull();
      expect(found!.guildId).toBe('g1');
    });

    it('stores null lastVideoId correctly', async () => {
      await repo.add(makeSub({ lastVideoId: null }));

      const [sub] = await repo.findAll();
      expect(sub.lastVideoId).toBeNull();
    });

    it('stores a non-null lastVideoId correctly', async () => {
      await repo.add(makeSub({ lastVideoId: 'vid-42' }));

      const [sub] = await repo.findAll();
      expect(sub.lastVideoId).toBe('vid-42');
    });

    it('throws when inserting a duplicate composite key (guild + youtube channel)', async () => {
      const sub = makeSub({ guildId: 'g1', youtubeChannelId: 'UC_dup' });
      await repo.add(sub);

      await expect(repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_dup', channelId: 'different-ch' }))).rejects.toThrow();
    });

    it('allows the same guild to subscribe to different YouTube channels', async () => {
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_a' }));
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_b' }));

      const all = await repo.findAll();
      expect(all).toHaveLength(2);
    });

    it('allows different guilds to subscribe to the same YouTube channel', async () => {
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_a' }));
      await repo.add(makeSub({ guildId: 'g2', youtubeChannelId: 'UC_a' }));

      const all = await repo.findAll();
      expect(all).toHaveLength(2);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates the lastVideoId of an existing subscription', async () => {
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_a', lastVideoId: null }));

      const sub = (await repo.findByGuildAndChannel('g1', 'UC_a'))!;
      sub.markVideoAsSeen('new-vid-id');
      await repo.update(sub);

      const updated = await repo.findByGuildAndChannel('g1', 'UC_a');
      expect(updated!.lastVideoId).toBe('new-vid-id');
    });

    it('updates the channelId of an existing subscription', async () => {
      await repo.add(makeSub({ guildId: 'g1', channelId: 'ch-old', youtubeChannelId: 'UC_a' }));

      const sub = new GuildSubscription('g1', 'ch-new', 'UC_a', null);
      await repo.update(sub);

      const updated = await repo.findByGuildAndChannel('g1', 'UC_a');
      expect(updated!.channelId).toBe('ch-new');
    });

    it('silently does nothing when updating a non-existent subscription', async () => {
      const ghost = makeSub({ guildId: 'g-phantom', youtubeChannelId: 'UC_ghost' });

      // Should not throw
      await expect(repo.update(ghost)).resolves.toBeUndefined();

      // Database still empty
      const all = await repo.findAll();
      expect(all).toHaveLength(0);
    });

    it('does not affect other subscriptions when updating one', async () => {
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_a', lastVideoId: 'vid-1' }));
      await repo.add(makeSub({ guildId: 'g2', youtubeChannelId: 'UC_a', lastVideoId: 'vid-2' }));

      const sub = (await repo.findByGuildAndChannel('g1', 'UC_a'))!;
      sub.markVideoAsSeen('vid-999');
      await repo.update(sub);

      const other = await repo.findByGuildAndChannel('g2', 'UC_a');
      expect(other!.lastVideoId).toBe('vid-2'); // untouched
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes an existing subscription', async () => {
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_a' }));

      await repo.remove('g1', 'UC_a');

      const result = await repo.findByGuildAndChannel('g1', 'UC_a');
      expect(result).toBeNull();

      const all = await repo.findAll();
      expect(all).toHaveLength(0);
    });

    it('silently does nothing when removing a non-existent subscription', async () => {
      await expect(repo.remove('g-nope', 'UC_nope')).resolves.toBeUndefined();
    });

    it('only removes the targeted subscription, leaving others intact', async () => {
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_a' }));
      await repo.add(makeSub({ guildId: 'g1', youtubeChannelId: 'UC_b' }));
      await repo.add(makeSub({ guildId: 'g2', youtubeChannelId: 'UC_a' }));

      await repo.remove('g1', 'UC_a');

      const all = await repo.findAll();
      expect(all).toHaveLength(2);
      expect(all.find((s) => s.guildId === 'g1' && s.youtubeChannelId === 'UC_a')).toBeUndefined();
    });
  });

  // ── close ────────────────────────────────────────────────────────────────

  describe('close', () => {
    it('prevents further operations after closing', async () => {
      repo.close();

      // better-sqlite3 throws synchronously when the DB is closed
      await expect(repo.findAll()).rejects.toThrow();

      // Create a new repo so afterEach().close() does not double-close
      repo = new SqliteSubscriptionRepository(':memory:');
    });
  });

  // ── Integration: full lifecycle ──────────────────────────────────────────

  describe('full lifecycle', () => {
    it('supports add → find → update → find → remove → find', async () => {
      // Add
      const sub = new GuildSubscription('guild-lifecycle', 'ch-42', 'UC_life', null);
      await repo.add(sub);

      // Find after add
      let found = await repo.findByGuildAndChannel('guild-lifecycle', 'UC_life');
      expect(found).not.toBeNull();
      expect(found!.lastVideoId).toBeNull();

      // Update
      found!.markVideoAsSeen('vid-abc');
      await repo.update(found!);

      // Find after update
      found = await repo.findByGuildAndChannel('guild-lifecycle', 'UC_life');
      expect(found!.lastVideoId).toBe('vid-abc');

      // Remove
      await repo.remove('guild-lifecycle', 'UC_life');

      // Find after remove
      found = await repo.findByGuildAndChannel('guild-lifecycle', 'UC_life');
      expect(found).toBeNull();
    });
  });
});
