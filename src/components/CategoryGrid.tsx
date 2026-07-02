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
    <div className="grid grid-cols-4 gap-3">
      {categories.map((category) => {
        const IconComponent = (Icons as Record<string, React.FC<{ className?: string }>>)[category.icon] || Icons.Circle;
        const isSelected = selectedCategory?.id === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${
              isSelected
                ? type === 'income'
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : 'bg-red-500 text-white shadow-lg scale-105'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <IconComponent className="w-6 h-6" />
            <span className="text-sm font-medium whitespace-nowrap truncate max-w-full">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
};