
import React from 'react';

export const P: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`mb-3 leading-relaxed text-gray-700 dark:text-gray-300 ${className}`}>{children}</p>
);

export const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className="list-disc list-inside pl-4 mb-3 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>
);

export const LI: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li>{children}</li>
);

export const CODE: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="bg-gray-100 dark:bg-gray-700 text-sm text-yellow-800 dark:text-yellow-300 px-1.5 py-0.5 rounded-md font-mono">{children}</code>
);

export const STRONG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="font-semibold text-green-700 dark:text-green-200">{children}</strong>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; id?: string }> = ({ children, id }) => (
  <h2 id={id} className="text-3xl font-bold text-green-600 dark:text-green-400 mt-8 mb-5 border-b-2 border-green-500 dark:border-green-600 pb-2">
    {children}
  </h2>
);

export const SubSectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-4 mb-2">{children}</h3>
);
