
import React from 'react';
import type { ToolId } from '@/Layout';
import Button from '@/components/common/Button';
import { useTheme } from '@/context/ThemeContext';
import { GithubIcon } from '@/components/Icons';

interface SidebarTool {
  id: ToolId;
  name: string;
  // FIX: Replaced JSX.Element with React.ReactElement
  icon?: React.ReactElement;
  category: string; // Added category
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tools: SidebarTool[];
  activeToolId: ToolId;
  onNavigate: (toolId: ToolId) => void;
  trackLocalEvent: (category: string, action: string, label?: string, value?: string | number) => void;
}

const EmailIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);


const ReleaseNotesLinkIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

const HeartLinkIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( // New Icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

// Define the order of categories for the sidebar
const categoryOrder = [
  "App & Info",
  "AI Music Platforms",
  "Creative AI & Content Tools",
  "Creator Resources & Learning",
  "Music Theory & Composition",
  "Community & Fun Tools"
];


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, tools, activeToolId, onNavigate, trackLocalEvent }) => {
  const { uiMode } = useTheme();
  const emailAddress = "qwqwojij0@mozmail.com";
  const emailSubject = "Music AI Multi-Tool Hub Feedback/Suggestion";
  const emailBody = `Hello Music AI Multi-Tool Hub Team,

I have some feedback/ideas regarding:

- Tool name or specific feature: [Please specify]
- Suggestion/Bug details: [Please describe]

Additional details (optional):
[Any other information, screenshots if applicable but they can't be attached via mailto]

Thanks,
[Your Name / Discord Handle (Optional)]`;

  const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const handleToolButtonClick = (event: React.MouseEvent<HTMLButtonElement>, toolId: ToolId) => {
    if (event.button === 1 || (event.button === 0 && (event.ctrlKey || event.metaKey))) { // Middle-click or Ctrl/Cmd+Left-click
      event.preventDefault();
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('tool', toolId);
      window.open(url.toString(), '_blank');
      if (trackLocalEvent) {
        trackLocalEvent('Navigation', 'openInNewTab', toolId);
      }
    } else if (event.button === 0) { // Normal left-click
      onNavigate(toolId);
    }
  };

  const groupedTools = tools.reduce((acc, tool) => {
    // Exclude Release Notes and Special Mentions from regular grouping
    if (tool.id === 'releaseNotes' || tool.id === 'specialMentions') {
      return acc;
    }
    const category = tool.category || "Other Tools";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, SidebarTool[]>);


  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white dark:bg-gray-900 shadow-2xl z-40 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-r border-gray-200 dark:border-gray-800 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full invisible pointer-events-none'}`} aria-label="Main navigation">
        <header className={`p-4 border-b flex items-center justify-between gap-4 z-20 ${
          uiMode === 'architect' 
            ? 'border-gray-200/50 dark:border-white/5 bg-slate-50/90 dark:bg-gray-950/80 backdrop-blur-xl' 
            : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
        }`}>
           <div className="flex items-center flex-grow overflow-hidden">
             <h2 className={`font-black uppercase tracking-[0.3em] ml-2 ${
               uiMode === 'architect' ? 'text-[10px] text-gray-400 dark:text-gray-500' : 'text-xs text-green-700 dark:text-green-400'
             }`}>
                {uiMode === 'architect' ? 'Hub Menu' : 'Main Menu'}
             </h2>
           </div>
        </header>

        <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-hide sm:scrollbar-default transition-all">
          {categoryOrder.map(categoryName => {
            const toolsInCategory = groupedTools[categoryName] || [];
            if (toolsInCategory.length === 0) return null;

            return (
              <div key={categoryName} className="space-y-2">
                <h3 className="px-4 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-3">
                  {categoryName}
                </h3>
                <div className="space-y-1">
                  {toolsInCategory.map((tool) => (
                    <Button
                      key={tool.id}
                      onClick={(e) => handleToolButtonClick(e as unknown as React.MouseEvent<HTMLButtonElement>, tool.id)}
                      variant="ghost"
                      startIcon={tool.icon ? (
                        <span className={`transition-transform duration-300 group-hover:scale-110 ${activeToolId === tool.id ? 'opacity-100' : 'opacity-60'}`}>
                          {tool.icon}
                        </span>
                      ) : null}
                      className={`w-full flex flex-row items-center justify-start px-4 py-3 text-[11px] font-black uppercase tracking-wider transition-all duration-200 group border-none shadow-none whitespace-nowrap
                                  ${uiMode === 'architect' ? 'rounded-xl' : 'rounded-md md:rounded-lg'}
                                  ${activeToolId === tool.id
                          ? (uiMode === 'architect' 
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20' 
                              : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700')
                          : (uiMode === 'architect'
                              ? 'text-gray-600 dark:text-gray-400 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white')
                        }`}
                      aria-current={activeToolId === tool.id ? 'page' : undefined}
                    >
                      {tool.name}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className={`px-4 py-6 border-t space-y-4 z-20 ${
          uiMode === 'architect' 
            ? 'border-white/10 bg-slate-50/90 dark:bg-gray-950/80 backdrop-blur-xl' 
            : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
        }`}>
          <div>
            <h4 className={`px-4 font-black uppercase tracking-[0.2em] mb-2 ${
              uiMode === 'architect' ? 'text-[9px] text-gray-400 dark:text-gray-500' : 'text-[10px] text-green-700 dark:text-green-400'
            }`}>Feedback</h4>
            <div className="space-y-1">
              <Button
                href="https://github.com/spupuz/music-ai-multi-tool-hub/issues"
                target="_blank"
                as="a"
                variant="ghost"
                size="sm"
                className={`w-full justify-start px-4 border-none shadow-none text-[10px] font-bold uppercase tracking-widest transition-colors
                           ${uiMode === 'architect' 
                              ? 'text-gray-500 dark:text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400' 
                              : 'text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:text-green-600 dark:hover:text-green-400'}`}
                startIcon={<GithubIcon className="w-4 h-4 opacity-70" />}
                aria-label="Report issues or suggestions on GitHub"
              >
                Feedback su GitHub
              </Button>
              <Button
                href={mailtoLink}
                as="a"
                variant="ghost"
                size="sm"
                className={`w-full justify-start px-4 border-none shadow-none text-[10px] font-bold uppercase tracking-widest transition-colors
                           ${uiMode === 'architect' 
                              ? 'text-gray-500 dark:text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400' 
                              : 'text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:text-green-600 dark:hover:text-green-400'}`}
                startIcon={<EmailIcon className="w-4 h-4 opacity-60" />}
                aria-label="Send suggestions or feedback via email"
              >
                Email Support
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <a
              href="https://www.buymeacoffee.com/spupuz"
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Buy Me A Coffee"
            >
              <img
                src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png"
                alt="Buy Me A Coffee"
                style={{ height: '40px', width: '145px', display: 'block', margin: '0 auto' }}
              />
            </a>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={(e) => handleToolButtonClick(e as unknown as React.MouseEvent<HTMLButtonElement>, 'releaseNotes')}
                variant="ghost"
                size="sm"
                className={`flex items-center justify-start p-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all shadow-none whitespace-nowrap border-none
                                  ${activeToolId === 'releaseNotes'
                    ? (uiMode === 'architect' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-white/20 dark:bg-white/10 text-green-600 dark:text-green-400')
                    : (uiMode === 'architect' 
                        ? 'text-gray-500 dark:text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:text-gray-900 dark:hover:text-white')
                  }`}
                startIcon={<ReleaseNotesLinkIcon className="w-3.5 h-3.5 opacity-60" />}
              >
                Notes
              </Button>
              <Button
                onClick={(e) => handleToolButtonClick(e as unknown as React.MouseEvent<HTMLButtonElement>, 'specialMentions')}
                variant="ghost"
                size="sm"
                className={`flex items-center justify-start p-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all shadow-none whitespace-nowrap border-none
                                  ${activeToolId === 'specialMentions'
                    ? (uiMode === 'architect' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-white/20 dark:bg-white/10 text-green-600 dark:text-green-400')
                    : (uiMode === 'architect' 
                        ? 'text-gray-500 dark:text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-white/10 hover:text-gray-900 dark:hover:text-white')
                  }`}
                startIcon={<HeartLinkIcon className="w-3.5 h-3.5 opacity-60" />}
              >
                Credits
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 md:hidden">
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full flex items-center justify-start px-5 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white border-transparent shadow-none"
            aria-label="Close sidebar"
            startIcon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          >
            Collapse Hub
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
