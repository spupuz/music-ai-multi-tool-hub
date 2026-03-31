import React from 'react';

export const H3: React.FC<{children: React.ReactNode}> = ({children}) => (
  <h3 className="text-2xl font-semibold text-green-700 dark:text-green-300 mt-6 mb-3">{children}</h3>
);

export const P: React.FC<{children: React.ReactNode}> = ({children}) => (
  <p className="mb-3 leading-relaxed text-gray-800 dark:text-gray-300">{children}</p>
);

export const UL: React.FC<{children: React.ReactNode}> = ({children}) => (
  <ul className="list-disc list-inside pl-4 mb-3 space-y-1 text-gray-800 dark:text-gray-300">{children}</ul>
);

export const LI: React.FC<{children: React.ReactNode}> = ({children}) => (
  <li>{children}</li>
);

export const CODE: React.FC<{children: React.ReactNode}> = ({children}) => (
  <code className="bg-gray-200 dark:bg-gray-700 text-sm text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded-md font-mono">{children}</code>
);

export const PRE: React.FC<{children: React.ReactNode}> = ({children}) => (
  <pre className="bg-gray-800 dark:bg-gray-700 p-3 rounded-md text-sm text-yellow-300 overflow-x-auto mb-3">{children}</pre>
);

export const STRONG: React.FC<{children: React.ReactNode}> = ({children}) => (
  <strong className="font-semibold text-green-700 dark:text-green-200">{children}</strong>
);
