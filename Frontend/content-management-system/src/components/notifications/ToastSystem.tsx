import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after duration
    const duration = toast.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast({ type: ToastType.SUCCESS, title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast({ type: ToastType.ERROR, title, message, duration: 7000 });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast({ type: ToastType.WARNING, title, message });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast({ type: ToastType.INFO, title, message });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

const toastStyles = {
  [ToastType.SUCCESS]: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✅',
    iconColor: 'text-green-600',
    textColor: 'text-green-900',
  },
  [ToastType.ERROR]: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '❌',
    iconColor: 'text-red-600',
    textColor: 'text-red-900',
  },
  [ToastType.WARNING]: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: '⚠️',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-900',
  },
  [ToastType.INFO]: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'ℹ️',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-900',
  },
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => {
        const styles = toastStyles[toast.type];
        
        return (
          <div
            key={toast.id}
            className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 animate-slide-in-right`}
          >
            <div className="flex items-start gap-3">
              <span className={`text-xl ${styles.iconColor}`}>{styles.icon}</span>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold ${styles.textColor}`}>
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className={`text-sm mt-1 ${styles.textColor} opacity-90`}>
                    {toast.message}
                  </p>
                )}
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    className={`text-sm font-medium mt-2 ${styles.iconColor} hover:underline`}
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              
              <button
                onClick={() => dismissToast(toast.id)}
                className={`${styles.textColor} opacity-50 hover:opacity-100 transition-opacity`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Add this to your global CSS
const styles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;

export default { ToastProvider, ToastContainer, useToast };
