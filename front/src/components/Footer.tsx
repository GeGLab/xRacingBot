import { Github } from "lucide-react";
import { REPOSITORY_URL, YOUTUBE_CHANNELS } from "../config";
import { useLanguage } from "../use-language";
export default function Footer() {
  const { t, locale } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <a href="#main" className="brand">
            <img
              className="footer-logo"
              src="/xracing-logo-transparent.png"
              alt=""
              width={8}
              height={8}
            />
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
          <a
            className="gng-credit"
            href={
              locale === "en" ? "https://geg.dev.br/" : "https://geg.dev.br/pt/"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.credit}
          </a>
        </div>
      </div>
    </footer>
  );
}
