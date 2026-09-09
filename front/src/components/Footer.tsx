import { Github, Play } from "lucide-react";
import { REPOSITORY_URL, YOUTUBE_CHANNELS } from "../config";
import { useLanguage } from "../i18n";
export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <a href="#main" className="brand">
            <Play size={20} aria-hidden="true" />
            <span>
              Bora de <strong>xracing.</strong>
            </span>
          </a>
          <nav aria-label={t.footerNav}>
            <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
              <Github size={17} aria-hidden="true" />
              GitHub
            </a>
            {YOUTUBE_CHANNELS.map((channel) => (
              <a
                href={channel.url}
                key={channel.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {channel.name}
              </a>
            ))}
          </nav>
        </div>
        <p>{t.disclaimer}</p>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Bora de xracing</span>
          <span>{t.footer}</span>
        </div>
      </div>
    </footer>
  );
}
