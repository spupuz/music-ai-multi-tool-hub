import React, { createContext, useCallback, useContext, useState, useRef } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

let nextId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, number>>(new Map());

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    timersRef.current.delete(id);
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
    const timer = window.setTimeout(() => removeToast(id), 3000);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-3 pointer-events-none" aria-live="polite">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-fadeIn px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl border backdrop-blur-lg ${
              toast.type === 'success'
                ? 'bg-emerald-600/90 border-emerald-400/30 text-white'
                : toast.type === 'error'
                ? 'bg-red-600/90 border-red-400/30 text-white'
                : 'bg-gray-800/90 border-white/10 text-gray-100'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
