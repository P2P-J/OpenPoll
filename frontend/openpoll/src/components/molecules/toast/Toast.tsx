import { useEffect, useRef, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  contentStyle?: CSSProperties;
}

export function Toast({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 3000,
  contentStyle
}: ToastProps) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => onCloseRef.current(), duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const icons = {
    info: Info,
    success: CheckCircle,
    error: AlertCircle,
  };

  const colors = {
    info: 'bg-blue-600 dark:bg-blue-500 text-white',
    success: 'bg-green-600 dark:bg-green-500 text-white',
    error: 'bg-red-600 dark:bg-red-500 text-white',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className="fixed z-50"
          style={{ top: '5rem', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '28rem', padding: '0 1rem' }}
        >
          <motion.div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg ${contentStyle ? '' : colors[type]}`} style={contentStyle}>
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <p className="flex-1 font-semibold text-sm sm:text-base">{message}</p>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="알림 닫기"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
