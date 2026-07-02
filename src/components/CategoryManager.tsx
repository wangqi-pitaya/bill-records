import { useState } from 'react';
import { X, Plus, GripVertical, Trash2, AlertCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Category, BillType } from '../types';
import { useCategoryStore } from '../store/useCategoryStore';
import { ConfirmModal } from './ConfirmModal';
import { availableIcons } from '../data/categories';

interface CategoryManagerProps {
  isOpen: boolean;
  type: BillType;
  onClose: () => void;
}

export const CategoryManager = ({ isOpen, type, onClose }: CategoryManagerProps) => {
  const { getCategoriesByType, addCategory, deleteCategory, reorderCategories, isCategoryUsed } = useCategoryStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Circle');
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const categories = getCategoriesByType(type);

  const handleAdd = () => {
    if (!newName.trim()) return;
    
    addCategory({
      name: newName.trim(),
      icon: newIcon,
      type,
    });
    
    setNewName('');
    setNewIcon('Circle');
    setShowAddForm(false);
  };

  const handleDeleteRequest = (category: Category) => {
    if (isCategoryUsed(category.name)) {
      setDeleteError(`"${category.name}"分类已有账单记录，无法删除`);
      return;
    }
    setDeleteConfirm(category);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteCategory(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);
    
    reorderCategories(type, newCategories);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!isOpen) return null;

  const typeColor = type === 'income' ? 'green' : 'red';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white w-full max-h-[80vh] rounded-t-2xl shadow-xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            管理{type === 'income' ? '收入' : '支出'}分类
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-2">
            {categories.map((category, index) => {
              const IconComponent = (Icons as Record<string, React.FC<{ className?: string }>>)[category.icon] || Icons.Circle;
              
              return (
                <div
                  key={category.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${typeColor}-100`}>
                    <IconComponent className={`w-5 h-5 text-${typeColor}-600`} />
                  </div>
                  <span className="flex-1 font-medium text-gray-800">{category.name}</span>
                  <button
                    onClick={() => handleDeleteRequest(category)}
                    className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>

          {showAddForm ? (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="mb-3">
                <label className="text-sm text-gray-600 mb-1 block">分类名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="输入分类名称"
                  className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div className="mb-3">
                <label className="text-sm text-gray-600 mb-1 block">选择图标</label>
                <div className="grid grid-cols-8 gap-2">
                  {availableIcons.map((icon) => {
                    const IconComponent = (Icons as Record<string, React.FC<{ className?: string }>>)[icon] || Icons.Circle;
                    return (
                      <button
                        key={icon}
                        onClick={() => setNewIcon(icon)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          newIcon === icon
                            ? `bg-${typeColor}-500 text-white`
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-600 font-medium hover:bg-gray-300"
                >
                  取消
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    newName.trim()
                      ? `bg-${typeColor}-500 text-white hover:bg-${typeColor}-600`
                      : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  添加
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className={`mt-4 w-full py-3 rounded-xl bg-${typeColor}-50 text-${typeColor}-600 font-medium flex items-center justify-center gap-2 hover:bg-${typeColor}-100 transition-colors`}
            >
              <Plus className="w-5 h-5" />
              添加新分类
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="确认删除"
        message={`确定要删除"${deleteConfirm?.name}"分类吗？`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />

      <ConfirmModal
        isOpen={!!deleteError}
        title="无法删除"
        message={deleteError || ''}
        confirmText="知道了"
        type="default"
        onConfirm={() => setDeleteError(null)}
        onCancel={() => setDeleteError(null)}
      />
    </div>
  );
};