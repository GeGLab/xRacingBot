import { useRef } from "react";
import type { MouseEvent } from "react";
import {
  Hash,
  Headphones,
  Play,
  Volume2,
  Youtube,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "../use-language";
import { YOUTUBE_CHANNELS } from "../config";

export default function DiscordPreview() {
  const { t } = useLanguage();
  const scene = useRef<HTMLElement>(null);

  function tilt(event: MouseEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--rotate-x", `${-y * 9}deg`);
    event.currentTarget.style.setProperty("--rotate-y", `${x * 12}deg`);
    event.currentTarget.style.setProperty("--pointer-x", `${(x + 0.5) * 100}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${(y + 0.5) * 100}%`);
  }

  function resetTilt() {
    scene.current?.style.setProperty("--rotate-x", "0deg");
    scene.current?.style.setProperty("--rotate-y", "0deg");
  }
  return (
    <figure
      ref={scene}
      className="preview preview-3d"
      id="preview"
      aria-label={t.previewTitle}
      onMouseMove={tilt}
      onMouseLeave={resetTilt}
    >
      <span className="scene-orbit scene-orbit-one" aria-hidden="true" />
      <span className="scene-orbit scene-orbit-two" aria-hidden="true" />
      <span className="scene-glow" aria-hidden="true" />
      <div className="preview-topline">
        <span>{t.previewLabel}</span>
        <span className="preview-dots" aria-hidden="true">
          •••
        </span>
      </div>
      <div className="discord-window">
        <div className="discord-server">
          <Headphones size={18} aria-hidden="true" />
          {t.server}
          <span className="server-label">DISCORD</span>
        </div>
        <div className="discord-channel">
          <Hash size={19} aria-hidden="true" />
          {t.textChannel}
        </div>
        <div className="discord-message">
          <span className="bot-avatar">
            <img src="/xracing-logo-transparent.png" alt="" width={35} height={35} />
          </span>
          <div className="message-body">
            <div className="message-author">
              <strong>Bora de xracing</strong>
              <span className="bot-tag">APP</span>
              <span className="message-time">{t.today}</span>
            </div>
            <p lang="pt-BR">🏍 {t.notification}</p>
            <a
              className="video-preview"
              href={YOUTUBE_CHANNELS[0].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="video-platform">
                <Youtube size={18} aria-hidden="true" />
                YouTube · xracing Videos
              </span>
              <span className="video-surface">
                <Play size={36} fill="currentColor" aria-hidden="true" />
                <span>{t.videoLabel}</span>
              </span>
              <span className="video-link">
                {t.channelLink}
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
        <div className="voice-room">
          <Volume2 size={22} aria-hidden="true" />
          <div>
            <strong>{t.voiceChannel}</strong>
            <span>{t.voiceNote}</span>
          </div>
          <span className="voice-wave" aria-hidden="true">
            ▂▆▃▇▂
          </span>
        </div>
      </div>
      <figcaption>
        {t.previewNote}
        <br />
        {t.previewLanguage}
      </figcaption>
    </figure>
  );
}
