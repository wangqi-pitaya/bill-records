import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MinusCircle, GripVertical } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useCategoryStore } from '../store/useCategoryStore';
import { ConfirmModal } from '../components/ConfirmModal';
import { availableIcons } from '../data/categories';
import { Category, BillType } from '../types';

export default function CategoryManage() {
  const navigate = useNavigate();
  const { getCategoriesByType, addCategory, deleteCategory, reorderCategories, isCategoryUsed } = useCategoryStore();
  
  const [activeTab, setActiveTab] = useState<BillType>('expense');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Circle');
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
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
    
    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);
    
    reorderCategories(activeTab, newCategories);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-base font-bold text-gray-800">管理分类</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'expense'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              支出
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'income'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              收入
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {categories.map((category, index) => {
              const IconComponent = (Icons as Record<string, React.FC<{ className?: string }>>)[category.icon] || Icons.Circle;
              
              return (
                <div
                  key={category.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative cursor-grab ${draggedIndex === index ? 'opacity-50' : ''}`}
                >
                  <button
                    className="w-full flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-sm font-medium whitespace-nowrap truncate max-w-full">{category.name}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(category)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <MinusCircle className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all duration-200"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium whitespace-nowrap">添加</span>
            </button>
          </div>
        </div>
      </main>

      {/* 添加分类弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">添加新分类</h3>
              
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-1 block">分类名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="输入分类名称"
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">选择图标</label>
                <div className="grid grid-cols-8 gap-2">
                  {availableIcons.map((icon) => {
                    const IconComponent = (Icons as Record<string, React.FC<{ className?: string }>>)[icon] || Icons.Circle;
                    return (
                      <button
                        key={icon}
                        onClick={() => setNewIcon(icon)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          newIcon === icon
                            ? activeTab === 'income'
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 text-gray-600 font-medium hover:bg-gray-50 transition-colors border-r border-gray-100"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className={`flex-1 py-4 font-medium transition-colors ${
                  newName.trim()
                    ? activeTab === 'income'
                      ? 'text-green-500 hover:bg-green-50'
                      : 'text-red-500 hover:bg-red-50'
                    : 'text-gray-400 cursor-not-allowed'
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