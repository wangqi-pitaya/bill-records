import { useMemo } from 'react';
import { useWalletStore } from '../store/useWalletStore';

export function useThemeColor(): string {
  const currentWalletId = useWalletStore((s) => s.currentWalletId);
  const wallets = useWalletStore((s) => s.wallets);

  return useMemo(
    () => wallets.find((w) => w.id === currentWalletId)?.color || '#10b981',
    [wallets, currentWalletId]
  );
}
