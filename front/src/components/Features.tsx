import { BellRing, SlidersHorizontal, Users } from "lucide-react";
import { useLanguage } from "../use-language";
const icons = [BellRing, SlidersHorizontal, Users];
export default function Features() {
  const { t } = useLanguage();
  return (
    <section id="features" className="container section">
      <p className="eyebrow">{t.featuresEyebrow}</p>
      <h2>{t.featuresTitle}</h2>
      <div className="feature-grid">
        {t.features.map((item, index) => {
          const Icon = icons[index];
          return (
            <article className="feature" key={index}>
              <Icon size={26} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
