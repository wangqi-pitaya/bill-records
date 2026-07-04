interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-modal shadow-modal w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
        </div>
        <div className="flex border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 py-4 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-r border-gray-100 dark:border-gray-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-4 font-medium transition-colors ${
              type === 'danger'
                ? 'text-expense-500 hover:bg-expense-50 dark:hover:bg-expense-900/20'
                : 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};