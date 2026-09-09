import { ArrowDown, ArrowUpRight, Youtube } from "lucide-react";
import { BOT_INVITE_URL, YOUTUBE_CHANNELS } from "../config";
import { useLanguage } from "../use-language";
import DiscordPreview from "./DiscordPreview";

export default function Hero() {
  const { t } = useLanguage();
  return (
    <>
      <section className="container hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            {t.eyebrow}
          </p>
          <h1>
            {t.heroFirst}
            <br />
            <span>{t.heroSecond}</span>
          </h1>
          <p className="hero-description">{t.heroDescription}</p>
          <div className="hero-actions">
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="button"
            >
              {t.add}
              <ArrowUpRight size={20} aria-hidden="true" />
            </a>
            <a href="#how-it-works" className="text-link">
              {t.how}
              <ArrowDown size={17} aria-hidden="true" />
            </a>
          </div>
          <p className="hero-note">{t.heroNote}</p>
        </div>
        <DiscordPreview />
      </section>
      <section className="channel-strip" aria-label={t.channelsLabel}>
        <div className="container channel-inner">
          <div>
            <p className="eyebrow">{t.channelsLabel}</p>
            <p className="muted">{t.channelsNote}</p>
          </div>
          <div className="channel-links">
            {YOUTUBE_CHANNELS.map((channel) => (
              <a
                key={channel.url}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube size={23} aria-hidden="true" />
                {channel.name}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
