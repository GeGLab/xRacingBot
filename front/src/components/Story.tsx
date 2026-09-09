import { ArrowUpRight, Heart, Github } from "lucide-react";
import { REPOSITORY_URL } from "../config";
import { useLanguage } from "../i18n";

export default function Story() {
  const { t } = useLanguage();
  return (
    <section id="story" className="container section story-section">
      <div className="story-heading">
        <p className="eyebrow">{t.storyEyebrow}</p>
        <h2>{t.storyTitle}</h2>
        <span className="story-badge">
          <Heart size={17} aria-hidden="true" />
          {t.independent}
        </span>
      </div>
      <div className="story-copy">
        <p className="story-lead">{t.storyLead}</p>
        <p>{t.storyBody}</p>
        <p className="story-ending">{t.storyEnd}</p>
        <a
          href={REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          <Github size={18} aria-hidden="true" />
          {t.source}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
