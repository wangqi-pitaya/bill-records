import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useWalletStore } from '../../store/useWalletStore';
import { useBillStore } from '../../store/useBillStore';
import { useToast } from '../../hooks/useToast';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/Modal';
import { Wallet } from '../../types';

const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function WalletManage() {
  const { wallets, currentWalletId, setCurrentWallet, addWallet, updateWallet, deleteWallet } = useWalletStore();
  const { getStatistics, clearBillsByWalletId, migrateBills } = useBillStore();
  const toast = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMigrate, setShowMigrate] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [migrateTargetId, setMigrateTargetId] = useState('');

  const openAdd = () => {
    setName('');
    setDescription('');
    setSelectedColor(colors[0]);
    setShowAdd(true);
  };

  const openEdit = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setName(wallet.name);
    setDescription(wallet.description);
    setSelectedColor(wallet.color);
    setShowEdit(true);
  };

  const openSettings = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setShowSettings(true);
  };

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error('请输入账本名称');
      return;
    }
    addWallet(name.trim(), description.trim(), selectedColor);
    setShowAdd(false);
    toast.success('账本已添加');
  };

  const handleUpdate = () => {
    if (!selectedWallet || !name.trim()) {
      toast.error('请输入账本名称');
      return;
    }
    updateWallet(selectedWallet.id, {
      name: name.trim(),
      description: description.trim(),
      color: selectedColor,
    });
    setShowEdit(false);
    toast.success('账本已更新');
  };

  const handleDelete = () => {
    if (!selectedWallet) return;
    if (selectedWallet.isDefault) {
      toast.error('默认账本不能删除');
      setShowDeleteConfirm(false);
      return;
    }
    deleteWallet(selectedWallet.id);
    setShowDeleteConfirm(false);
    setShowSettings(false);
    toast.success('账本已删除');
  };

  const handleClear = () => {
    if (!selectedWallet) return;
    clearBillsByWalletId(selectedWallet.id);
    setShowClearConfirm(false);
    setShowSettings(false);
    toast.success('账单已清除');
  };

  const handleMigrate = () => {
    if (!selectedWallet || !migrateTargetId) return;
    migrateBills(selectedWallet.id, migrateTargetId);
    setShowMigrate(false);
    setShowSettings(false);
    toast.success('账单已迁移');
  };

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ScrollView scrollY className="pb-4">
        <View className="px-4 py-4 space-y-3">
          {wallets.map((wallet) => {
            const stats = getStatistics(wallet.id);
            return (
              <View
                key={wallet.id}
                className="rounded-card shadow-card overflow-hidden"
                style={{ backgroundColor: wallet.color }}
              >
                <View className="p-4">
                  <View className="flex items-center justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <Text className="text-lg font-bold text-white">{wallet.name}</Text>
                      {wallet.isDefault && (
                        <View className="px-2 py-0.5 rounded-full bg-white/20">
                          <Text className="text-xs text-white">默认</Text>
                        </View>
                      )}
                    </View>
                    <View
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30"
                      onClick={() => openSettings(wallet)}
                    >
                      <Icon name="Settings" size={16} color="#fff" />
                    </View>
                  </View>
                  <Text className="text-sm text-white/80 mb-3">{wallet.description}</Text>
                  <View className="flex justify-between items-end">
                    <View className="flex gap-4">
                      <View>
                        <Text className="text-xs text-white/70">收入</Text>
                        <Text className="text-sm font-semibold text-white">+{stats.income.toFixed(2)}</Text>
                      </View>
                      <View>
                        <Text className="text-xs text-white/70">支出</Text>
                        <Text className="text-sm font-semibold text-white">-{stats.expense.toFixed(2)}</Text>
                      </View>
                    </View>
                    {currentWalletId === wallet.id ? (
                      <View className="px-3 py-1 rounded-full bg-white/20">
                        <Text className="text-xs text-white font-medium">当前使用</Text>
                      </View>
                    ) : (
                      <View
                        className="px-3 py-1 rounded-full bg-white/20 active:bg-white/30"
                        onClick={() => {
                          setCurrentWallet(wallet.id);
                          toast.success('已切换');
                        }}
                      >
                        <Text className="text-xs text-white font-medium">切换</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          <View
            className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 flex items-center justify-center gap-2 active:bg-gray-50 dark:active:bg-gray-700"
            onClick={openAdd}
          >
            <Icon name="Plus" size={20} className="text-blue-500" />
            <Text className="text-sm font-medium text-blue-500">添加账本</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAdd || showEdit}
        onClose={() => { setShowAdd(false); setShowEdit(false); }}
        title={showEdit ? '编辑账本' : '添加账本'}
        showFooter
        confirmText={showEdit ? '保存' : '添加'}
        onConfirm={showEdit ? handleUpdate : handleAdd}
      >
        <View className="space-y-4 py-2">
          <View>
            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">名称</Text>
            <input
              type="text"
              value={name}
              onInput={(e) => setName((e.target as any).value)}
              placeholder="账本名称"
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </View>
          <View>
            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">描述</Text>
            <input
              type="text"
              value={description}
              onInput={(e) => setDescription((e.target as any).value)}
              placeholder="账本描述"
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </View>
          <View>
            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">颜色</Text>
            <View className="flex gap-2">
              {colors.map((color) => (
                <View
                  key={color}
                  className={`w-8 h-8 rounded-full ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="账本设置"
      >
        <View className="space-y-2 py-2">
          <View
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600"
            onClick={() => {
              setShowSettings(false);
              if (selectedWallet) openEdit(selectedWallet);
            }}
          >
            <Icon name="Pencil" size={16} className="text-blue-500" />
            <Text className="text-sm text-gray-700 dark:text-gray-300">修改账本</Text>
          </View>
          <View
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600"
            onClick={() => {
              setShowSettings(false);
              Taro.navigateTo({ url: '/pages/statistics/index' });
            }}
          >
            <Icon name="BarChart3" size={16} className="text-blue-500" />
            <Text className="text-sm text-gray-700 dark:text-gray-300">报表统计</Text>
          </View>
          <View
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600"
            onClick={() => { setShowSettings(false); setShowMigrate(true); }}
          >
            <Icon name="ArrowRightLeft" size={16} className="text-blue-500" />
            <Text className="text-sm text-gray-700 dark:text-gray-300">迁移账本</Text>
          </View>
          <View
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600"
            onClick={() => { setShowSettings(false); setShowClearConfirm(true); }}
          >
            <Icon name="Eraser" size={16} className="text-amber-500" />
            <Text className="text-sm text-gray-700 dark:text-gray-300">清除账单</Text>
          </View>
          <View
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600"
            onClick={() => { setShowSettings(false); setShowDeleteConfirm(true); }}
          >
            <Icon name="Trash2" size={16} className="text-red-500" />
            <Text className="text-sm text-red-500">删除账本</Text>
          </View>
        </View>
      </Modal>

      {/* Migrate Modal */}
      <Modal
        isOpen={showMigrate}
        onClose={() => setShowMigrate(false)}
        title="迁移账本"
        showFooter
        confirmText="迁移"
        onConfirm={handleMigrate}
      >
        <View className="py-2">
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3 block">
            将「{selectedWallet?.name}」的账单迁移到：
          </Text>
          <View className="space-y-2">
            {wallets
              .filter((w) => w.id !== selectedWallet?.id)
              .map((w) => (
                <View
                  key={w.id}
                  className={`p-3 rounded-lg border ${
                    migrateTargetId === w.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                  }`}
                  onClick={() => setMigrateTargetId(w.id)}
                >
                  <Text className="text-sm text-gray-800 dark:text-gray-100">{w.name}</Text>
                </View>
              ))}
          </View>
        </View>
      </Modal>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="清除账单"
        showFooter
        confirmText="清除"
        confirmVariant="warning"
        onConfirm={handleClear}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 py-2 block">
          确定要清除「{selectedWallet?.name}」的所有账单吗？
        </Text>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="删除账本"
        showFooter
        confirmText="删除"
        confirmVariant="danger"
        onConfirm={handleDelete}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 py-2 block">
          确定要删除账本「{selectedWallet?.name}」吗？
        </Text>
      </Modal>
    </View>
  );
}
