import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

// Lazy load below-the-fold components for better initial load performance
const DiscordPreview = lazy(() => import('./components/DiscordPreview'));
const Features = lazy(() => import('./components/Features'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const CTA = lazy(() => import('./components/CTA'));
const Footer = lazy(() => import('./components/Footer'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24" aria-busy="true" aria-label="Carregando conteúdo">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-red-500/30 selection:text-red-200">
      {/* Background ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 pt-28" role="main">
        {/* Critical above-the-fold content loaded eagerly */}
        <Hero />

        {/* Below-the-fold content loaded lazily */}
        <Suspense fallback={<LoadingFallback />}>
          <DiscordPreview />
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <Features />
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <HowItWorks />
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <Testimonials />
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <CTA />
        </Suspense>
      </main>

      {/* Footer */}
      <Suspense fallback={<LoadingFallback />}>
        <Footer />
      </Suspense>
    </div>
  );
}
