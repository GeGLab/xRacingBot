import { Request, Response } from 'express';
import { parseStringPromise } from 'xml2js';
import { Video } from '../../domain/entities/Video';
import { HandleYoutubeWebhookUseCase } from '../../application/use-cases/HandleYoutubeWebhookUseCase';
import { YoutubeFeed, YoutubeEntry, YoutubeEntryLink } from './YoutubeTypes';

/**
 * YoutubeWebhookController — HTTP controller for YouTube PubSubHubbub
 *
 * YouTube's PubSubHubbub hub calls our endpoint in two ways:
 *
 *   GET  /webhook/youtube  — subscription verification
 *     YouTube sends ?hub.challenge=TOKEN, we must echo it back.
 *
 *   POST /webhook/youtube  — new video notification
 *     YouTube POSTs an Atom XML entry. We parse it, extract the
 *     Video, and hand off to HandleYoutubeWebhookUseCase.
 *
 * This controller is intentionally thin: it converts HTTP ↔ domain
 * objects and delegates all business logic to the use-case.
 */
export class YoutubeWebhookController {
  constructor(private readonly handleWebhookUseCase: HandleYoutubeWebhookUseCase) {}

  /**
   * Handles GET verification from YouTube's hub.
   * Must respond 200 with the raw hub.challenge string.
   */
  handleVerification(req: Request, res: Response): void {
    const challenge = req.query['hub.challenge'];

    if (typeof challenge === 'string' && challenge.length > 0) {
      res.status(200).send(challenge);
    } else {
      res.status(400).send('Missing hub.challenge parameter');
    }
  }

  /**
   * Handles POST notifications from YouTube's hub.
   * Body is an Atom XML string with a single <entry>.
   */
  async handleNotification(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as string;

      if (!body || body.trim().length === 0) {
        res.status(400).send('Empty request body');
        return;
      }

      const parsed: YoutubeFeed = await parseStringPromise(body, {
        explicitArray: false,
        mergeAttrs: true,
      });

      const feed = parsed.feed;

      if (!feed.entry) {
        res.status(200).send('No entry found — ignoring');
        return;
      }

      const entry = feed.entry as YoutubeEntry;

      const youtubeChannelId: string = feed['yt:channelId'] ?? '';

      const videoId: string =
        entry['yt:videoId'] ?? entry.id?.split(':').pop() ?? '';

      const linkField = Array.isArray(entry.link) ? entry.link[0] : entry.link;
      const videoUrl: string =
        (linkField as YoutubeEntryLink)?.href ??
        `https://www.youtube.com/watch?v=${videoId}`;

      const video = new Video(
        videoId,
        entry.title,
        videoUrl,
        new Date(entry.published),
      );

      await this.handleWebhookUseCase.execute({ video, youtubeChannelId });

      res.status(200).send('OK');
    } catch (error) {
      console.error('[YoutubeWebhookController] Error handling notification:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}
