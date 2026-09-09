import type { INotificationService } from '../services/INotificationService';

export class SendTestNotificationUseCase {
  constructor(private readonly notifier: INotificationService) {}

  async execute(channelId: string): Promise<void> {
    await this.notifier.send({
      channelId,
      title: 'Teste de notificação',
      url: 'https://www.youtube.com/@XracingVideos',
      type: 'test',
      mentionEveryone: false,
    });
  }
}
