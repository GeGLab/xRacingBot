import Database from 'better-sqlite3';
import path from 'path';

/**
 * db-reset.ts
 *
 * CLI utility to reset subscription data for testing purposes.
 *
 * Usage:
 *   npx tsx src/scripts/db-reset.ts              # resets last_video_id to null (re-triggers notifications)
 *   npx tsx src/scripts/db-reset.ts --clear       # deletes ALL subscriptions from the database
 *   npx tsx src/scripts/db-reset.ts path/to/db    # uses a custom database path
 */

const args = process.argv.slice(2);
const clearMode = args.includes('--clear');
const customPath = args.find((a) => a !== '--clear');
const dbPath = customPath || path.resolve(process.cwd(), 'data', 'bot.db');

console.log('──────────────────────────────────────────');
console.log('  🔄  Database Reset Tool');
console.log('──────────────────────────────────────────');
console.log(`  Path: ${dbPath}`);
console.log(`  Mode: ${clearMode ? '🗑️  CLEAR (delete all subscriptions)' : '🔄  RESET (set last_video_id = null)'}`);
console.log('');

let db: Database.Database;

try {
  db = new Database(dbPath);
} catch (error) {
  console.error(`❌  Não foi possível abrir o banco em "${dbPath}"`);
  console.error(`    Certifique-se de que o bot foi iniciado pelo menos uma vez.`);
  console.error('');
  console.error('    Erro:', (error as Error).message);
  process.exit(1);
}

const hasTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='guild_subscriptions'")
  .get();

if (!hasTable) {
  console.log('⚠️   Tabela "guild_subscriptions" não existe ainda. Nada para resetar.');
  db.close();
  process.exit(0);
}

interface CountRow {
  total: number;
}

const { total } = db
  .prepare('SELECT COUNT(*) as total FROM guild_subscriptions')
  .get() as CountRow;

if (total === 0) {
  console.log('⚠️   O banco está vazio — nenhuma inscrição encontrada.');
  db.close();
  process.exit(0);
}

if (clearMode) {
  // Delete all subscriptions
  const result = db.prepare('DELETE FROM guild_subscriptions').run();
  console.log(`🗑️   ${result.changes} inscrição(ões) removida(s) do banco.`);
  console.log('');
  console.log('    Use /subscribe no Discord para se inscrever novamente.');
} else {
  // Reset last_video_id to null so the next cron tick will re-notify
  const result = db
    .prepare('UPDATE guild_subscriptions SET last_video_id = NULL')
    .run();
  console.log(`✅  ${result.changes} inscrição(ões) resetada(s) — last_video_id definido como NULL.`);
  console.log('');
  console.log('    No próximo tick do cron (até 5 min), o bot vai notificar novamente');
  console.log('    sobre o vídeo mais recente de cada canal monitorado.');
}

console.log('');

db.close();
