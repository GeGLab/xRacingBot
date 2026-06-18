import { IYoutubeGateway } from '../services/IYoutubeGateway';
import { INotificationService } from '../services/INotificationService';
import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';

/**
 * NotifyNewVideoUseCase
 *
 * Core application use-case — the heart of the system.
 *
 * Algorithm (per subscription):
 *   1. Fetch the latest video from YouTube for the subscribed channel.
 *   2. Compare its ID with the last known video ID.
 *   3. Check if the video was published today (UTC comparison).
 *      - If published today → type 'new' (brand-new upload).
 *      - If published on an earlier date → type 'reminder' (older video detected).
 *   4. Send notification to the Discord channel with the appropriate type.
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
  ) {}

  async execute(): Promise<void> {
    const subscriptions = await this.repository.findAll();

    for (const subscription of subscriptions) {
      const video = await this.youtube.getLatestVideo(subscription.youtubeChannelId);

      if (!video) continue;
      if (video.id === subscription.lastVideoId) continue;

      const isToday = this.isPublishedToday(video.publishedAt);
      const type = isToday ? 'new' : 'reminder';

      if (isToday) {
        console.log(`[notify] 🆕 New video today: "${video.title}" → sending as NEW`);
      } else {
        console.log(
          `[notify] 📺 Older video detected: "${video.title}" (published ${video.publishedAt.toISOString()}) → sending as REMINDER`,
        );
      }

      await this.notifier.send({
        channelId: subscription.channelId,
        title: video.title,
        url: video.url,
        type,
      });

      subscription.markVideoAsSeen(video.id);
      await this.repository.update(subscription);
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
