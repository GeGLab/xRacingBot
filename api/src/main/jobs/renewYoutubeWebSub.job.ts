import { schedule } from 'node-cron';
import type { YouTubeChannel } from '../env';
import type { YoutubeWebSubService } from '../../infra/youtube/YoutubeWebSubService';

export function startYoutubeWebSubRenewalJob(
  service: YoutubeWebSubService,
  channels: YouTubeChannel[],
): void {
  if (!service.enabled) return;
  schedule(
    '0 12 */4 * *',
    () => {
      void service
        .subscribeAll(channels)
        .catch((error) => console.error('[websub] Renewal failed:', error));
    },
    { timezone: 'UTC' },
  );
  console.log('[websub] Renewal job registered every four days (UTC).');
}
