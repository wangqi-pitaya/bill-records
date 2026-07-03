import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Check } from 'lucide-react';
import { useWalletStore } from '../store/useWalletStore';
import { useToastStore } from '../store/useToastStore';

const presetColors = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

export default function WalletManage() {
  const navigate = useNavigate();
  const { wallets, currentWalletId, setCurrentWallet, addWallet, deleteWallet } = useWalletStore();
  const { showToast } = useToastStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(presetColors[0]);

  const handleAddWallet = () => {
    if (!newName.trim()) {
      showToast('请输入账本名称', 'warning');
      return;
    }
    addWallet(newName.trim(), newDescription.trim(), selectedColor);
    showToast(`已添加账本"${newName.trim()}"`, 'success');
    setNewName('');
    setNewDescription('');
    setSelectedColor(presetColors[0]);
    setShowAddModal(false);
  };

  const handleSelectWallet = (id: string) => {
    if (id === currentWalletId) {
      navigate('/');
      return;
    }
    setCurrentWallet(id);
    navigate('/');
  };

  const handleDeleteWallet = (id: string) => {
    if (wallets.length <= 1) {
      showToast('至少保留一个账本', 'warning');
      return;
    }
    const wallet = wallets.find(w => w.id === id);
    if (wallet) {
      deleteWallet(id);
      showToast(`已删除账本"${wallet.name}"`, 'success');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 px-4 shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">我的账本</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-16 pb-4">
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="rounded-card shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover cursor-pointer"
              style={{ backgroundColor: wallet.color }}
              onClick={() => handleSelectWallet(wallet.id)}
            >
              <div className="px-4 py-5 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {wallet.name}
                    </h3>
                    {wallet.isDefault && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-white/20 text-white rounded-full">
                        默认
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/80 mt-1">
                    {wallet.description || '暂无描述'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {wallet.id === currentWalletId && (
                    <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {!wallet.isDefault && wallets.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWallet(wallet.id);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {wallets.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>暂无账本</p>
            <p className="text-sm mt-2">点击右上角添加第一个账本</p>
          </div>
        )}
      </main>

      {showAddModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-modal shadow-modal overflow-hidden animate-scale-in transition-colors duration-300">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">添加账本</h2>
            </div>

            <div className="px-4 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  账本名称
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="请输入账本名称"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  账本描述
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="请输入账本描述（可选）"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  主题颜色
                </label>
                <div className="flex flex-wrap gap-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
                        selectedColor === color
                          ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <Check className="w-5 h-5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-3 transition-colors duration-300">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddWallet}
                className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}