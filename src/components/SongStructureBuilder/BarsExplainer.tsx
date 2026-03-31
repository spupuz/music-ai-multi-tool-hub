import React from 'react';

const BarsExplainer: React.FC = () => {
  return (
    <details className="mb-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg group">
      <summary className="p-3 cursor-pointer text-md font-semibold text-green-700 dark:text-green-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors flex justify-between items-center">
        <span>What Are Bars & How Do They Work?</span>
        <span className="transform transition-transform duration-200 group-open:rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500 dark:text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </summary>
      <div className="p-4 border-t border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 space-y-2">
        <p>A <strong className="font-semibold text-green-700 dark:text-green-200">bar</strong> (or <strong className="font-semibold text-green-700 dark:text-green-200">measure</strong>) is a basic unit of time in music. Think of it as a container that holds a specific number of beats.</p>
        <p>The <strong className="font-semibold text-green-700 dark:text-green-200">Beats Per Bar</strong> setting (from the time signature, e.g., the first '4' in 4/4) determines how many beats fit into one bar. The <strong className="font-semibold text-green-700 dark:text-green-200">BPM</strong> (Beats Per Minute) sets the speed of those beats.</p>
        <div className="p-2 my-1 bg-white dark:bg-gray-900 rounded-md text-xs border border-gray-200 dark:border-gray-700">
          <strong className="text-yellow-600 dark:text-yellow-300">Example:</strong> At 120 BPM in 4/4 time:
          <ul className="list-disc list-inside pl-2 mt-1">
            <li>Each bar has 4 beats.</li>
            <li>Each beat lasts 0.5 seconds (<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">60s / 120 BPM</code>).</li>
            <li>Therefore, one 8-bar verse will last <strong className="text-yellow-600 dark:text-yellow-300">16 seconds</strong> (<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">8 bars × 4 beats/bar × 0.5s/beat</code>).</li>
          </ul>
        </div>
        <p>Using bar counts helps you control the pacing and length of your song sections. Including them in your final prompt (e.g., <code className="bg-gray-100 dark:bg-gray-700 text-yellow-600 dark:text-yellow-300 px-1.5 py-0.5 rounded-md font-mono">[Verse] (16 bars)</code>) gives the AI valuable structural information.</p>
      </div>
    </details>
  );
};

export default BarsExplainer;
