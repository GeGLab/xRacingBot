/**
 * GuildSubscription — Domain Entity
 *
 * Tracks which Discord channel (inside a Guild) should receive notifications
 * when a specific YouTube channel publishes a new video.
 *
 * lastVideoId is the only mutable field — it is updated each time a
 * notification is successfully sent, so duplicates are avoided.
 */
export class GuildSubscription {
  public lastVideoId: string | null;

  constructor(
    /** Discord Guild (server) snowflake ID */
    public readonly guildId: string,
    /** Discord text-channel snowflake ID where notifications are posted */
    public readonly channelId: string,
    /** YouTube channel ID being monitored (e.g. "UCuAXFkgsw1L7xaCfnd5JJOw") */
    public readonly youtubeChannelId: string,
    lastVideoId: string | null = null,
  ) {
    this.lastVideoId = lastVideoId;
  }

  /**
   * Records that a video has been seen, preventing duplicate notifications.
   */
  markVideoAsSeen(videoId: string): void {
    this.lastVideoId = videoId;
  }
}
