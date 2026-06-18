import { memo } from "react";
import { Github } from "lucide-react";

const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 pt-16 pb-8 text-sm text-zinc-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <a
            href="/"
            className="flex items-center space-x-2 mb-4 md:mb-0"
            aria-label="XRacing Notifier - Página Inicial"
          >
            <div className="relative w-6 h-6">
              <img
                src="/xracing-logo.jpg"
                alt="XRacing Notifier Logo"
                className="w-full h-full object-cover rounded-full grayscale opacity-70"
                width={24}
                height={24}
                loading="lazy"
              />
            </div>
            <span className="font-bold text-zinc-300 italic">
              XRacing Notifier
            </span>
          </a>
          <nav className="flex space-x-6" aria-label="Links do rodapé">
            <a href="#" className="hover:text-red-500 transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-red-500 transition-colors">
              Termos de Serviço
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors flex items-center"
            >
              <Github className="w-4 h-4 mr-1" aria-hidden="true" />
              GitHub
            </a>
          </nav>
        </div>
        <div className="text-center border-t border-zinc-800/50 pt-8 flex flex-col items-center justify-center space-y-6">
          <p className="max-w-3xl text-xs text-zinc-600 leading-relaxed text-center">
            <strong>Aviso Legal:</strong> Este é um projeto não oficial. Não
            possui nenhuma afiliação, patrocínio ou vínculo com o canal oficial
            do XRACING, YouTube ou Discord. Sou apenas um desenvolvedor
            independente e grande fã do canal que criou essa ferramenta para a
            comunidade.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center w-full text-zinc-500">
            <p>&copy; {currentYear} XRacing Notifier.</p>
            <p className="mt-2 md:mt-0">Feito de fã para fãs 🏁</p>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
