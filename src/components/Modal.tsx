import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  showCloseButton?: boolean;
  closable?: boolean;
  children?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  showFooter?: boolean;
  footerButtons?: React.ReactNode;
  confirmDisabled?: boolean;
  confirmVariant?: 'primary' | 'danger' | 'warning';
  width?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  showCloseButton = false,
  closable = true,
  children,
  cancelText = '取消',
  confirmText = '确定',
  onCancel,
  onConfirm,
  showFooter = false,
  footerButtons,
  confirmDisabled = false,
  confirmVariant = 'primary',
  width = 'max-w-sm',
}: ModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (closable && onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600',
    danger: 'bg-expense-500 hover:bg-expense-600',
    warning: 'bg-orange-500 hover:bg-orange-600',
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-[340px] bg-white dark:bg-gray-800 rounded-xl shadow-modal overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            {title ? (
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="px-4 py-4">
          {children}
        </div>

        {showFooter && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-3">
            {footerButtons ? (
              footerButtons
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirmDisabled}
                  className={`flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition-colors ${
                    confirmDisabled
                      ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                      : variantClasses[confirmVariant]
                  }`}
                >
                  {confirmText}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}