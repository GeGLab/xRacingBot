import { ArrowUpRight } from "lucide-react";
import { BOT_INVITE_URL } from "../config";
import { useLanguage } from "../use-language";
export default function CTA() {
  const { t } = useLanguage();
  return (
    <section className="container cta-section">
      <div>
        <p className="eyebrow">{t.ctaEyebrow}</p>
        <h2>{t.ctaTitle}</h2>
        <p>{t.ctaDescription}</p>
      </div>
      <a
        href={BOT_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="button"
      >
        {t.add}
        <ArrowUpRight size={20} aria-hidden="true" />
      </a>
    </section>
  );
}
