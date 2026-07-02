import { Plus } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
}

export const FloatingButton = ({ onClick }: FloatingButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-white"
    >
      <Plus className="w-7 h-7" />
    </button>
  );
};