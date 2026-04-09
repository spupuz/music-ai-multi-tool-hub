
import React from 'react';
import type { ToolProps } from '@/Layout';
import { useTheme } from '@/context/ThemeContext';

// Helper components for consistent styling (defined locally for this page)
const SectionTitle: React.FC<{ children: React.ReactNode; id?: string }> = ({ children, id }) => {
  const { uiMode } = useTheme();
  return (
    <h2 id={id} className={`text-2xl font-black uppercase tracking-tight mt-8 mb-5 border-b-2 pb-2 ${uiMode === 'architect' ? 'text-emerald-500 border-white/10' : 'text-emerald-600 dark:text-emerald-400 border-emerald-500 dark:border-emerald-600'}`}>
      {children}
    </h2>
  );
};

const SubSectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uiMode } = useTheme();
  return (
    <h3 className={`text-xl font-black uppercase tracking-tight mt-4 mb-2 ${uiMode === 'architect' ? 'text-white' : 'text-emerald-700 dark:text-emerald-300'}`}>
      {children}
    </h3>
  );
};

const P: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`mb-3 leading-relaxed text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </p>
);

const STRONG: React.FC<{children: React.ReactNode}> = ({children}) => {
  const { uiMode } = useTheme();
  return <strong className={`font-black uppercase tracking-widest text-[10px] ${uiMode === 'architect' ? 'text-emerald-500' : 'text-emerald-800 dark:text-emerald-200'}`}>{children}</strong>;
};


const SpecialMentionsPage: React.FC<ToolProps> = ({ trackLocalEvent, onNavigate }) => {
  const { uiMode } = useTheme();

  if (uiMode === 'classic') {
    return (
      <div className="w-full text-gray-900 dark:text-white pb-20 px-4 animate-fadeIn">
        <header className="mb-10 text-center pt-8">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
            Special Mentions
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center">
            A heartfelt tribute to the pioneers and architects of the Hub
          </p>
        </header>

        <main className="space-y-8">
          <section className="glass-card p-6 md:p-10 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">flickerlog</h2>
            <p>A massive thank you to <strong>flickerlog</strong> for their unwavering support, invaluable feedback, feature ideas, and for generously providing the virtual server infrastructure that keeps this Hub running and accessible to everyone.</p>
          </section>

          <section className="glass-card p-6 md:p-10 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">sebmeister | sunosebstream</h2>
            <p>Special thanks to <strong>sebmeister (sunosebstream)</strong> for the original idea and inspiration behind the "Song Deck Picker" tool.</p>
          </section>

          <section className="glass-card p-6 md:p-10 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">Δ∙Ʀ∙Q∙ Luiz★Felip≡</h2>
            <p>Gratitude to <strong>Δ∙Ʀ∙Q∙ Luiz★Felip≡</strong> for providing the foundational content and inspiration for the "Music Theory Wiki".</p>
          </section>

          <section className="glass-card p-6 md:p-10 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">Alikan</h2>
            <p>Thank you to <strong>Alikan</strong> for contributing additional content and insights to the "Music Theory Wiki".</p>
          </section>

          <section className="glass-card p-6 md:p-10 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">FeroPub</h2>
            <p>Our gratitude to <strong>FeroPub</strong> for suggesting the idea for the "MP3 Cutter & Cropper" tool.</p>
          </section>

          <section className="glass-card p-6 md:p-10 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">SENZU</h2>
            <p>A big thank you to <strong>SENZU</strong> for their valuable guidance and assistance in integrating Riffusion support across multiple tools.</p>
          </section>

          <section className="glass-card p-6 md:p-10 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">And to the Community...</h2>
            <p>A general thank you to everyone in the Suno community and beyond who uses these tools, provides feedback, and shares their musical creations.</p>
          </section>
        </main>

        <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500">Music AI Multi-Tool Hub &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto glass-card p-6 md:p-12 border-white/10 shadow-2xl transition-all duration-500 animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none"></div>

      <header className="mb-14 text-center pt-8 px-4 relative z-10">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic mb-4">
          Special Mentions
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
          A heartfelt tribute to the pioneers and architects of the Hub
        </p>
      </header>

      <main className="text-gray-700 dark:text-gray-300 leading-relaxed relative z-10 space-y-8">
        <section id="flickerlog" className="bg-white/5 dark:bg-black/20 rounded-3xl p-8 border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
          <SectionTitle>flickerlog</SectionTitle>
          <P>
            A massive thank you to <STRONG>flickerlog</STRONG> for their unwavering support, invaluable feedback, feature ideas, and for generously providing the virtual server infrastructure that keeps this Hub running and accessible to everyone. Your contributions have been instrumental!
          </P>
        </section>

        <section id="sebmeister" className="bg-white/5 dark:bg-black/20 rounded-3xl p-8 border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
          <SectionTitle>sebmeister | sunosebstream</SectionTitle>
          <P>
            Special thanks to <STRONG>sebmeister (sunosebstream)</STRONG> for the original idea and inspiration behind the "Song Deck Picker" tool. Your creative concept helped spark a fun and useful addition to the Hub.
          </P>
        </section>

        <section id="luiz-felipe" className="bg-white/5 dark:bg-black/20 rounded-3xl p-8 border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
          <SectionTitle>Δ∙Ʀ∙Q∙ Luiz★Felip≡</SectionTitle>
          <P>
            Gratitude to <STRONG>Δ∙Ʀ∙Q∙ Luiz★Felip≡</STRONG> for providing the foundational content and inspiration for the "Music Theory Wiki". Your knowledge sharing has created a valuable learning resource within the Hub.
          </P>
        </section>
        
        <section id="alikan" className="bg-white/5 dark:bg-black/20 rounded-3xl p-8 border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
          <SectionTitle>Alikan</SectionTitle>
          <P>
            Thank you to <STRONG>Alikan</STRONG> for contributing additional content and insights to the "Music Theory Wiki", further enriching its educational value for all users.
          </P>
        </section>

        <section id="feropub" className="bg-white/5 dark:bg-black/20 rounded-3xl p-8 border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
          <SectionTitle>FeroPub</SectionTitle>
          <P>
            Our gratitude to <STRONG>FeroPub</STRONG> for suggesting the idea for the "MP3 Cutter & Cropper" tool. Your input helped bring a much-requested audio editing feature to the Hub!
          </P>
        </section>
        
        <section id="senzu" className="bg-white/5 dark:bg-black/20 rounded-3xl p-8 border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
          <SectionTitle>SENZU</SectionTitle>
          <P>
            A big thank you to <STRONG>SENZU</STRONG> for their valuable guidance and assistance in integrating Riffusion support across multiple tools in the Hub. Your help was essential in expanding the application's capabilities!
          </P>
        </section>

        <section id="community" className="bg-white/5 dark:bg-black/20 rounded-3xl p-8 border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
            <SectionTitle>And to the Community...</SectionTitle>
            <P>A general thank you to everyone in the Suno community and beyond who uses these tools, provides feedback, and shares their musical creations. Your enthusiasm is what drives the continuous development and improvement of this Hub!</P>
        </section>
      </main>

      <footer className="mt-16 pt-8 border-t border-white/10 text-center relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 opacity-40">
          Music AI Multi-Tool Hub &copy; {new Date().getFullYear()} • Network of Excellence
        </p>
      </footer>
    </div>
  );
};

export default SpecialMentionsPage;
