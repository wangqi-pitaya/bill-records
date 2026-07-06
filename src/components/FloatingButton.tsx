import { Plus } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
  visible?: boolean;
  color?: string;
  className?: string;
}

export const FloatingButton = ({ onClick, visible = true, color, className }: FloatingButtonProps) => {
  const buttonStyle = color
    ? { background: `linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})` }
    : undefined;

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-floating hover:shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center text-white ${
        color ? '' : 'bg-gradient-to-br from-primary-400 to-primary-600'
      } ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      } ${className || ''}`}
      style={buttonStyle}
    >
      <Plus className="w-7 h-7" />
    </button>
  );
};

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}