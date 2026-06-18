import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { Zap, Settings, Server, ShieldCheck } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: "Alertas em Tempo Real",
    desc: "Usando tecnologia WebSub para notificar o seu servidor no exato segundo em que o YouTube processa o vídeo.",
  },
  {
    icon: Settings,
    title: "Configuração em Menos de 1m",
    desc: "Sem painéis complexos. Dois comandos simples e você já está pronto.",
  },
  {
    icon: Server,
    title: "Qualquer Tamanho de Servidor",
    desc: "Tenha 10 amigos ou 100.000 membros, o bot escala sem esforço.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Spam",
    desc: "Sem promoções ou anúncios indesejados. Apenas os vídeos do Xracing que realmente quer ver.",
  },
];

const FeatureCard = memo(function FeatureCard({
  feature,
}: {
  feature: Feature;
}) {
  const Icon = feature.icon;
  return (
    <article className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:border-red-500/50 transition-colors group">
      <div className="w-12 h-12 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-red-500/30 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all">
        <Icon className="w-6 h-6 text-red-500" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-zinc-100">{feature.title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
    </article>
  );
});

const Features = memo(function Features() {
  return (
    <section
      id="features"
      className="py-24 bg-zinc-900/30 border-y border-zinc-800/50"
      aria-label="Funcionalidades"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 italic">
            Feito para a <span className="text-red-500">Velocidade</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Tudo o que você precisa para manter a sua comunidade atualizada sem
            complicações.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={i} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default Features;
