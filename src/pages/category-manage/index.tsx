import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { BillType, Category } from '../../types';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useThemeColor } from '../../hooks/useThemeColor';
import { PageHeader } from '../../components/PageHeader';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/Modal';
import { SegmentedControl } from '../../components/SegmentedControl';
import { availableIcons } from '../../data/categories';

export default function CategoryManage() {
  const [tab, setTab] = useState<BillType>('expense');
  const [showAdd, setShowAdd] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('MoreHorizontal');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { categories, addCategory, deleteCategory, isCategoryUsed, moveCategoryUp, moveCategoryDown } = useCategoryStore();
  const themeColor = useThemeColor();

  const filteredCategories = categories.filter((c) => c.type === tab);

  const handleAdd = () => {
    if (!newCategoryName.trim()) return;
    const exists = categories.some(
      (c) => c.type === tab && c.name === newCategoryName.trim()
    );
    if (exists) return;
    addCategory({
      name: newCategoryName.trim(),
      icon: selectedIcon,
      type: tab,
    });
    setNewCategoryName('');
    setSelectedIcon('MoreHorizontal');
    setShowAdd(false);
  };

  const handleDeleteRequest = (cat: Category) => {
    setDeleteTarget(cat);
    if (isCategoryUsed(cat.name)) return;
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteCategory(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const openAdd = () => {
    setNewCategoryName('');
    setSelectedIcon('MoreHorizontal');
    setShowAdd(true);
  };

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PageHeader title="分类管理" rightIcon="Plus" onRightClick={openAdd} />

      <View className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-center">
        <SegmentedControl
          options={[{ key: 'expense', label: '支出' }, { key: 'income', label: '收入' }]}
          value={tab}
          onChange={(k) => setTab(k as BillType)}
        />
      </View>

      <ScrollView scrollY className="flex-1 overflow-hidden">
        <View className="px-4 py-4">
          <View className="grid grid-cols-4 gap-3">
            {filteredCategories.map((cat, index) => (
              <View
                key={cat.id}
                className="bg-white dark:bg-gray-800 rounded-card shadow-card p-3 flex flex-col items-center gap-2 relative"
              >
                <View className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}20` }}>
                  <Icon name={cat.icon} size={20} style={{ color: themeColor }} />
                </View>
                <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full">
                  {cat.name}
                </Text>
                <View
                  className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500/10"
                  onClick={() => handleDeleteRequest(cat)}
                >
                  <Icon name="X" size={12} className="text-red-500" />
                </View>
                <View className="absolute bottom-1 left-1 right-1 flex justify-between">
                  <View
                    className={`w-5 h-5 flex items-center justify-center rounded-full ${
                      index === 0 ? 'bg-gray-100 dark:bg-gray-700 opacity-40' : 'bg-gray-100 dark:bg-gray-700 active:bg-gray-200'
                    }`}
                    onClick={() => index > 0 && moveCategoryUp(cat.id, tab)}
                  >
                    <View style={{ transform: 'rotate(90deg)' }}>
                      <Icon name="ChevronDown" size={12} className={index === 0 ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'} />
                    </View>
                  </View>
                  <View
                    className={`w-5 h-5 flex items-center justify-center rounded-full ${
                      index === filteredCategories.length - 1 ? 'bg-gray-100 dark:bg-gray-700 opacity-40' : 'bg-gray-100 dark:bg-gray-700 active:bg-gray-200'
                    }`}
                    onClick={() => index < filteredCategories.length - 1 && moveCategoryDown(cat.id, tab)}
                  >
                    <View style={{ transform: 'rotate(-90deg)' }}>
                      <Icon name="ChevronDown" size={12} className={index === filteredCategories.length - 1 ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'} />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="添加分类"
        confirmText="添加"
        onConfirm={handleAdd}
      >
        <View className="space-y-4 py-2">
          <View>
            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">分类名称</Text>
            <input
              type="text"
              value={newCategoryName}
              onInput={(e) => setNewCategoryName((e.target as any).value)}
              placeholder="输入分类名称"
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </View>
          <View>
            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">图标</Text>
            <ScrollView scrollY className="max-h-[300px]">
              <View className="grid grid-cols-6 gap-x-2 gap-y-3">
                {availableIcons.map((icon) => (
                  <View
                    key={icon}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedIcon === icon
                        ? 'text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                    style={selectedIcon === icon ? { backgroundColor: themeColor } : undefined}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    <Icon name={icon} size={18} color={selectedIcon === icon ? '#fff' : 'currentColor'} />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="删除分类"
        confirmText="删除"
        variant="danger"
        onConfirm={handleDelete}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 py-2 block">
          确定要删除分类「{deleteTarget?.name}」吗？
        </Text>
      </Modal>
    </View>
  );
}
