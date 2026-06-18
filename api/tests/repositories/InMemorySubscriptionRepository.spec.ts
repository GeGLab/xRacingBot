import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySubscriptionRepository } from '../../src/infra/database/InMemorySubscriptionRepository';
import { GuildSubscription } from '../../src/domain/entities/GuildSubscription';

describe('InMemorySubscriptionRepository', () => {
  let repo: InMemorySubscriptionRepository;

  const SUB_A = new GuildSubscription('guild-A', 'discord-ch-A', 'yt-ch-A', null);
  const SUB_B = new GuildSubscription('guild-B', 'discord-ch-B', 'yt-ch-B', 'prev-video-id');

  beforeEach(() => {
    repo = new InMemorySubscriptionRepository([SUB_A, SUB_B]);
  });

  // ── findAll ──────────────────────────────────────────────────────────────

  it('findAll returns all seeded subscriptions', async () => {
    // Arrange — done in beforeEach

    // Act
    const result = await repo.findAll();

    // Assert
    expect(result).toHaveLength(2);
  });

  it('findAll returns a copy — mutating the result does not affect the store', async () => {
    // Arrange
    const first = await repo.findAll();

    // Act
    first.pop();
    const second = await repo.findAll();

    // Assert
    expect(second).toHaveLength(2);
  });

  // ── findByYoutubeChannelId ───────────────────────────────────────────────

  it('findByYoutubeChannelId returns matching subscriptions', async () => {
    // Arrange — done in beforeEach

    // Act
    const result = await repo.findByYoutubeChannelId('yt-ch-A');

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].guildId).toBe('guild-A');
  });

  it('findByYoutubeChannelId returns empty array when channel has no subscribers', async () => {
    // Arrange — done in beforeEach

    // Act
    const result = await repo.findByYoutubeChannelId('yt-ch-unknown');

    // Assert
    expect(result).toHaveLength(0);
  });

  it('findByYoutubeChannelId returns multiple when several guilds subscribe to same channel', async () => {
    // Arrange — add a second subscription for the same YouTube channel
    const sub2 = new GuildSubscription('guild-C', 'discord-ch-C', 'yt-ch-A', null);
    await repo.add(sub2);

    // Act
    const result = await repo.findByYoutubeChannelId('yt-ch-A');

    // Assert
    expect(result).toHaveLength(2);
  });

  // ── findByGuildAndChannel ────────────────────────────────────────────────

  it('findByGuildAndChannel returns the matching subscription', async () => {
    // Arrange — done in beforeEach

    // Act
    const result = await repo.findByGuildAndChannel('guild-A', 'yt-ch-A');

    // Assert
    expect(result).not.toBeNull();
    expect(result?.guildId).toBe('guild-A');
    expect(result?.channelId).toBe('discord-ch-A');
    expect(result?.youtubeChannelId).toBe('yt-ch-A');
  });

  it('findByGuildAndChannel returns null when guildId does not match', async () => {
    // Arrange — done in beforeEach

    // Act
    const result = await repo.findByGuildAndChannel('guild-unknown', 'yt-ch-A');

    // Assert
    expect(result).toBeNull();
  });

  it('findByGuildAndChannel returns null when youtubeChannelId does not match', async () => {
    // Arrange — done in beforeEach

    // Act
    const result = await repo.findByGuildAndChannel('guild-A', 'yt-ch-unknown');

    // Assert
    expect(result).toBeNull();
  });

  it('findByGuildAndChannel returns null on completely empty repo', async () => {
    // Arrange
    const emptyRepo = new InMemorySubscriptionRepository();

    // Act
    const result = await emptyRepo.findByGuildAndChannel('guild-A', 'yt-ch-A');

    // Assert
    expect(result).toBeNull();
  });

  // ── add ──────────────────────────────────────────────────────────────────

  it('add inserts a new subscription into the store', async () => {
    // Arrange
    const newSub = new GuildSubscription('guild-Z', 'discord-ch-Z', 'yt-ch-Z', null);

    // Act
    await repo.add(newSub);

    // Assert
    expect(repo.size).toBe(3);
    const all = await repo.findAll();
    expect(all.some((s) => s.guildId === 'guild-Z')).toBe(true);
  });

  // ── update ───────────────────────────────────────────────────────────────

  it('update persists the new lastVideoId for an existing subscription', async () => {
    // Arrange
    const updated = new GuildSubscription('guild-A', 'discord-ch-A', 'yt-ch-A', 'new-vid-123');

    // Act
    await repo.update(updated);

    // Assert
    const all = await repo.findAll();
    const found = all.find((s) => s.guildId === 'guild-A');
    expect(found?.lastVideoId).toBe('new-vid-123');
  });

  it('update does nothing when subscription does not exist (no error thrown)', async () => {
    // Arrange
    const phantom = new GuildSubscription('ghost-guild', 'ch', 'yt-ch-X', 'vid-1');

    // Act & Assert — must not throw
    await expect(repo.update(phantom)).resolves.toBeUndefined();
    expect(await repo.findAll()).toHaveLength(2); // unchanged
  });

  // ── remove ───────────────────────────────────────────────────────────────

  it('remove deletes a subscription by composite key', async () => {
    // Arrange — repo has 2 subs from beforeEach

    // Act
    await repo.remove('guild-A', 'yt-ch-A');

    // Assert
    expect(repo.size).toBe(1);
    const remaining = await repo.findAll();
    expect(remaining[0].guildId).toBe('guild-B');
  });

  it('remove does nothing when the subscription does not exist (no error thrown)', async () => {
    // Arrange — done in beforeEach

    // Act & Assert — must not throw
    await expect(repo.remove('ghost-guild', 'yt-ch-X')).resolves.toBeUndefined();
    expect(repo.size).toBe(2); // unchanged
  });

  it('remove only deletes the exact composite key match', async () => {
    // Arrange — add a third sub that shares guildId with SUB_A but different yt channel
    const sub3 = new GuildSubscription('guild-A', 'discord-ch-A2', 'yt-ch-Z', null);
    await repo.add(sub3);
    expect(repo.size).toBe(3);

    // Act — remove only the (guild-A, yt-ch-A) pair
    await repo.remove('guild-A', 'yt-ch-A');

    // Assert — the other guild-A subscription (yt-ch-Z) survives
    expect(repo.size).toBe(2);
    const found = await repo.findByGuildAndChannel('guild-A', 'yt-ch-Z');
    expect(found).not.toBeNull();
  });

  it('findByGuildAndChannel returns null after remove for the deleted subscription', async () => {
    // Arrange
    await repo.remove('guild-B', 'yt-ch-B');

    // Act
    const result = await repo.findByGuildAndChannel('guild-B', 'yt-ch-B');

    // Assert
    expect(result).toBeNull();
  });

  // ── size getter ──────────────────────────────────────────────────────────

  it('size reflects the current number of subscriptions', async () => {
    // Arrange — repo starts with 2 items from beforeEach
    expect(repo.size).toBe(2);

    // Act
    await repo.add(new GuildSubscription('g3', 'c3', 'yt-3', null));

    // Assert
    expect(repo.size).toBe(3);
  });

  it('size is 0 when repo is initialized without data', () => {
    // Arrange
    const emptyRepo = new InMemorySubscriptionRepository();

    // Assert
    expect(emptyRepo.size).toBe(0);
  });
});
