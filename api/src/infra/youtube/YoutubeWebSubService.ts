import axios from 'axios';
import type { YouTubeChannel } from '../../main/env';

const HUB_URL = 'https://pubsubhubbub.appspot.com/subscribe';
const LEASE_SECONDS = 432_000;

export class YoutubeWebSubService {
  constructor(
    private readonly callbackUrl: string,
    private readonly secret: string,
  ) {}

  get enabled(): boolean {
    return this.callbackUrl.length > 0;
  }

  async subscribeAll(channels: YouTubeChannel[]): Promise<void> {
    if (!this.enabled) {
      console.warn('[websub] YOUTUBE_CALLBACK_URL is empty — polling fallback only.');
      return;
    }

    await Promise.all(channels.map((channel) => this.subscribe(channel)));
  }

  private async subscribe(channel: YouTubeChannel): Promise<void> {
    const form = new URLSearchParams({
      'hub.callback': this.callbackUrl,
      'hub.mode': 'subscribe',
      'hub.topic': `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`,
      'hub.verify': 'async',
      'hub.lease_seconds': String(LEASE_SECONDS),
    });
    if (this.secret) form.set('hub.secret', this.secret);

    await axios.post(HUB_URL, form.toString(), {
      timeout: 10_000,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    console.log(`[websub] Subscribe request sent for ${channel.name}.`);
  }
}
