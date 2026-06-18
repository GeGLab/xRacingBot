import { memo } from "react";

interface Step {
  step: string;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  {
    step: "01",
    title: "Convide o Bot",
    desc: "Clique no botão de adicionar, autorize o bot e escolha o canal do Discord onde você quer receber as notificações.",
  },
  {
    step: "02",
    title: "Use /subscribe",
    desc: "Digite /subscribe e escolha o que você quer acompanhar: Todos os canais, só XRACING ou só XRACING Quedas.",
  },
  {
    step: "03",
    title: "Pronto!",
    desc: "Dê permissão para mencionar @everyone (se quiser alertar o server todo) e pronto — você será notificado a cada upload!",
  },
];

const StepCard = memo(function StepCard({ item }: { item: Step }) {
  return (
    <article className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-sm relative group hover:-translate-y-2 transition-transform duration-300">
      <div className="absolute -top-6 left-8 bg-zinc-950 border border-red-500/30 text-red-500 text-xl font-black italic px-4 py-2 rounded-lg shadow-[0_0_10px_rgba(220,38,38,0.2)]">
        {item.step}
      </div>
      <h3 className="text-xl font-bold mb-3 mt-4">{item.title}</h3>
      <p className="text-zinc-400">{item.desc}</p>
    </article>
  );
});

const HowItWorks = memo(function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24" aria-label="Como funciona">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Dos 0 aos 100 em <span className="text-red-500">3 Passos</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4 relative">
          {/* Connecting line for desktop */}
          <div
            className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-900/50 to-transparent -z-10 -translate-y-1/2"
            aria-hidden="true"
          />
          {STEPS.map((item, i) => (
            <StepCard key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default HowItWorks;
