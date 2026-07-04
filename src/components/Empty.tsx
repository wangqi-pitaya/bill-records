import { cn } from '@/lib/utils';
import { FileText, Wallet, Search } from 'lucide-react';

interface EmptyProps {
  variant?: 'default' | 'bills' | 'search';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function Empty({
  variant = 'default',
  title,
  description,
  icon,
  action,
  className,
}: EmptyProps) {
  const defaultIcons = {
    default: <FileText className="w-16 h-16" />,
    bills: <Wallet className="w-16 h-16" />,
    search: <Search className="w-16 h-16" />,
  };

  const defaultTitles = {
    default: '暂无数据',
    bills: '暂无账单记录',
    search: '没有找到相关内容',
  };

  const defaultDescriptions = {
    default: '还没有任何内容',
    bills: '点击右下角按钮添加第一笔账单',
    search: '换个关键词试试吧',
  };

  return (
    <div className={cn('flex h-full flex-col items-center justify-center py-12 px-6 text-center', className)}>
      <div className="mb-4 text-gray-300 dark:text-gray-600 transition-colors duration-300">
        {icon || defaultIcons[variant]}
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
        {title || defaultTitles[variant]}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs transition-colors duration-300">
        {description || defaultDescriptions[variant]}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
