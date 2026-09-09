import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotifyNewVideoUseCase } from '../../src/application/use-cases/NotifyNewVideoUseCase';
import type { IYoutubeGateway } from '../../src/application/services/IYoutubeGateway';
import type { INotificationService } from '../../src/application/services/INotificationService';
import type { ISubscriptionRepository } from '../../src/domain/repositories/ISubscriptionRepository';
import { Video } from '../../src/domain/entities/Video';
import { GuildSubscription } from '../../src/domain/entities/GuildSubscription';
import { GuildNotificationSettings } from '../../src/domain/entities/GuildNotificationSettings';
import type { IGuildNotificationSettingsRepository } from '../../src/domain/repositories/IGuildNotificationSettingsRepository';

describe('NotifyNewVideoUseCase', () => {
  let youtube: IYoutubeGateway;
  let notifier: INotificationService;
  let repository: ISubscriptionRepository;
  let useCase: NotifyNewVideoUseCase;
  let settings: IGuildNotificationSettingsRepository;

  const MOCK_VIDEO = new Video(
    'dQw4w9WgXcQ',
    'Never Gonna Give You Up',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    new Date(),
  );

  const MOCK_SUBSCRIPTION = new GuildSubscription(
    'guild-111',
    'channel-222',
    'UCuAXFkgsw1L7xaCfnd5JJOw',
    null, // no video seen yet
  );

  beforeEach(() => {
    youtube = { getLatestVideo: vi.fn() };
    notifier = { send: vi.fn() };
    repository = {
      findAll: vi.fn(),
      findByYoutubeChannelId: vi.fn(),
      findByGuildAndChannel: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    settings = { findByGuildId: vi.fn(), save: vi.fn() };
    vi.mocked(settings.findByGuildId).mockResolvedValue(new GuildNotificationSettings('guild-111'));
    useCase = new NotifyNewVideoUseCase(youtube, notifier, repository, settings);
  });

  it('notifies and updates lastVideoId when a brand-new video is found', async () => {
    // Arrange
    vi.mocked(repository.findAll).mockResolvedValue([MOCK_SUBSCRIPTION]);
    vi.mocked(youtube.getLatestVideo).mockResolvedValue(MOCK_VIDEO);
    vi.mocked(notifier.send).mockResolvedValue(undefined);
    vi.mocked(repository.update).mockResolvedValue(undefined);

    // Act
    await useCase.execute();

    // Assert
    expect(youtube.getLatestVideo).toHaveBeenCalledWith('UCuAXFkgsw1L7xaCfnd5JJOw');
    expect(notifier.send).toHaveBeenCalledOnce();
    expect(notifier.send).toHaveBeenCalledWith({
      channelId: 'channel-222',
      title: 'Never Gonna Give You Up',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'new',
      mentionEveryone: false,
    });
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ lastVideoId: 'dQw4w9WgXcQ' }),
    );
  });

  it('does NOT notify when the video ID matches lastVideoId (already seen)', async () => {
    // Arrange — subscription already knows about this video
    const alreadySeenSub = new GuildSubscription(
      'guild-111',
      'channel-222',
      'UCuAXFkgsw1L7xaCfnd5JJOw',
      'dQw4w9WgXcQ', // already seen
    );
    vi.mocked(repository.findAll).mockResolvedValue([alreadySeenSub]);
    vi.mocked(youtube.getLatestVideo).mockResolvedValue(MOCK_VIDEO);

    // Act
    await useCase.execute();

    // Assert
    expect(notifier.send).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does NOT notify when YouTube returns null (no videos or unreachable)', async () => {
    // Arrange
    vi.mocked(repository.findAll).mockResolvedValue([MOCK_SUBSCRIPTION]);
    vi.mocked(youtube.getLatestVideo).mockResolvedValue(null);

    // Act
    await useCase.execute();

    // Assert
    expect(notifier.send).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('processes multiple subscriptions independently', async () => {
    // Arrange
    const sub1 = new GuildSubscription('g1', 'c1', 'yt-ch-1', null);
    const sub2 = new GuildSubscription('g2', 'c2', 'yt-ch-2', null);
    const video1 = new Video(
      'vid-aaa',
      'Video AAA',
      'https://youtube.com/watch?v=vid-aaa',
      new Date(),
    );
    const video2 = new Video(
      'vid-bbb',
      'Video BBB',
      'https://youtube.com/watch?v=vid-bbb',
      new Date(),
    );

    vi.mocked(repository.findAll).mockResolvedValue([sub1, sub2]);
    vi.mocked(youtube.getLatestVideo).mockResolvedValueOnce(video1).mockResolvedValueOnce(video2);
    vi.mocked(notifier.send).mockResolvedValue(undefined);
    vi.mocked(repository.update).mockResolvedValue(undefined);

    // Act
    await useCase.execute();

    // Assert
    expect(youtube.getLatestVideo).toHaveBeenCalledTimes(2);
    expect(notifier.send).toHaveBeenCalledTimes(2);
    expect(repository.update).toHaveBeenCalledTimes(2);
    expect(notifier.send).toHaveBeenNthCalledWith(1, expect.objectContaining({ channelId: 'c1' }));
    expect(notifier.send).toHaveBeenNthCalledWith(2, expect.objectContaining({ channelId: 'c2' }));
  });

  it('fetches a channel once when several Discord servers follow it', async () => {
    const sub1 = new GuildSubscription('g1', 'c1', 'yt-shared', null);
    const sub2 = new GuildSubscription('g2', 'c2', 'yt-shared', null);
    const video = new Video(
      'vid-shared',
      'Shared video',
      'https://youtube.com/watch?v=vid-shared',
      new Date(),
    );

    vi.mocked(repository.findAll).mockResolvedValue([sub1, sub2]);
    vi.mocked(youtube.getLatestVideo).mockResolvedValue(video);
    vi.mocked(notifier.send).mockResolvedValue(undefined);
    vi.mocked(repository.update).mockResolvedValue(undefined);

    await useCase.execute();

    expect(youtube.getLatestVideo).toHaveBeenCalledOnce();
    expect(notifier.send).toHaveBeenCalledTimes(2);
  });

  it('marks an older upload as seen without sending a reminder', async () => {
    const oldVideo = new Video(
      'old-video',
      'Older video',
      'https://youtube.com/watch?v=old-video',
      new Date('2024-01-15T12:00:00Z'),
    );
    vi.mocked(repository.findAll).mockResolvedValue([MOCK_SUBSCRIPTION]);
    vi.mocked(youtube.getLatestVideo).mockResolvedValue(oldVideo);
    vi.mocked(repository.update).mockResolvedValue(undefined);

    await useCase.execute();

    expect(notifier.send).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ lastVideoId: 'old-video' }),
    );
  });

  it('retries a failed channel later while continuing with other subscriptions', async () => {
    // Arrange
    const sub1 = new GuildSubscription('g1', 'c1', 'yt-ch-1', null);
    const sub2 = new GuildSubscription('g2', 'c2', 'yt-ch-2', null);
    const video = new Video('vid-xyz', 'Title', 'https://youtube.com/watch?v=vid-xyz', new Date());

    vi.mocked(repository.findAll).mockResolvedValue([sub1, sub2]);
    vi.mocked(youtube.getLatestVideo).mockResolvedValue(video);
    vi.mocked(notifier.send)
      .mockRejectedValueOnce(new Error('Discord channel not found'))
      .mockResolvedValueOnce(undefined);
    vi.mocked(repository.update).mockResolvedValue(undefined);

    // Act
    await expect(useCase.execute()).resolves.toBeUndefined();

    // The second server still gets its notification; only its successful send is persisted.
    expect(notifier.send).toHaveBeenCalledTimes(2);
    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ guildId: 'g2', lastVideoId: 'vid-xyz' }),
    );
  });

  it('resolves without error when there are no subscriptions', async () => {
    // Arrange
    vi.mocked(repository.findAll).mockResolvedValue([]);

    // Act & Assert — no crash, no notifications
    await expect(useCase.execute()).resolves.toBeUndefined();
    expect(notifier.send).not.toHaveBeenCalled();
  });
});
