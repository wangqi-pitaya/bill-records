import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MinusCircle, Moon, Sun } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useCategoryStore } from '../store/useCategoryStore';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { ConfirmModal } from '../components/ConfirmModal';
import { availableIcons } from '../data/categories';
import { Category, BillType } from '../types';

export default function CategoryManage() {
  const navigate = useNavigate();
  const { getCategoriesByType, addCategory, deleteCategory, reorderCategories, isCategoryUsed } = useCategoryStore();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<BillType>('expense');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Circle');
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchDragging, setTouchDragging] = useState(false);
  
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef<HTMLDivElement | null>(null);
  
  const categories = getCategoriesByType(activeTab);

  const handleAdd = () => {
    if (!newName.trim()) return;
    
    addCategory({
      name: newName.trim(),
      icon: newIcon,
      type: activeTab,
    });
    
    setNewName('');
    setNewIcon('Circle');
    setShowAddModal(false);
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
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    
    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);
    
    reorderCategories(activeTab, newCategories);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null || !touchStartPos.current) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    setTouchDragging(true);
    
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const categoryItem = elementBelow?.closest('[data-category-index]') as HTMLElement | null;
    
    if (categoryItem) {
      const overIndex = parseInt(categoryItem.dataset.categoryIndex || '-1');
      if (overIndex >= 0 && overIndex !== dragOverIndex) {
        setDragOverIndex(overIndex);
      }
    }
  };

  const handleTouchEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newCategories = [...categories];
      const draggedItem = newCategories[draggedIndex];
      newCategories.splice(draggedIndex, 1);
      newCategories.splice(dragOverIndex, 0, draggedItem);
      reorderCategories(activeTab, newCategories);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTouchDragging(false);
    touchStartPos.current = null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 px-4 shadow-sm h-12 flex items-center transition-colors duration-300">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="tab-container">
            <button
              onClick={() => setActiveTab('expense')}
              className={`tab-item ${activeTab === 'expense' ? 'tab-item-active-expense' : ''}`}
            >
              支出
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`tab-item ${activeTab === 'income' ? 'tab-item-active-income' : ''}`}
            >
              收入
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">长按分类卡片可拖拽排序</p>
        <div className="grid grid-cols-5 gap-2">
            {categories.map((category, index) => {
              const IconComponent = (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[category.icon] || Icons.Circle;
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index && draggedIndex !== index;
              
              return (
                <div
                  key={category.id}
                  data-category-index={index}
                  ref={isDragging ? draggedRef : null}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`relative cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
                    isDragging ? 'opacity-40 scale-95' : ''
                  } ${isDragOver ? 'scale-105' : ''} ${touchDragging && isDragging ? 'z-10' : ''}`}
                >
                  <button
                    className={`w-full flex flex-col items-center justify-center gap-1 p-0.5 rounded-md aspect-square transition-all duration-200 ${
                      isDragOver
                        ? activeTab === 'income'
                          ? 'bg-income-100 dark:bg-income-900/30 ring-2 ring-income-400'
                          : 'bg-expense-100 dark:bg-expense-900/30 ring-2 ring-expense-400'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-xs font-medium whitespace-nowrap truncate max-w-full">{category.name}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(category)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-expense-100 dark:hover:bg-expense-900/30 transition-colors z-20"
                  >
                    <MinusCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-expense-500 dark:hover:text-expense-400" />
                  </button>
                </div>
              );
            })}
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center justify-center gap-1 p-0.5 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-medium whitespace-nowrap">添加</span>
            </button>
          </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-modal shadow-modal w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">添加新分类</h3>
              
              <div className="mb-4">
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">分类名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="输入分类名称"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 dark:text-gray-200"
                />
              </div>
              
              <div className="mb-4">
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">选择图标</label>
                <div className="grid grid-cols-8 gap-2">
                  {availableIcons.map((icon) => {
                    const IconComponent = (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[icon] || Icons.Circle;
                    return (
                      <button
                        key={icon}
                        onClick={() => setNewIcon(icon)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          newIcon === icon
                            ? activeTab === 'income'
                              ? 'bg-income-500 text-white'
                              : 'bg-expense-500 text-white'
                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-r border-gray-100 dark:border-gray-700"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className={`flex-1 py-4 font-medium transition-colors ${
                  newName.trim()
                    ? activeTab === 'income'
                      ? 'text-income-500 hover:bg-income-50 dark:hover:bg-income-900/20'
                      : 'text-expense-500 hover:bg-expense-50 dark:hover:bg-expense-900/20'
                    : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

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
        onConfirm={() => setDeleteError(null)}
        onCancel={() => setDeleteError(null)}
      />
    </div>
  );
}
