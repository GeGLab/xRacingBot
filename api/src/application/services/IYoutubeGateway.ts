import { Video } from '../../domain/entities/Video';

/**
 * IYoutubeGateway — Application Port (outbound)
 *
 * Abstraction over any YouTube data-source (RSS feed, Data API, etc.).
 * Accepts a YouTube channel ID so a single gateway instance can serve
 * multiple subscriptions (multi-tenant).
 */
export interface IYoutubeGateway {
  /**
   * Fetches the most recently published video for the given YouTube channel.
   * Returns null when the channel has no videos or the feed is unreachable.
   */
  getLatestVideo(youtubeChannelId: string): Promise<Video | null>;
}
