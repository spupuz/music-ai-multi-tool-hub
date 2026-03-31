import React from 'react';

export const CogIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.223.893c.05.199.121.39.209.572.088.182.202.35.34.501.138.15.297.281.47.392.173.112.364.204.568.276l.672.224c.543.181.94.692.94 1.27v1.154c0 .579-.397 1.09-.94 1.27l-.672.224c-.204.072-.395.164-.568.276-.173.111-.332.242-.47.392-.138.151-.252.319-.34.501-.088.182-.159.373-.209.572l-.223.893c-.09.542-.56.94-1.11-.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.223-.893a6.002 6.002 0 01-.209-.572c-.088-.182-.202.35-.34-.501s-.297-.281-.47-.392c-.173-.112-.364-.204-.568-.276l-.672-.224c-.543-.181-.94-.692-.94-1.27V9.409c0-.579.397-1.09.94-1.11l.672-.224c.204-.072.395-.164-.568-.276.173-.111.332.242.47.392.138-.151.252.319.34.501.088.182.159.373.209.572l.223-.893z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const EyeOpenIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
