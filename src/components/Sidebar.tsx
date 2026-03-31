
import React from 'react';
import type { ToolId } from '@/Layout';

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

      <aside
        className={`fixed inset-y-0 left-0 z-40 pt-16 flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64 transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-green-700
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Main navigation"
      >
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
          {categoryOrder.map(categoryName => {
            const toolsInCategory = groupedTools[categoryName] || [];
            if (toolsInCategory.length === 0) return null;

            return (
              <div key={categoryName} className="space-y-1">
                <h3 className="px-3 mt-3 mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                  {categoryName}
                </h3>
                {toolsInCategory.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={(e) => handleToolButtonClick(e, tool.id)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                                ${activeToolId === tool.id
                        ? 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-green-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                    aria-current={activeToolId === tool.id ? 'page' : undefined}
                  >
                    {tool.icon && <span className="mr-3 flex-shrink-0">{tool.icon}</span>}
                    <span className="flex-grow text-left">{tool.name}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div>
            <h4 className="px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-500 tracking-wider mb-1">Feedback</h4>
            <a
              href={mailtoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-green-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
              aria-label="Send suggestions or feedback via email"
            >
              <EmailIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              Email Feedback
            </a>
          </div>
          <div className="pt-2"> {/* Support and Version Info */}
            <a
              href="https://www.buymeacoffee.com/spupuz"
              target="_blank"
              rel="noopener noreferrer"
              className="block mx-auto hover:opacity-90 transition-opacity mb-2"
              aria-label="Buy Me A Coffee"
            >
              <img
                src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png"
                alt="Buy Me A Coffee"
                style={{ height: '45px', width: '163px', display: 'block', margin: '0 auto' }}
              />
            </a>
            <button
              onClick={(e) => handleToolButtonClick(e, 'releaseNotes')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1
                                ${activeToolId === 'releaseNotes'
                  ? 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-green-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              aria-current={activeToolId === 'releaseNotes' ? 'page' : undefined}
            >
              <ReleaseNotesLinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              Release Notes
            </button>
            <button
              onClick={(e) => handleToolButtonClick(e, 'specialMentions')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                                ${activeToolId === 'specialMentions'
                  ? 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-green-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              aria-current={activeToolId === 'specialMentions' ? 'page' : undefined}
            >
              <HeartLinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              Special Mentions
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 md:hidden">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-green-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close Menu
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
