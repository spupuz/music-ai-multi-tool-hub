
import React from 'react';
import type { ToolProps } from '../../Layout'; // Assuming ToolProps is needed if onNavigate is used in future

// Helper components for consistent styling (defined locally for this page)
const SectionTitle: React.FC<{ children: React.ReactNode; id?: string }> = ({ children, id }) => (
  <h2 id={id} className="text-3xl font-bold text-green-600 dark:text-green-400 mt-8 mb-5 border-b-2 border-green-500 dark:border-green-600 pb-2">
    {children}
  </h2>
);

const SubSectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mt-4 mb-2">
    {children}
  </h3>
);

const P: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`mb-3 leading-relaxed text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </p>
);

const STRONG: React.FC<{children: React.ReactNode}> = ({children}) => <strong className="font-semibold text-green-800 dark:text-green-200">{children}</strong>;


const SpecialMentionsPage: React.FC<ToolProps> = ({ trackLocalEvent, onNavigate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-500 dark:border-green-600 transition-colors duration-300">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400 tracking-tight">
          Special Mentions & Acknowledgements
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          A heartfelt thank you to the individuals who have supported and contributed to the Music AI Multi-Tool Hub.
        </p>
      </header>

      <main className="text-gray-700 dark:text-gray-300 leading-relaxed">
        <section id="flickerlog">
          <SectionTitle>flickerlog</SectionTitle>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <P>
              A massive thank you to <STRONG>flickerlog</STRONG> for their unwavering support, invaluable feedback, feature ideas, and for generously providing the virtual server infrastructure that keeps this Hub running and accessible to everyone. Your contributions have been instrumental!
            </P>
          </div>
        </section>

        <section id="sebmeister">
          <SectionTitle>sebmeister | sunosebstream</SectionTitle>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <P>
              Special thanks to <STRONG>sebmeister (sunosebstream)</STRONG> for the original idea and inspiration behind the "Song Deck Picker" tool. Your creative concept helped spark a fun and useful addition to the Hub.
            </P>
          </div>
        </section>

        <section id="luiz-felipe">
          <SectionTitle>Δ∙Ʀ∙Q∙ Luiz★Felip≡</SectionTitle>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <P>
              Gratitude to <STRONG>Δ∙Ʀ∙Q∙ Luiz★Felip≡</STRONG> for providing the foundational content and inspiration for the "Music Theory Wiki". Your knowledge sharing has created a valuable learning resource within the Hub.
            </P>
          </div>
        </section>
        
        <section id="alikan">
          <SectionTitle>Alikan</SectionTitle>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <P>
              Thank you to <STRONG>Alikan</STRONG> for contributing additional content and insights to the "Music Theory Wiki", further enriching its educational value for all users.
            </P>
          </div>
        </section>

        <section id="feropub">
          <SectionTitle>FeroPub</SectionTitle>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <P>
              Our gratitude to <STRONG>FeroPub</STRONG> for suggesting the idea for the "MP3 Cutter & Cropper" tool. Your input helped bring a much-requested audio editing feature to the Hub!
            </P>
          </div>
        </section>
        
        <section id="senzu">
          <SectionTitle>SENZU</SectionTitle>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <P>
              A big thank you to <STRONG>SENZU</STRONG> for their valuable guidance and assistance in integrating Riffusion support across multiple tools in the Hub. Your help was essential in expanding the application's capabilities!
            </P>
          </div>
        </section>

        <section id="community">
            <SectionTitle>And to the Community...</SectionTitle>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <P>A general thank you to everyone in the Suno community and beyond who uses these tools, provides feedback, and shares their musical creations. Your enthusiasm is what drives the continuous development and improvement of this Hub!</P>
            </div>
        </section>

      </main>

      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-md text-gray-500 dark:text-gray-400">
          Music AI Multi-Tool Hub &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default SpecialMentionsPage;
