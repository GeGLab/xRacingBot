/**
 * INotificationService — Application Port (outbound)
 *
 * Abstraction over any notification delivery mechanism.
 * The concrete implementation (Discord, Slack, etc.) lives in infra/.
 * Use-cases depend only on this interface — never on discord.js directly.
 */
export interface SendNotificationInput {
  /** Discord text-channel snowflake ID */
  channelId: string;
  /** Video title to display in the notification */
  title: string;
  /** Full YouTube watch URL */
  url: string;
  /**
   * Notification type:
   * - `'new'` — video was published today, sends a launch notification
   * - `'reminder'` — video is not from today, sends a reminder to watch
   */
  type: 'new' | 'reminder';
}

export interface INotificationService {
  send(input: SendNotificationInput): Promise<void>;
}
