import { memo } from "react";
import { Bot, Activity } from "lucide-react";
import { BOT_INVITE_URL } from "../config";

const Hero = memo(function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
      <div className="inline-flex items-center space-x-2 bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-1.5 mb-8">
        <Activity
          className="w-4 h-4 text-red-500 animate-pulse"
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-zinc-300">
          A v2.0 já está no ar e mais rápida do que nunca
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
          Nunca Mais Perca um Vídeo do <br className="hidden md:block" />
        </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 italic">
          {" "}
          XRACING
        </span>
        <span
          className="inline-block hover:scale-110 transition-transform cursor-default ml-2 drop-shadow-lg"
          style={{ WebkitTextFillColor: "initial", color: "initial" }}
          aria-hidden="true"
        >
          🏍️💨
        </span>
      </h1>

      <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
        Receba notificações instantâneas e cheias de adrenalina no seu servidor
        do Discord assim que um novo vídeo do XRACING for lançado.
      </p>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
        <a
          href={BOT_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-md font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_35px_rgba(220,38,38,0.7)] flex items-center justify-center group"
        >
          <Bot className="w-5 h-5 mr-2" aria-hidden="true" />
          Adicionar ao Discord
        </a>
        <a
          href="#how-it-works"
          className="px-8 py-4 rounded-md font-bold text-lg text-white border border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800 transition-colors flex items-center justify-center"
        >
          Veja Como Funciona
        </a>
      </div>
    </section>
  );
});

export default Hero;
