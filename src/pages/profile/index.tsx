import { useState } from 'react';
import { View, Text, ScrollView, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useBillStore } from '../../store/useBillStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/Modal';
import { formatDate } from '../../lib/utils';

export default function Profile() {
  const { bills } = useBillStore();
  const { wallets } = useWalletStore();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const [nickname, setNickname] = useState('用户');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [tempNickname, setTempNickname] = useState('');

  const activeBills = bills.filter((b) => !b.deleted);
  const allBillDates = [...new Set(activeBills.map((b) => b.date))].sort();
  const totalDays = allBillDates.length;

  const firstBillDate = allBillDates[0];
  const now = new Date();
  const startDate = firstBillDate ? new Date(firstBillDate) : now;
  const usageDays = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const exportData = () => {
    const data = {
      bills,
      wallets,
      exportDate: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    setShowExportModal(false);
    toast.success('数据已导出');
    // In real app, use Taro.downloadFile or share
  };

  const importData = () => {
    try {
      if (!importJson.trim()) {
        toast.error('请输入数据');
        return;
      }
      const data = JSON.parse(importJson);
      if (data.bills && Array.isArray(data.bills)) {
        // In real app, merge data
        setShowImportModal(false);
        setImportJson('');
        toast.success('数据导入成功');
      } else {
        toast.error('数据格式错误');
      }
    } catch {
      toast.error('JSON格式错误');
    }
  };

  const handleClear = () => {
    // In real app, clear all data
    setShowClearConfirm(false);
    toast.success('数据已清除');
  };

  const menuItems = [
    {
      icon: 'Search',
      label: '搜索账单',
      onClick: () => Taro.navigateTo({ url: '/pages/search/index' }),
    },
    {
      icon: 'Wallet',
      label: '钱包管理',
      onClick: () => Taro.navigateTo({ url: '/pages/wallet-manage/index' }),
    },
    {
      icon: 'BookOpen',
      label: '分类管理',
      onClick: () => Taro.navigateTo({ url: '/pages/category-manage/index' }),
    },
    {
      icon: 'Trash2',
      label: '回收站',
      onClick: () => Taro.navigateTo({ url: '/pages/trash/index' }),
    },
    {
      icon: 'Download',
      label: '导出账单',
      onClick: () => setShowExportModal(true),
    },
    {
      icon: 'Upload',
      label: '导入账单',
      onClick: () => setShowImportModal(true),
    },
    {
      icon: 'Moon',
      label: '夜间模式',
      right: (
        <Switch
          checked={isDark}
          onChange={toggleTheme}
          color="#3b82f6"
        />
      ),
    },
    {
      icon: 'Eraser',
      label: '清除数据',
      danger: true,
      onClick: () => setShowClearConfirm(true),
    },
  ];

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      <View className="bg-white dark:bg-gray-800 px-4 pt-12 pb-6">
        <View className="flex items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
            <Text className="text-2xl font-bold text-white">{nickname[0]}</Text>
          </View>
          <View className="flex-1">
            <View className="flex items-center gap-2">
              <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">{nickname}</Text>
              <View onClick={() => { setTempNickname(nickname); setShowNicknameModal(true); }}>
                <Icon name="Pencil" size={14} className="text-gray-400" />
              </View>
            </View>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">记账本用户</Text>
          </View>
        </View>
      </View>

      <View className="px-4 py-4">
        <View className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 flex justify-around">
          <View className="text-center">
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">{usageDays}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">使用天数</Text>
          </View>
          <View className="text-center">
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">{totalDays}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">记账天数</Text>
          </View>
          <View className="text-center">
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">{activeBills.length}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">记账笔数</Text>
          </View>
        </View>
      </View>

      <View className="px-4 space-y-2">
        {menuItems.map((item, idx) => (
          <View
            key={item.label}
            className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-700"
            onClick={item.onClick}
          >
            <View className="flex items-center gap-3">
              <View className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.danger ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                <Icon name={item.icon} size={16} className={item.danger ? 'text-red-500' : 'text-blue-500'} />
              </View>
              <Text className={`text-sm font-medium ${item.danger ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{item.label}</Text>
            </View>
            {item.right || <Icon name="ChevronDown" size={16} className="text-gray-400 rotate-[-90deg]" />}
          </View>
        ))}
      </View>

      <Modal
        isOpen={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        title="修改昵称"
        showFooter
        confirmText="保存"
        onConfirm={() => {
          if (tempNickname.trim()) {
            setNickname(tempNickname.trim());
            setShowNicknameModal(false);
            toast.success('昵称已更新');
          }
        }}
      >
        <input
          type="text"
          value={tempNickname}
          onInput={(e) => setTempNickname((e.target as any).value)}
          placeholder="输入昵称"
          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Modal>

      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="导出账单"
        showFooter
        confirmText="导出"
        onConfirm={exportData}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 py-2 block">确定要导出所有账单数据吗？</Text>
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="导入账单"
        showFooter
        confirmText="导入"
        onConfirm={importData}
      >
        <textarea
          value={importJson}
          onInput={(e) => setImportJson((e.target as any).value)}
          placeholder="在此粘贴JSON格式的账单数据"
          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-[200rpx]"
        />
      </Modal>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="清除数据"
        showFooter
        confirmText="清除"
        confirmVariant="danger"
        onConfirm={handleClear}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 py-2 block">确定要清除所有数据吗？此操作不可恢复！</Text>
      </Modal>
    </View>
  );
}
