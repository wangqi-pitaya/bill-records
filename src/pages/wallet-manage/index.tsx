import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useWalletStore } from '../../store/useWalletStore';
import { useBillStore } from '../../store/useBillStore';
import { PageHeader } from '../../components/PageHeader';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/Modal';
import { Drawer } from '../../components/Drawer';
import { Wallet } from '../../types';

const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function WalletManage() {
  const { wallets, currentWalletId, setCurrentWallet, addWallet, updateWallet, deleteWallet } = useWalletStore();
  const { clearBillsByWalletId, migrateBills } = useBillStore();

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
    if (!name.trim()) return;
    addWallet(name.trim(), description.trim(), selectedColor);
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!selectedWallet || !name.trim()) return;
    updateWallet(selectedWallet.id, {
      name: name.trim(),
      description: description.trim(),
      color: selectedColor,
    });
    setShowEdit(false);
  };

  const handleDelete = () => {
    if (!selectedWallet) return;
    deleteWallet(selectedWallet.id);
    setShowDeleteConfirm(false);
    setShowSettings(false);
  };

  const handleClear = () => {
    if (!selectedWallet) return;
    clearBillsByWalletId(selectedWallet.id);
    setShowClearConfirm(false);
    setShowSettings(false);
  };

  const handleMigrate = () => {
    if (!selectedWallet || !migrateTargetId) return;
    migrateBills(selectedWallet.id, migrateTargetId);
    setShowMigrate(false);
    setShowSettings(false);
  };

  const handleSwitchWallet = (wallet: Wallet) => {
    if (currentWalletId !== wallet.id) {
      setCurrentWallet(wallet.id);
    }
  };

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PageHeader title="账本管理" rightIcon="Plus" onRightClick={openAdd} />
      <ScrollView scrollY className="flex-1 pb-4">
        <View className="px-4 py-4 space-y-3">
          {wallets.map((wallet) => (
            <View
              key={wallet.id}
              className="rounded-card shadow-card overflow-hidden bg-white dark:bg-gray-800 border-2 transition-all"
              style={{ borderColor: currentWalletId === wallet.id ? wallet.color : 'transparent' }}
              onClick={() => handleSwitchWallet(wallet)}
            >
              <View className="p-4 h-24 relative">
                <View className="flex items-center gap-2">
                  <View className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${wallet.color}20` }}>
                    <Icon name="Wallet" size={20} style={{ color: wallet.color }} />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">{wallet.name}</Text>
                    {wallet.isDefault && (
                      <View className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 inline-flex mt-1">
                        <Text className="text-xs text-gray-500 dark:text-gray-400">默认</Text>
                      </View>
                    )}
                  </View>
                </View>
                {wallet.description && (
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">{wallet.description}</Text>
                )}

                <View className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center">
                  {currentWalletId === wallet.id && (
                    <View className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: wallet.color }}>
                      <Icon name="Check" size={14} color="#fff" />
                    </View>
                  )}
                </View>

                <View className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center">
                  <View
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${currentWalletId === wallet.id ? '' : 'opacity-0'}`}
                    onClick={(e) => {
                      e.stopPropagation?.();
                      openSettings(wallet);
                    }}
                  >
                    <Icon name="MoreHorizontal" size={16} className="text-gray-500 dark:text-gray-400" />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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

      <Drawer
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        direction="bottom"
        title={`${selectedWallet?.name}设置`}
      >
        <View className="px-4 py-2 space-y-2">
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
            <Text className="text-sm text-gray-700 dark:text-gray-300">迁移账单</Text>
          </View>
          <View
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600"
            onClick={() => { setShowSettings(false); setShowClearConfirm(true); }}
          >
            <Icon name="Eraser" size={16} className="text-amber-500" />
            <Text className="text-sm text-gray-700 dark:text-gray-300">清除账单</Text>
          </View>
          {!selectedWallet?.isDefault && (
            <View
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600"
              onClick={() => { setShowSettings(false); setShowDeleteConfirm(true); }}
            >
              <Icon name="Trash2" size={16} className="text-red-500" />
              <Text className="text-sm text-red-500">删除账本</Text>
            </View>
          )}
        </View>
      </Drawer>

      <Modal
        isOpen={showMigrate}
        onClose={() => setShowMigrate(false)}
        title="迁移账单"
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