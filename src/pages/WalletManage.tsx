import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, Settings, Pencil, BarChart3, ArrowRightLeft, Trash2, Eraser, X } from 'lucide-react';
import { useWalletStore } from '../store/useWalletStore';
import { useBillStore } from '../store/useBillStore';
import { useToastStore } from '../store/useToastStore';

const presetColors = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

export default function WalletManage() {
  const navigate = useNavigate();
  const { wallets, currentWalletId, setCurrentWallet, addWallet, deleteWallet, updateWallet } = useWalletStore();
  const { clearBillsByWalletId } = useBillStore();
  const { showToast } = useToastStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingSheet, setShowSettingSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(presetColors[0]);

  const activeWallet = activeWalletId ? wallets.find(w => w.id === activeWalletId) : null;

  const openAddModal = () => {
    setNewName('');
    setNewDescription('');
    setSelectedColor(presetColors[0]);
    setShowAddModal(true);
  };

  const handleAddWallet = () => {
    if (!newName.trim()) {
      showToast('请输入账本名称', 'warning');
      return;
    }
    addWallet(newName.trim(), newDescription.trim(), selectedColor);
    showToast(`已添加账本"${newName.trim()}"`, 'success');
    setShowAddModal(false);
  };

  const openEditModal = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;
    setActiveWalletId(walletId);
    setNewName(wallet.name);
    setNewDescription(wallet.description);
    setSelectedColor(wallet.color);
    setShowEditModal(true);
    setShowSettingSheet(false);
  };

  const handleEditWallet = () => {
    if (!activeWalletId || !newName.trim()) {
      showToast('请输入账本名称', 'warning');
      return;
    }
    updateWallet(activeWalletId, {
      name: newName.trim(),
      description: newDescription.trim(),
      color: selectedColor,
    });
    showToast('账本信息已更新', 'success');
    setShowEditModal(false);
    setActiveWalletId(null);
  };

  const handleSelectWallet = (id: string) => {
    if (id === currentWalletId) {
      navigate('/');
      return;
    }
    setCurrentWallet(id);
    navigate('/');
  };

  const openSettingSheet = (e: React.MouseEvent, walletId: string) => {
    e.stopPropagation();
    setActiveWalletId(walletId);
    setShowSettingSheet(true);
  };

  const handleClearBills = () => {
    if (!activeWalletId) return;
    clearBillsByWalletId(activeWalletId);
    showToast('账单已清除', 'success');
    setShowClearConfirm(false);
    setShowSettingSheet(false);
    setActiveWalletId(null);
  };

  const handleDeleteWallet = () => {
    if (!activeWalletId) return;
    if (wallets.length <= 1) {
      showToast('至少保留一个账本', 'warning');
      return;
    }
    const wallet = wallets.find(w => w.id === activeWalletId);
    if (wallet) {
      deleteWallet(activeWalletId);
      showToast(`已删除账本"${wallet.name}"`, 'success');
    }
    setShowDeleteConfirm(false);
    setShowSettingSheet(false);
    setActiveWalletId(null);
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
              onClick={openAddModal}
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {wallet.name}
                    </h3>
                    {wallet.isDefault && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-white/20 text-white rounded-full shrink-0">
                        默认
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/80 mt-1 truncate">
                    {wallet.description || '暂无描述'}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 ml-3 shrink-0">
                  {wallet.id === currentWalletId && (
                    <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <button
                    onClick={(e) => openSettingSheet(e, wallet.id)}
                    className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
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

      {/* 添加账本弹窗 */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-modal shadow-modal overflow-hidden animate-scale-in transition-colors duration-300">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">添加账本</h2>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">账本名称</label>
                <input
                  type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="请输入账本名称"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">账本描述</label>
                <input
                  type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="请输入账本描述（可选）"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">主题颜色</label>
                <div className="flex flex-wrap gap-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && <Check className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">取消</button>
              <button onClick={handleAddWallet} className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">添加</button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑账本弹窗 */}
      {showEditModal && activeWallet && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-modal shadow-modal overflow-hidden animate-scale-in transition-colors duration-300">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">修改账本</h2>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">账本名称</label>
                <input
                  type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="请输入账本名称"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">账本描述</label>
                <input
                  type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="请输入账本描述（可选）"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-input text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">主题颜色</label>
                <div className="flex flex-wrap gap-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && <Check className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">取消</button>
              <button onClick={handleEditWallet} className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 底部设置弹层 */}
      {showSettingSheet && activeWallet && (
        <div
          className="fixed inset-0 z-[60] flex flex-col justify-end animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettingSheet(false); }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full bg-white dark:bg-gray-800 rounded-t-2xl animate-slide-up transition-colors duration-300">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{activeWallet.name}</h3>
              <button
                onClick={() => setShowSettingSheet(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 py-2">
              <button
                onClick={() => openEditModal(activeWallet.id)}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Pencil className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-base text-gray-800 dark:text-gray-100">修改</span>
              </button>
              <button
                disabled
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-lg opacity-40 cursor-not-allowed"
              >
                <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-base text-gray-800 dark:text-gray-100">报表统计</span>
              </button>
              <button
                disabled
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-lg opacity-40 cursor-not-allowed"
              >
                <ArrowRightLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-base text-gray-800 dark:text-gray-100">迁移账本</span>
              </button>
              <button
                onClick={() => { setShowClearConfirm(true); setShowSettingSheet(false); }}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Eraser className="w-5 h-5 text-orange-500" />
                <span className="text-base text-gray-800 dark:text-gray-100">清除账单</span>
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(true); setShowSettingSheet(false); }}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-base text-red-600 dark:text-red-400">删除账本</span>
              </button>
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* 清除账单二次确认 */}
      {showClearConfirm && activeWallet && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowClearConfirm(false); }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-modal shadow-modal overflow-hidden animate-scale-in transition-colors duration-300">
            <div className="px-4 py-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Eraser className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">清除账单</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                确定要清除账本"{activeWallet.name}"的所有账单吗？此操作不可恢复。
              </p>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">取消</button>
              <button onClick={handleClearBills} className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">清除</button>
            </div>
          </div>
        </div>
      )}

      {/* 删除账本二次确认 */}
      {showDeleteConfirm && activeWallet && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-modal shadow-modal overflow-hidden animate-scale-in transition-colors duration-300">
            <div className="px-4 py-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">删除账本</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                确定要删除账本"{activeWallet.name}"吗？账单数据也将一并删除，此操作不可恢复。
              </p>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">取消</button>
              <button onClick={handleDeleteWallet} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
