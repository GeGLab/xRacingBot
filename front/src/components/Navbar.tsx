import { memo, useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { BOT_INVITE_URL } from "../config";

const Navbar = memo(function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-zinc-950/80 backdrop-blur-md border-zinc-800 shadow-lg shadow-black/50"
          : "bg-transparent border-transparent"
      }`}
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <a
          href="/"
          className="flex items-center space-x-2"
          aria-label="XRacing Notifier - Página Inicial"
        >
          <div className="relative w-8 h-8">
            <img
              src="/xracing-logo.jpg"
              alt="XRacing Notifier Logo"
              className="w-full h-full object-cover rounded-full"
              width={32}
              height={32}
              loading="eager"
            />
            <div
              className="absolute inset-0 bg-red-500 blur-sm opacity-20 rounded-full"
              aria-hidden="true"
            />
          </div>
          <span className="text-xl font-bold tracking-tight italic text-white">
            XRacing<span className="text-red-500">Notifier</span>
          </span>
        </a>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">
            Funcionalidades
          </a>
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors"
          >
            Como Funciona
          </a>
          <a href="#preview" className="hover:text-white transition-colors">
            Preview
          </a>
        </div>

        <a
          href={BOT_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-md font-semibold text-sm transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] flex items-center group"
        >
          Adicionar Bot
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </nav>
  );
});

export default Navbar;
