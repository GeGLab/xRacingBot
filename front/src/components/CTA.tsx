import { memo } from "react";
import { Bot, ExternalLink } from "lucide-react";
import { BOT_INVITE_URL } from "../config";

const CTA = memo(function CTA() {
  return (
    <section
      className="py-32 relative overflow-hidden"
      aria-label="Chamada para ação"
    >
      <div className="absolute inset-0 bg-red-600/5 z-0" aria-hidden="true" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          Pronto para Turbinar o Seu Servidor?
        </h2>
        <p className="text-xl text-zinc-400 mb-10">
          Junte-se a milhares de outros fãs de motovlog e fique à frente de cada
          upload.
        </p>
        <a
          href={BOT_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded-md font-bold text-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] inline-flex items-center group"
        >
          <Bot className="w-6 h-6 mr-3" aria-hidden="true" />
          Adicionar o Bot Agora
          <ExternalLink
            className="w-5 h-5 ml-3 opacity-50 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          />
        </a>
      </div>
    </section>
  );
});

export default CTA;
