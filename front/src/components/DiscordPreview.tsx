import { memo } from "react";
import { CheckCircle2 } from "lucide-react";

const DiscordPreview = memo(function DiscordPreview() {
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section
      id="preview"
      className="max-w-5xl mx-auto px-6 py-10 pb-24"
      aria-label="Prévia da notificação no Discord"
    >
      <div className="relative group">
        {/* Glowing border effect */}
        <div
          className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"
          aria-hidden="true"
        />

        <div className="relative bg-[#313338] rounded-xl p-6 md:p-8 shadow-2xl border border-[#1e1f22]">
          <div className="flex items-start space-x-4 font-sans">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-red-500/20 p-1">
              <img
                src="/xracing-logo.jpg"
                alt="XRacing Notifier avatar"
                className="w-full h-full object-cover rounded-full"
                width={40}
                height={40}
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-medium text-white hover:underline cursor-pointer text-base">
                  XRacing Notifier
                </span>
                <span className="bg-[#5865F2] text-white text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
                  BOT
                </span>
                <span className="text-xs text-[#949ba4] mt-0.5 md:mt-0">
                  Hoje às {currentTime}
                </span>
              </div>
              <div className="mt-1 text-[#dbdee1] text-base">
                🏍️ Novo vídeo do XRACING já está no ar!{" "}
                <span className="bg-[#41434A]/60 text-[#c9cdfb] px-1 rounded hover:bg-[#5865F2] hover:text-white cursor-pointer transition-colors">
                  @everyone
                </span>
              </div>

              {/* Rich Embed */}
              <div className="mt-3 border-l-4 border-red-500 bg-[#2b2d31] rounded max-w-lg overflow-hidden shadow-md">
                <div className="p-4">
                  <div className="text-xs font-semibold text-zinc-400 mb-1 flex items-center">
                    YOUTUBE
                  </div>
                  <a
                    href="https://www.youtube.com/watch?v=VSaeXBtrmxo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer mb-2 block text-lg transition-colors"
                  >
                    SUSTOS DE MOTO E ENQUADROS! | OBSERVAÇÕES DIÁRIAS (EP. 308)
                  </a>
                  <p className="text-sm text-[#dbdee1] mb-4 line-clamp-2">
                    Os momentos mais insanos, sustos e observações diárias no
                    trânsito. Não se esqueça de deixar o like e se inscrever
                    para mais conteúdo de moto!
                  </p>
                  <a
                    href="https://www.youtube.com/watch?v=VSaeXBtrmxo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative rounded-md overflow-hidden aspect-video group/img cursor-pointer block"
                  >
                    <img
                      src="/banner.jpg"
                      alt="Thumbnail do vídeo XRACING - SUSTOS DE MOTO E ENQUADROS"
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      width={480}
                      height={270}
                      loading="lazy"
                      decoding="async"
                    />
                    <div
                      className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition-colors"
                      aria-hidden="true"
                    />
                    {/* Play button overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      aria-hidden="true"
                    >
                      <div className="w-12 h-8 bg-red-600/90 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover/img:bg-red-500 transition-colors">
                        <div className="w-0 h-0 border-t-4 border-t-transparent border-l-[6px] border-l-white border-b-4 border-b-transparent ml-1" />
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default DiscordPreview;
