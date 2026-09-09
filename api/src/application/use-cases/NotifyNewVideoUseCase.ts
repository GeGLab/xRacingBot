import type { IYoutubeGateway } from '../services/IYoutubeGateway';
import type { INotificationService } from '../services/INotificationService';
import type { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import type { Video } from '../../domain/entities/Video';
import type { IGuildNotificationSettingsRepository } from '../../domain/repositories/IGuildNotificationSettingsRepository';

/**
 * NotifyNewVideoUseCase
 *
 * Core application use-case — the heart of the system.
 *
 * Algorithm (per subscription):
 *   1. Fetch the latest video from YouTube for the subscribed channel.
 *   2. Compare its ID with the last known video ID.
 *   3. Check if the video was published today (UTC comparison).
 *      Older entries are recorded as seen without an alert, so a newly added
 *      subscription does not turn the latest historical upload into a ping.
 *   4. Send a new-video notification to the Discord channel.
 *   5. Persist the new lastVideoId so the next run won't re-notify.
 *
 * This use-case is invoked by both the cron job (RSS polling) and
 * can be triggered on-demand. It has zero knowledge of Discord.js,
 * axios, or any infra dependency — all injected via interfaces.
 */
export class NotifyNewVideoUseCase {
  constructor(
    private readonly youtube: IYoutubeGateway,
    private readonly notifier: INotificationService,
    private readonly repository: ISubscriptionRepository,
    private readonly settings: IGuildNotificationSettingsRepository,
  ) {}

  async execute(): Promise<void> {
    const subscriptions = await this.repository.findAll();
    const latestVideos = new Map<string, Video | null>();

    for (const subscription of subscriptions) {
      let video = latestVideos.get(subscription.youtubeChannelId);
      if (video === undefined) {
        video = await this.youtube.getLatestVideo(subscription.youtubeChannelId);
        latestVideos.set(subscription.youtubeChannelId, video);
      }

      if (!video) continue;
      if (video.id === subscription.lastVideoId) continue;

      const isToday = this.isPublishedToday(video.publishedAt);
      if (!isToday) {
        console.log(
          `[notify] ⏭️  Ignoring older video: "${video.title}" (${video.publishedAt.toISOString()})`,
        );
        subscription.markVideoAsSeen(video.id);
        await this.repository.update(subscription);
        continue;
      }

      console.log(`[notify] 🆕 New video today: "${video.title}" → sending as NEW`);

      try {
        await this.notifier.send({
          channelId: subscription.channelId,
          title: video.title,
          url: video.url,
          type: 'new',
          mentionEveryone: (await this.settings.findByGuildId(subscription.guildId)).mentionEveryone,
        });

        subscription.markVideoAsSeen(video.id);
        await this.repository.update(subscription);
      } catch (error) {
        // Keep this subscription unmodified so the next polling cycle retries it,
        // while a broken Discord channel never blocks other servers.
        console.error(
          `[notify] Failed to notify Discord channel ${subscription.channelId}:`,
          error,
        );
      }
    }
  }

  private isPublishedToday(publishedAt: Date): boolean {
    const now = new Date();
    return (
      publishedAt.getUTCFullYear() === now.getUTCFullYear() &&
      publishedAt.getUTCMonth() === now.getUTCMonth() &&
      publishedAt.getUTCDate() === now.getUTCDate()
    );
  }
}
