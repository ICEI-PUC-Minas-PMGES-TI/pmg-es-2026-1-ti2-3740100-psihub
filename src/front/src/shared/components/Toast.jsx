import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const Icon = toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;

  return (
    <div className={`toast toast--${toast.type || 'success'}`} role="status">
      <Icon size={18} />
      <span>{toast.message}</span>
      <button className="toast__close" type="button" onClick={onClose} aria-label="Fechar aviso">
        <X size={16} />
      </button>
    </div>
  );
}
