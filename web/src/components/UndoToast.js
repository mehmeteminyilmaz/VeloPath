import React, { useEffect, useRef, useState } from 'react';
import { Undo2, X, Trash2 } from 'lucide-react';

const DURATION = 5000; // ms

const UndoToast = ({ toasts, onUndo, onDismiss }) => {
  return (
    <div className="undo-toast-stack" aria-live="assertive">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onUndo={onUndo}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onUndo, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef(null);
  const [exiting, setExiting] = useState(false);

  const onDismissRef = useRef(onDismiss);
  const onUndoRef = useRef(onUndo);

  useEffect(() => {
    onDismissRef.current = onDismiss;
    onUndoRef.current = onUndo;
  });

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismissRef.current(toast.id), 300);
  };

  const handleUndo = () => {
    setExiting(true);
    setTimeout(() => onUndoRef.current(toast.id), 300);
  };

  useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);

      if (elapsed < DURATION) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);

    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, DURATION);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(dismissTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`undo-toast ${exiting ? 'undo-toast-exit' : 'undo-toast-enter'}`}>
      <div className="undo-toast-inner">
        {/* Icon */}
        <div className="undo-toast-icon">
          <Trash2 size={18} />
        </div>

        {/* Message */}
        <div className="undo-toast-message">
          <span className="undo-toast-title">{toast.label}</span>
          <span className="undo-toast-sub">silindi</span>
        </div>

        {/* Undo Button */}
        <button
          className="undo-toast-btn"
          onClick={handleUndo}
          id={`undo-btn-${toast.id}`}
          aria-label="Geri al"
        >
          <Undo2 size={16} />
          Geri Al
        </button>

        {/* Close Button */}
        <button
          className="undo-toast-close"
          onClick={handleDismiss}
          aria-label="Kapat"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="undo-progress-track">
        <div
          className="undo-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default UndoToast;
