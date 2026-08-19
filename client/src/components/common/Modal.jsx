import React, { useEffect } from 'react';

export default function Modal({ open = false, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4">
      <div
        className="w-full max-w-lg rounded-card border border-gray-light bg-white shadow-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {title && (
          <div className="flex items-center justify-between border-b border-gray-light px-5 py-4">
            <h3 id="modal-title" className="font-display text-lg font-semibold text-charcoal">{title}</h3>
            <button type="button" onClick={onClose} className="text-sm text-gray-mid hover:text-charcoal">Close</button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="border-t border-gray-light px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}