import { Plus } from "lucide-react";
import { useLanguage } from "../i18n";

export default function FAQ() {
  const { t } = useLanguage();
  return (
    <section id="faq" className="container section faq-section">
      <div>
        <p className="eyebrow">FAQ</p>
        <h2>{t.faqTitle}</h2>
      </div>
      <div className="faq-list">
        {t.questions.map((item, index) => (
          <details key={index}>
            <summary>
              {item.question}
              <Plus size={20} aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
