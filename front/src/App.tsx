import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Story from "./components/Story";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import { LanguageProvider, useLanguage } from "./i18n";

function Landing() {
  const { t } = useLanguage();
  return (
    <>
      <a href="#main" className="skip-link">
        {t.skip}
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Features />
        <HowItWorks />
        <Story />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
export default function App() {
  return (
    <LanguageProvider>
      <Landing />
    </LanguageProvider>
  );
}
