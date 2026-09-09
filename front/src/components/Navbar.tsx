import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, Play, X } from "lucide-react";
import { BOT_INVITE_URL } from "../config";
import { useLanguage } from "../i18n";

export default function Navbar() {
  const { t, locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 56);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header className={`site-header${compact ? " is-compact" : ""}`}>
      <nav className="nav" aria-label={t.nav}>
        <a
          href="#main"
          className="brand"
          aria-label={`Bora de xracing — ${t.home}`}
        >
          <span className="brand-icon">
            <Play size={20} fill="currentColor" aria-hidden="true" />
          </span>
          <span>
            Bora de{" "}
            <strong>
              xracing<span className="brand-dot">.</span>
            </strong>
          </span>
        </a>
        <div className="desktop-links">
          <a href="#how-it-works">{t.how}</a>
          <a href="#story">{t.story}</a>
          <a href="#faq">{t.faq}</a>
        </div>
        <div className="nav-actions">
          <div className="language-switch" role="group" aria-label={t.language}>
            <button
              lang="pt-BR"
              aria-label="Português do Brasil"
              aria-pressed={locale === "pt-BR"}
              onClick={() => setLocale("pt-BR")}
            >
              PT
            </button>
            <button
              lang="en"
              aria-label="English"
              aria-pressed={locale === "en"}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>
          <a
            href={BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-small nav-invite"
          >
            {t.add}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <button
            className="menu-toggle"
            aria-label={t.menu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        {open && (
          <div id="mobile-menu" className="mobile-menu">
            <a href="#how-it-works" onClick={() => setOpen(false)}>
              {t.how}
            </a>
            <a href="#story" onClick={() => setOpen(false)}>
              {t.story}
            </a>
            <a href="#faq" onClick={() => setOpen(false)}>
              {t.faq}
            </a>
            <a href={BOT_INVITE_URL} target="_blank" rel="noopener noreferrer">
              {t.add}
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
