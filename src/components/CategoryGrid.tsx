import * as Icons from 'lucide-react';
import { Category, BillType } from '../types';

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
  type: BillType;
}

export const CategoryGrid = ({ categories, selectedCategory, onSelect, type }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {categories.map((category) => {
        const IconComponent = (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[category.icon] || Icons.Circle;
        const isSelected = selectedCategory?.id === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category)}
            className={`flex flex-col items-center justify-center gap-1 p-0.5 rounded-md aspect-square transition-all duration-200 ${
              isSelected
                ? type === 'income'
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : 'bg-red-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <IconComponent className="w-6 h-6" />
            <span className="text-xs font-medium whitespace-nowrap truncate max-w-full">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
};