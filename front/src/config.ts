/**
 * =============================================
 * XRacing Notifier — Configuração Central
 * =============================================
 *
 * O Client ID do bot Discord é lido da variável de ambiente VITE_DISCORD_CLIENT_ID.
 *
 * Para configurar:
 * 1. Copie o arquivo .env.example para .env
 * 2. Acesse https://discord.com/developers/applications
 * 3. Selecione a sua aplicação (bot)
 * 4. Na aba "General Information", copie o "APPLICATION ID"
 * 5. Cole no .env como valor de VITE_DISCORD_CLIENT_ID
 */

const DISCORD_CLIENT_ID =
  import.meta.env.VITE_DISCORD_CLIENT_ID ?? "1293240938574909440";

/**
 * Permissões do bot (bitfield):
 * - 2048   = Send Messages
 * - 16384  = Embed Links
 * - 32768  = Attach Files
 * - 262144 = Mention Everyone
 *
 * Total: 2048 + 16384 + 32768 + 262144 = 313344
 *
 * Ajuste conforme as permissões que o seu bot realmente precisa.
 */
const BOT_PERMISSIONS = "313344";

/**
 * URL de convite OAuth2 do bot Discord.
 * Quando o usuário clica em "Adicionar ao Discord", é redirecionado para esta URL
 * onde o Discord mostra a tela de autorização para escolher o servidor.
 */
export const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=${BOT_PERMISSIONS}&scope=bot%20applications.commands`;

/**
 * URL base do site (usada para canonical, OG tags, etc.)
 * Atualize para o domínio real em produção.
 */
export const SITE_URL =
  import.meta.env.VITE_SITE_URL ?? "https://xracingnotifier.com";

/**
 * Nome do canal do YouTube monitorado.
 */
export const CHANNEL_NAME = "XRACING";
