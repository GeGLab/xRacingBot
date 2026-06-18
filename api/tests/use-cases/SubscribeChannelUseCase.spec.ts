import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubscribeChannelUseCase } from '../../src/application/use-cases/SubscribeChannelUseCase';
import type { ISubscriptionRepository } from '../../src/domain/repositories/ISubscriptionRepository';
import { GuildSubscription } from '../../src/domain/entities/GuildSubscription';

describe('SubscribeChannelUseCase', () => {
  let repository: ISubscriptionRepository;
  let useCase: SubscribeChannelUseCase;

  const INPUT = {
    guildId: 'guild-123',
    channelId: 'channel-456',
    youtubeChannelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
  };

  beforeEach(() => {
    repository = {
      findAll: vi.fn(),
      findByYoutubeChannelId: vi.fn(),
      findByGuildAndChannel: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    useCase = new SubscribeChannelUseCase(repository);
  });

  it('creates a new subscription and returns alreadyExists=false', async () => {
    // Arrange — no existing subscription
    vi.mocked(repository.findByGuildAndChannel).mockResolvedValue(null);
    vi.mocked(repository.add).mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(INPUT);

    // Assert
    expect(result.alreadyExists).toBe(false);
    expect(repository.findByGuildAndChannel).toHaveBeenCalledWith(
      'guild-123',
      'UCuAXFkgsw1L7xaCfnd5JJOw',
    );
    expect(repository.add).toHaveBeenCalledOnce();
    expect(repository.add).toHaveBeenCalledWith(
      expect.objectContaining({
        guildId: 'guild-123',
        channelId: 'channel-456',
        youtubeChannelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
        lastVideoId: null,
      }),
    );
  });

  it('returns alreadyExists=true and does NOT call add when subscription exists', async () => {
    // Arrange — subscription already present
    const existing = new GuildSubscription(
      'guild-123',
      'channel-456',
      'UCuAXFkgsw1L7xaCfnd5JJOw',
      'prev-video-id',
    );
    vi.mocked(repository.findByGuildAndChannel).mockResolvedValue(existing);

    // Act
    const result = await useCase.execute(INPUT);

    // Assert
    expect(result.alreadyExists).toBe(true);
    expect(repository.add).not.toHaveBeenCalled();
  });

  it('persists a GuildSubscription with lastVideoId=null on first subscribe', async () => {
    // Arrange
    vi.mocked(repository.findByGuildAndChannel).mockResolvedValue(null);
    vi.mocked(repository.add).mockResolvedValue(undefined);

    // Act
    await useCase.execute(INPUT);

    // Assert — the subscription passed to add() must have null lastVideoId
    const addedSub = vi.mocked(repository.add).mock.calls[0][0];
    expect(addedSub).toBeInstanceOf(GuildSubscription);
    expect(addedSub.lastVideoId).toBeNull();
    expect(addedSub.guildId).toBe('guild-123');
    expect(addedSub.channelId).toBe('channel-456');
    expect(addedSub.youtubeChannelId).toBe('UCuAXFkgsw1L7xaCfnd5JJOw');
  });

  it('propagates repository errors to the caller', async () => {
    // Arrange
    vi.mocked(repository.findByGuildAndChannel).mockRejectedValue(
      new Error('DB connection lost'),
    );

    // Act & Assert
    await expect(useCase.execute(INPUT)).rejects.toThrow('DB connection lost');
    expect(repository.add).not.toHaveBeenCalled();
  });
});
