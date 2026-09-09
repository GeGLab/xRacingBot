/** Preferences shared by all xracing notifications in one Discord server. */
export class GuildNotificationSettings {
  constructor(
    public readonly guildId: string,
    public readonly mentionEveryone: boolean = false,
  ) {}
}
