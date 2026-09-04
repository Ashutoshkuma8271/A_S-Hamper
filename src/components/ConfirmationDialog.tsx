import React, { useEffect, useCallback } from 'react';
import { AlertTriangle, Trash2, X, AlertCircle, Info, ShieldAlert, Loader2 } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  itemName?: string;
  itemImage?: string;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
  itemName,
  itemImage,
}: ConfirmationDialogProps) {
  // Close on Escape key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    },
    [onCancel, isLoading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const iconBg =
    variant === 'danger'
      ? 'bg-[#7F011F]/10 text-[#7F011F] dark:bg-[#7F011F]/20 dark:text-[#FBDE9C]'
      : variant === 'warning'
      ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300'
      : 'bg-[#57222C]/10 text-[#57222C] dark:bg-[#FBDE9C]/10 dark:text-[#FBDE9C]';

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-[#7F011F] hover:bg-[#57222C] text-white shadow-md shadow-[#7F011F]/20 focus:ring-[#7F011F]/40'
      : variant === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 focus:ring-amber-500/40'
      : 'bg-[#57222C] hover:bg-[#44040F] text-white shadow-md shadow-[#57222C]/20 focus:ring-[#57222C]/40';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={isLoading ? undefined : onCancel}
      />

      {/* Dialog box */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#E5C57B]/40 bg-[#FAF5E8] dark:bg-[#1A1115] dark:border-[#461C25] p-6 sm:p-7 shadow-2xl transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close icon on top right */}
        <button
          type="button"
          disabled={isLoading}
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#44040F]/60 hover:text-[#44040F] hover:bg-[#57222C]/10 dark:text-[#FAF5E8]/60 dark:hover:text-[#FBDE9C] dark:hover:bg-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* Action icon badge */}
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${iconBg}`}>
            {variant === 'danger' ? (
              <Trash2 className="h-6 w-6" />
            ) : variant === 'warning' ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <Info className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3
              id="confirmation-dialog-title"
              className="font-display text-lg font-bold text-[#44040F] dark:text-[#FAF5E8] leading-tight"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-xs text-[#44040F]/70 dark:text-[#FAF5E8]/70 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Optional preview of item being modified/deleted */}
        {itemName && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#E5C57B]/30 bg-white/70 dark:bg-black/30 p-3">
            {itemImage && (
              <img
                src={itemImage}
                alt={itemName}
                className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-[#E5C57B]/40"
              />
            )}
            <p className="truncate text-xs font-semibold text-[#44040F] dark:text-[#FAF5E8]">
              {itemName}
            </p>
          </div>
        )}

        {/* Actions Button Row */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-full border border-[#E5C57B]/60 bg-transparent px-5 py-2.5 text-xs font-semibold text-[#44040F] hover:bg-[#57222C]/5 dark:border-[#461C25] dark:text-[#FAF5E8] dark:hover:bg-white/5 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all focus:outline-none focus:ring-2 disabled:opacity-60 ${confirmBtnClass}`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
