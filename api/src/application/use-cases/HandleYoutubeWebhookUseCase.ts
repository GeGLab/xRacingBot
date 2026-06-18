import { Video } from '../../domain/entities/Video';
import { INotificationService } from '../services/INotificationService';
import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';

/**
 * HandleWebhookInput — input DTO for the webhook use-case.
 */
export interface HandleWebhookInput {
  /** The video extracted from the YouTube PubSubHubbub POST body. */
  video: Video;
  /** The YouTube channel that published the video. */
  youtubeChannelId: string;
}

/**
 * HandleYoutubeWebhookUseCase
 *
 * Handles real-time push notifications from YouTube's PubSubHubbub hub.
 * When YouTube POSTs a new video notification to our webhook endpoint,
 * this use-case is responsible for:
 *
 *   1. Finding all Discord subscriptions for that YouTube channel.
 *   2. Skipping already-seen videos (idempotency guard).
 *   3. Checking whether the video was published today (UTC) to classify
 *      it as `'new'` or `'reminder'`.
 *   4. Sending the notification to each subscribed Discord channel with
 *      the appropriate type so the notification service can format it
 *      differently for brand-new vs. older videos.
 *   5. Persisting the new lastVideoId.
 *
 * Difference from NotifyNewVideoUseCase: receives a pre-parsed Video
 * object (no HTTP call needed) and filters by a single YouTube channel.
 */
export class HandleYoutubeWebhookUseCase {
  constructor(
    private readonly notifier: INotificationService,
    private readonly repository: ISubscriptionRepository,
  ) {}

  async execute(input: HandleWebhookInput): Promise<void> {
    const { video, youtubeChannelId } = input;

    const subscriptions = await this.repository.findByYoutubeChannelId(youtubeChannelId);

    for (const subscription of subscriptions) {
      if (video.id === subscription.lastVideoId) continue;

      const isToday = this.isPublishedToday(video.publishedAt);
      const type = isToday ? 'new' : 'reminder';

      if (isToday) {
        console.log(`[webhook] 🆕 New video today: "${video.title}" → sending as NEW`);
      } else {
        console.log(
          `[webhook] 📺 Older video detected: "${video.title}" (published ${video.publishedAt.toISOString()}) → sending as REMINDER`,
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

  /**
   * Compares the publish date of a video with today's date in UTC.
   * Returns `true` when year, month and day match — meaning the video
   * was published today.
   */
  private isPublishedToday(publishedAt: Date): boolean {
    const now = new Date();
    return (
      publishedAt.getUTCFullYear() === now.getUTCFullYear() &&
      publishedAt.getUTCMonth() === now.getUTCMonth() &&
      publishedAt.getUTCDate() === now.getUTCDate()
    );
  }
}
