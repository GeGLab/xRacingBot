import { Terminal } from "lucide-react";
import { useLanguage } from "../use-language";
export default function HowItWorks() {
  const { t } = useLanguage();
  return (
    <section id="how-it-works" className="section setup-section">
      <div className="container">
        <p className="eyebrow">{t.stepsEyebrow}</p>
        <h2>{t.stepsTitle}</h2>
        <ol className="steps">
          {t.steps.map((step, index) => (
            <li key={index}>
              <span className="step-number" aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
        <div className="command-example">
          <Terminal size={22} aria-hidden="true" />
          <code>/subscribe canal:Todos</code>
          <span>{t.commandNote}</span>
        </div>
        <p className="permission-note">{t.permissionNote}</p>
      </div>
    </section>
  );
}
