import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { Video } from '../../domain/entities/Video';
import type { IYoutubeGateway } from '../../application/services/IYoutubeGateway';
import type { YoutubeFeed, YoutubeEntry, YoutubeEntryLink } from './YoutubeTypes';

/**
 * YoutubeRssService — Infra adapter for IYoutubeGateway
 *
 * Polls YouTube's public Atom RSS feed to discover the latest video for a
 * given channel. This is the cron-based (pull) approach — no API key needed.
 *
 * Feed URL: https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
 *
 * Parsing strategy:
 *   - xml2js with explicitArray:false + mergeAttrs:true
 *   - Namespace prefix "yt:" is preserved in key names by xml2js
 *   - Video ID is extracted from <yt:videoId> or by splitting <id>
 */
export class YoutubeRssService implements IYoutubeGateway {
  private readonly BASE_URL = 'https://www.youtube.com/feeds/videos.xml';

  async getLatestVideo(youtubeChannelId: string): Promise<Video | null> {
    const feedUrl = `${this.BASE_URL}?channel_id=${youtubeChannelId}`;

    const { data } = await axios.get<string>(feedUrl, {
      timeout: 10_000,
      responseType: 'text',
      maxContentLength: 1_000_000,
    });

    const parsed: YoutubeFeed = await parseStringPromise(data, {
      explicitArray: false,
      mergeAttrs: true,
    });

    const entries = parsed.feed.entry;
    if (!entries) return null;

    const entriesArray: YoutubeEntry[] = Array.isArray(entries) ? entries : [entries];
    if (entriesArray.length === 0) return null;

    const latest = entriesArray[0];

    // Extract video ID: prefer the explicit <yt:videoId> element, fall back
    // to splitting the <id> string which has format "yt:video:VIDEO_ID"
    const videoId: string = latest['yt:videoId'] ?? latest.id.split(':').pop() ?? latest.id;

    // Extract watch URL: prefer link.href (after mergeAttrs), fall back to constructed URL
    const linkField = Array.isArray(latest.link) ? latest.link[0] : latest.link;
    const videoUrl: string =
      (linkField as YoutubeEntryLink)?.href ?? `https://www.youtube.com/watch?v=${videoId}`;

    return new Video(videoId, latest.title, videoUrl, new Date(latest.published));
  }
}
