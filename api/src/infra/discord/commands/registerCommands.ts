import type { Client } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import type { YouTubeChannel } from '../../../main/env';

/**
 * Slash command definitions for the bot.
 *
 * /subscribe  — registers the current channel for YouTube notifications
 * /unsubscribe — removes the current server's subscription
 */

/**
 * Registers all slash commands globally via the Discord API.
 * Must be called after the client fires the "ready" event.
 */
export async function registerSlashCommands(
  client: Client,
  youtubeChannels: YouTubeChannel[],
): Promise<void> {
  if (!client.application) {
    throw new Error(
      'registerSlashCommands: client.application is null — call this after the "ready" event.',
    );
  }

  const channelChoices = [
    { name: '📺 Todos', value: 'all' },
    ...youtubeChannels.map((ch) => ({
      name: ch.name,
      value: ch.id,
    })),
  ];

  const commands = [
    new SlashCommandBuilder()
      .setName('subscribe')
      .setDescription('Inscrever este canal para receber notificações de novos vídeos do YouTube')
      .addStringOption((option) =>
        option
          .setName('canal')
          .setDescription('Canal do YouTube para monitorar')
          .setRequired(true)
          .addChoices(...channelChoices),
      ),
    new SlashCommandBuilder()
      .setName('unsubscribe')
      .setDescription('Cancelar a inscrição deste servidor nas notificações de vídeos do YouTube')
      .addStringOption((option) =>
        option
          .setName('canal')
          .setDescription('Canal do YouTube para parar de monitorar')
          .setRequired(true)
          .addChoices(...channelChoices),
      ),
  ];

  await client.application.commands.set(commands);
  console.log(`[discord] ✅  Registered ${commands.length} slash commands globally`);
}
