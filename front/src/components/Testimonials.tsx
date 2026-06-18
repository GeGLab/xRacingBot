import { memo } from "react";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "ApexHunter",
    role: "Admin do Servidor",
    quote:
      "Finalmente, um bot que funciona. Sem permissões estranhas, sem spam, apenas puro conteúdo de moto assim que sai.",
  },
  {
    name: "DriftKing99",
    role: "Fã do XRACING",
    quote:
      "Meu servidor é sempre o primeiro a ver os novos uploads agora. O embed também tem um visual super limpo.",
  },
  {
    name: "SarahV12",
    role: "Mod da Comunidade",
    quote:
      "Configurei em literalmente 30 segundos. Não perdeu um único upload nos 4 meses que estamos usando.",
  },
];

const StarIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const TestimonialCard = memo(function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <article className="bg-zinc-950 p-6 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
      <div className="flex text-red-500 mb-4" aria-label="5 de 5 estrelas">
        {Array.from({ length: 5 }, (_, j) => (
          <StarIcon key={j} />
        ))}
      </div>
      <blockquote className="text-zinc-300 italic mb-6">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className="flex items-center">
        <div
          className="w-10 h-10 rounded-full bg-zinc-800 mr-3 flex items-center justify-center font-bold text-zinc-500"
          aria-hidden="true"
        >
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <div className="font-bold text-sm text-zinc-100">
            {testimonial.name}
          </div>
          <div className="text-xs text-zinc-500">{testimonial.role}</div>
        </div>
      </div>
    </article>
  );
});

const Testimonials = memo(function Testimonials() {
  return (
    <section
      className="py-24 bg-zinc-900/30 border-y border-zinc-800/50"
      aria-label="Depoimentos da comunidade"
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Aprovado pela Comunidade
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <TestimonialCard key={i} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default Testimonials;
