import { Plus } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
  visible?: boolean;
}

export const FloatingButton = ({ onClick, visible = true }: FloatingButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full shadow-floating hover:shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center text-white ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <Plus className="w-7 h-7" />
    </button>
  );
};