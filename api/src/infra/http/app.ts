import express, { Application } from 'express';
import { YoutubeWebhookController } from '../youtube/YoutubeWebhookController';

/**
 * createApp
 *
 * Pure factory function that wires up an Express application.
 * Keeping app creation separate from server.listen() makes it trivially
 * testable (pass a supertest agent instead of binding a port).
 *
 * Routes:
 *   GET  /health             — liveness probe
 *   GET  /webhook/youtube    — YouTube PubSubHubbub subscription verification
 *   POST /webhook/youtube    — YouTube new-video notification
 */
export function createApp(webhookController: YoutubeWebhookController): Application {
  const app = express();

  // YouTube sends Atom XML — accept common XML content types as raw text
  app.use(
    express.text({
      type: ['application/atom+xml', 'text/xml', 'application/xml', 'text/*'],
    }),
  );

  // Standard JSON body parser for any other endpoints
  app.use(express.json());

  // ── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── YouTube PubSubHubbub ─────────────────────────────────────────────────
  app.get('/webhook/youtube', (req, res) => {
    webhookController.handleVerification(req, res);
  });

  app.post('/webhook/youtube', (req, res) => {
    void webhookController.handleNotification(req, res);
  });

  return app;
}
