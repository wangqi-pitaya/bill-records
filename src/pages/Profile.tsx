import { useState, useMemo, useCallback } from 'react';
import {
  User,
  Download,
  Upload,
  Trash2,
  ChevronRight,
  Pencil,
  Check,
  X,
  Moon,
  Sun,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBillStore } from '../store/useBillStore';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { Modal } from '../components/Modal';

export default function Profile() {
  const navigate = useNavigate();
  const { bills } = useBillStore();
  const { theme, toggleTheme, isDark } = useTheme();
  const toast = useToast();

  const [nickname, setNickname] = useState(() => localStorage.getItem('profile_nickname') || '记账达人');
  const [editNickname, setEditNickname] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 统计数据
  const stats = useMemo(() => {
    // 使用天数：从第一条账单的时间戳算起
    let useDays = 1;
    if (bills.length > 0) {
      const oldestTimestamp = Math.min(...bills.map(b => b.timestamp || Date.now()));
      const daysDiff = Math.floor((Date.now() - oldestTimestamp) / (1000 * 60 * 60 * 24));
      useDays = Math.max(1, daysDiff + 1);
    }

    // 记账天数：有账单的不同日期数量
    const uniqueDates = new Set(bills.map(b => b.date)).size;

    // 记账笔数
    const totalBills = bills.length;

    return { useDays, uniqueDates, totalBills };
  }, [bills]);

  // 保存昵称
  const handleSaveNickname = useCallback(() => {
    const trimmed = editNickname.trim();
    if (!trimmed) {
      toast.warning('昵称不能为空');
      return;
    }
    setNickname(trimmed);
    localStorage.setItem('profile_nickname', trimmed);
    setShowEditModal(false);
    toast.success('昵称已更新');
  }, [editNickname, toast]);

  const startEditNickname = useCallback(() => {
    setEditNickname(nickname);
    setShowEditModal(true);
  }, [nickname]);

  // 导出账单
  const handleExport = useCallback(() => {
    const data = {
      bills,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill_records_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('账单已导出');
  }, [bills, toast]);

  // 导入账单
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.bills && Array.isArray(data.bills)) {
            // 简单合并，不去重
            const { bills: existingBills } = useBillStore.getState();
            const mergedBills = [...existingBills, ...data.bills];
            useBillStore.setState({ bills: mergedBills });
            toast.success(`成功导入 ${data.bills.length} 条账单`);
          } else {
            toast.error('文件格式不正确');
          }
        } catch {
          toast.error('文件解析失败');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [toast]);

  // 清除数据
  const handleClearData = useCallback(() => {
    localStorage.removeItem('bill_records');
    localStorage.removeItem('categories');
    localStorage.removeItem('wallet-storage');
    localStorage.removeItem('profile_nickname');
    useBillStore.setState({ bills: [] });
    toast.success('所有数据已清除，刷新页面后生效');
    setShowClearConfirm(false);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-20">
      {/* 标题栏 */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 px-4 shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 flex items-center justify-center">
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">我的</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-16 pb-4 space-y-4">
        {/* 第一部分：用户信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-5 transition-colors duration-300">
          <div className="flex items-center gap-4">
            {/* 头像 */}
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-primary-500" />
            </div>

            {/* 昵称 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {nickname}
                </span>
                <button
                  onClick={startEditNickname}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 text-center transition-colors duration-300">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.useDays}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">使用天数</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 text-center transition-colors duration-300">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.uniqueDates}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">记账天数</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-card shadow-card p-4 text-center transition-colors duration-300">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalBills}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">记账笔数</div>
          </div>
        </div>

        {/* 搜索账单 */}
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-card overflow-hidden transition-colors duration-300">
          <button
            onClick={() => navigate('/search', { state: { isSecondary: true } })}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors duration-300"
          >
            <Search className="w-5 h-5 text-primary-500 shrink-0" />
            <span className="flex-1 text-left text-base text-gray-800 dark:text-gray-100">搜索账单</span>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>

          {/* 回收站 */}
          <button
            onClick={() => navigate('/trash', { state: { isSecondary: true } })}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-gray-50 dark:border-gray-700 transition-colors duration-300"
          >
            <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
            <span className="flex-1 text-left text-base text-gray-800 dark:text-gray-100">回收站</span>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        </div>

        {/* 第二部分：相关设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-card overflow-hidden transition-colors duration-300">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">相关设置</h2>
          </div>

          {/* 导出账单 */}
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3.5"
          >
            <Download className="w-5 h-5 text-primary-500 shrink-0" />
            <span className="flex-1 text-left text-base text-gray-800 dark:text-gray-100">导出账单</span>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>

          {/* 导入账单 */}
          <button
            onClick={handleImport}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-gray-50 dark:border-gray-750"
          >
            <Upload className="w-5 h-5 text-primary-500 shrink-0" />
            <span className="flex-1 text-left text-base text-gray-800 dark:text-gray-100">导入账单</span>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>

          {/* 夜间模式 */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-gray-50 dark:border-gray-750"
          >
            {isDark ? <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300 shrink-0" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 shrink-0" />}
            <span className="flex-1 text-left text-base text-gray-800 dark:text-gray-100">夜间模式</span>
            <div
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                isDark ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                  isDark ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </div>
          </button>

          {/* 清除数据 */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-gray-50 dark:border-gray-750"
          >
            <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
            <span className="flex-1 text-left text-base text-red-600 dark:text-red-400">清除数据</span>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        </div>

      </main>

      {/* 编辑昵称弹窗 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑昵称"
        showFooter
        confirmText="保存"
        confirmDisabled={!editNickname.trim()}
        onConfirm={handleSaveNickname}
      >
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1.5 block">昵称</label>
          <input
            type="text"
            value={editNickname}
            onChange={(e) => setEditNickname(e.target.value)}
            placeholder="输入昵称"
            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            maxLength={20}
            autoFocus
          />
        </div>
      </Modal>

      {/* 清除数据确认弹窗 */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="清除数据"
        showFooter
        confirmText="清除"
        confirmVariant="danger"
        onConfirm={handleClearData}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-2">
          确定要清除所有数据吗？包括账单、分类、账本等所有记录，此操作不可恢复。
        </p>
      </Modal>
    </div>
  );
}
