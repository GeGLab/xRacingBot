import { type Interaction, PermissionFlagsBits } from 'discord.js';
import type { SubscribeChannelUseCase } from '../../../application/use-cases/SubscribeChannelUseCase';
import type { UnsubscribeChannelUseCase } from '../../../application/use-cases/UnsubscribeChannelUseCase';
import type { SendTestNotificationUseCase } from '../../../application/use-cases/SendTestNotificationUseCase';
import type { GetGuildStatusUseCase } from '../../../application/use-cases/GetGuildStatusUseCase';
import type { UpdateGuildNotificationSettingsUseCase } from '../../../application/use-cases/UpdateGuildNotificationSettingsUseCase';
import type { YouTubeChannel } from '../../../main/env';

/** Special value used by the "Todos" choice in slash commands. */
export const ALL_CHANNELS_VALUE = 'all';

/**
 * Creates the interactionCreate event handler.
 *
 * @param subscribe       - The wired SubscribeChannelUseCase instance
 * @param unsubscribe     - The wired UnsubscribeChannelUseCase instance
 * @param youtubeChannels - The list of YouTube channels configured in env
 */
export function createInteractionHandler(
  subscribe: SubscribeChannelUseCase,
  unsubscribe: UnsubscribeChannelUseCase,
  sendTest: SendTestNotificationUseCase,
  getStatus: GetGuildStatusUseCase,
  updateSettings: UpdateGuildNotificationSettingsUseCase,
  youtubeChannels: YouTubeChannel[],
): (interaction: Interaction) => Promise<void> {
  return async (interaction: Interaction): Promise<void> => {
    if (!interaction.isChatInputCommand()) return;

    // Slash commands must be used inside a guild
    if (!interaction.guildId) {
      await interaction.reply({
        content: '❌ Este comando só pode ser usado dentro de um servidor.',
        ephemeral: true,
      });
      return;
    }

    // Only users with "Manage Server" can subscribe / unsubscribe
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({
        content: '❌ Você precisa da permissão **Gerenciar Servidor** para usar este comando.',
        ephemeral: true,
      });
      return;
    }

    try {
      switch (interaction.commandName) {
        case 'subscribe': {
          const selectedValue = interaction.options.getString('canal', true);
          const isAll = selectedValue === ALL_CHANNELS_VALUE;

          const channelsToSubscribe = isAll
            ? youtubeChannels
            : youtubeChannels.filter((ch) => ch.id === selectedValue);

          // Fallback if the ID wasn't found in the configured list
          if (channelsToSubscribe.length === 0) {
            channelsToSubscribe.push({ name: selectedValue, id: selectedValue });
          }

          const subscribed: string[] = [];
          const alreadyExisted: string[] = [];

          for (const channel of channelsToSubscribe) {
            const result = await subscribe.execute({
              guildId: interaction.guildId,
              channelId: interaction.channelId,
              youtubeChannelId: channel.id,
            });

            if (result.alreadyExists) {
              alreadyExisted.push(channel.name);
            } else {
              subscribed.push(channel.name);
            }
          }

          // Build response message
          const lines: string[] = [];

          if (subscribed.length > 0) {
            lines.push(
              `✅ **Inscrito!** Este canal agora receberá notificações de: **${subscribed.join(', ')}**`,
            );
          }

          if (alreadyExisted.length > 0) {
            lines.push(`⚠️ Já inscrito anteriormente em: **${alreadyExisted.join(', ')}**`);
          }

          await interaction.reply({
            content: lines.join('\n\n'),
            ephemeral: alreadyExisted.length > 0 && subscribed.length === 0,
          });
          break;
        }

        case 'unsubscribe': {
          const selectedValue = interaction.options.getString('canal', true);
          const isAll = selectedValue === ALL_CHANNELS_VALUE;

          const channelsToUnsubscribe = isAll
            ? youtubeChannels
            : youtubeChannels.filter((ch) => ch.id === selectedValue);

          if (channelsToUnsubscribe.length === 0) {
            channelsToUnsubscribe.push({ name: selectedValue, id: selectedValue });
          }

          const removed: string[] = [];
          const notFound: string[] = [];

          for (const channel of channelsToUnsubscribe) {
            const result = await unsubscribe.execute({
              guildId: interaction.guildId,
              youtubeChannelId: channel.id,
            });

            if (result.wasSubscribed) {
              removed.push(channel.name);
            } else {
              notFound.push(channel.name);
            }
          }

          // Build response message
          const lines: string[] = [];

          if (removed.length > 0) {
            lines.push(
              `✅ **Inscrição removida.** Este servidor não receberá mais notificações de: **${removed.join(', ')}**`,
            );
          }

          if (notFound.length > 0) {
            lines.push(`⚠️ Nenhuma inscrição encontrada para: **${notFound.join(', ')}**`);
          }

          await interaction.reply({
            content: lines.join('\n\n'),
            ephemeral: notFound.length > 0 && removed.length === 0,
          });
          break;
        }

        case 'status': {
          const result = await getStatus.execute(interaction.guildId);
          const subscribed = result.subscriptions.length === 0
            ? 'Nenhum canal monitorado ainda.'
            : result.subscriptions
                .map((subscription) => {
                  const channel = youtubeChannels.find((item) => item.id === subscription.youtubeChannelId);
                  return `• **${channel?.name ?? subscription.youtubeChannelId}** → <#${subscription.channelId}>`;
                })
                .join('\n');
          await interaction.reply({
            content: `📋 **Status do Bora de xracing**\n\n${subscribed}\n\nPing @everyone: **${result.preferences.mentionEveryone ? 'ativado' : 'desativado'}**`,
            ephemeral: true,
          });
          break;
        }

        case 'test': {
          await sendTest.execute(interaction.channelId);
          await interaction.reply({ content: '✅ Teste enviado neste canal, sem mencionar ninguém.', ephemeral: true });
          break;
        }

        case 'configurar-ping': {
          const mode = interaction.options.getString('modo', true);
          const mentionEveryone = mode === 'everyone';
          await updateSettings.execute(interaction.guildId, mentionEveryone);
          await interaction.reply({
            content: mentionEveryone
              ? '✅ Avisos poderão mencionar @everyone quando o bot tiver essa permissão no canal.'
              : '✅ Avisos configurados sem menção.',
            ephemeral: true,
          });
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.error(`[interaction] Error handling /${interaction.commandName}:`, error);

      const content = '❌ Ocorreu um erro ao processar o comando. Tente novamente mais tarde.';

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content, ephemeral: true });
      } else {
        await interaction.reply({ content, ephemeral: true });
      }
    }
  };
}
