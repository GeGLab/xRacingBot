import type { Client, TextChannel } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';
import type {
  INotificationService,
  SendNotificationInput,
} from '../../application/services/INotificationService';

/**
 * DiscordNotifier — Infra adapter for INotificationService
 *
 * Sends a plain-text message containing the YouTube URL so that Discord's
 * built-in auto-embed renders the full rich video preview (thumbnail,
 * description, video player) — exactly like pasting a link manually.
 *
 * If the bot has permission to mention @everyone in the target channel,
 * the message will ping all members. Otherwise, it sends the message
 * cleanly without the mention.
 */
export class DiscordNotifier implements INotificationService {
  constructor(private readonly client: Client) {}

  async send(input: SendNotificationInput): Promise<void> {
    const { channelId, type, url, mentionEveryone = false } = input;

    const channel = await this.client.channels.fetch(channelId);

    if (!channel || !channel.isTextBased()) {
      throw new Error(
        `DiscordNotifier: channel "${channelId}" was not found or is not a text channel.`,
      );
    }

    const textChannel = channel as TextChannel;

    const canMentionEveryone =
      textChannel.guild?.members.me
        ?.permissionsIn(textChannel)
        .has(PermissionFlagsBits.MentionEveryone) ?? false;

    const mention = mentionEveryone && canMentionEveryone ? ' @everyone' : '';
    const message = this.buildMessage(type, mention, url);

    await textChannel.send(message);
  }

  private buildMessage(type: SendNotificationInput['type'], mention: string, url: string): string {
    if (type === 'test') {
      return `✅ Teste concluído: o Bora de xracing consegue enviar mensagens neste canal.\n${url}`;
    }
    if (type === 'reminder') {
      return `📺 Não esqueça de assistir o último lançamento do xracing!${mention}\n${url}`;
    }

    return `🏍 Novo vídeo do xracing já está no ar!${mention}\n${url}`;
  }
}
