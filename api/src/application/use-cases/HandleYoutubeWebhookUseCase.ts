import type { Video } from '../../domain/entities/Video';
import type { INotificationService } from '../services/INotificationService';
import type { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import type { IGuildNotificationSettingsRepository } from '../../domain/repositories/IGuildNotificationSettingsRepository';

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
 *   3. Recording older entries as seen without alerting, avoiding delayed
 *      or historical notifications when the webhook is restored.
 *   4. Sending new-video notifications to each subscribed Discord channel.
 *   5. Persisting the new lastVideoId.
 *
 * Difference from NotifyNewVideoUseCase: receives a pre-parsed Video
 * object (no HTTP call needed) and filters by a single YouTube channel.
 */
export class HandleYoutubeWebhookUseCase {
  constructor(
    private readonly notifier: INotificationService,
    private readonly repository: ISubscriptionRepository,
    private readonly settings: IGuildNotificationSettingsRepository,
  ) {}

  async execute(input: HandleWebhookInput): Promise<void> {
    const { video, youtubeChannelId } = input;

    const subscriptions = await this.repository.findByYoutubeChannelId(youtubeChannelId);

    for (const subscription of subscriptions) {
      if (video.id === subscription.lastVideoId) continue;

      const isToday = this.isPublishedToday(video.publishedAt);
      if (!isToday) {
        console.log(
          `[webhook] ⏭️  Ignoring older video: "${video.title}" (${video.publishedAt.toISOString()})`,
        );
        subscription.markVideoAsSeen(video.id);
        await this.repository.update(subscription);
        continue;
      }

      console.log(`[webhook] 🆕 New video today: "${video.title}" → sending as NEW`);

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
        // The failed subscription remains eligible for the polling fallback.
        console.error(
          `[webhook] Failed to notify Discord channel ${subscription.channelId}:`,
          error,
        );
      }
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
