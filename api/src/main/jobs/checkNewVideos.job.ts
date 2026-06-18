import { schedule } from 'node-cron';
import type { NotifyNewVideoUseCase } from '../../application/use-cases/NotifyNewVideoUseCase';

/**
 * startCheckNewVideosJob
 *
 * Registers a node-cron task that runs every 5 minutes and invokes
 * NotifyNewVideoUseCase for every active subscription.
 *
 * This is the RSS-polling fallback. It complements the real-time
 * YouTube PubSubHubbub webhook — if the webhook misses a notification
 * (e.g. the server was temporarily down), the cron job will catch it
 * on the next tick.
 *
 * Error handling: exceptions inside the task are caught and logged so
 * that a single failing run never kills the entire process. The next
 * scheduled tick will retry automatically.
 *
 * @param useCase - The fully-wired NotifyNewVideoUseCase instance from the DI container.
 */
export function startCheckNewVideosJob(useCase: NotifyNewVideoUseCase): void {
  // 1 = Segunda-feira, 4 = Quinta-feira, 5 = Sexta-feira
  const CRON_EXPRESSION = '0,30 18-22 * * 1,4,5';
  // const CRON_EXPRESSION = '*/1 * * * *';

  schedule(CRON_EXPRESSION, async () => {
    console.log(`[checkNewVideos] ⏰  Tick — ${new Date().toISOString()}`);

    try {
      await useCase.execute();
      console.log('[checkNewVideos] ✅  Run completed successfully.');
    } catch (error) {
      console.error('[checkNewVideos] ❌  Run failed:', error);
    }
  });

  console.log(
    `[checkNewVideos] 🚀  Cron job registered — running every 5 minutes (${CRON_EXPRESSION})`,
  );
}
