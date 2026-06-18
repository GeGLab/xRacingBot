import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnsubscribeChannelUseCase } from '../../src/application/use-cases/UnsubscribeChannelUseCase';
import type { ISubscriptionRepository } from '../../src/domain/repositories/ISubscriptionRepository';
import { GuildSubscription } from '../../src/domain/entities/GuildSubscription';

describe('UnsubscribeChannelUseCase', () => {
  let repository: ISubscriptionRepository;
  let useCase: UnsubscribeChannelUseCase;

  beforeEach(() => {
    repository = {
      findAll: vi.fn(),
      findByYoutubeChannelId: vi.fn(),
      findByGuildAndChannel: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    useCase = new UnsubscribeChannelUseCase(repository);
  });

  it('removes the subscription and returns wasSubscribed: true when it exists', async () => {
    // Arrange
    const existing = new GuildSubscription('guild-1', 'ch-1', 'yt-ch-1', 'last-vid');
    vi.mocked(repository.findByGuildAndChannel).mockResolvedValue(existing);
    vi.mocked(repository.remove).mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute({
      guildId: 'guild-1',
      youtubeChannelId: 'yt-ch-1',
    });

    // Assert
    expect(result.wasSubscribed).toBe(true);
    expect(repository.findByGuildAndChannel).toHaveBeenCalledWith('guild-1', 'yt-ch-1');
    expect(repository.remove).toHaveBeenCalledWith('guild-1', 'yt-ch-1');
  });

  it('returns wasSubscribed: false and does NOT call remove when subscription does not exist', async () => {
    // Arrange
    vi.mocked(repository.findByGuildAndChannel).mockResolvedValue(null);

    // Act
    const result = await useCase.execute({
      guildId: 'guild-unknown',
      youtubeChannelId: 'yt-ch-unknown',
    });

    // Assert
    expect(result.wasSubscribed).toBe(false);
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('calls findByGuildAndChannel with the exact input values', async () => {
    // Arrange
    vi.mocked(repository.findByGuildAndChannel).mockResolvedValue(null);

    // Act
    await useCase.execute({
      guildId: '  guild-spaces  ',
      youtubeChannelId: 'UCxyz123',
    });

    // Assert — values are passed through as-is, no trimming at this layer
    expect(repository.findByGuildAndChannel).toHaveBeenCalledWith(
      '  guild-spaces  ',
      'UCxyz123',
    );
  });
});
