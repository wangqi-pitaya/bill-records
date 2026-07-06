import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultWallets } from '../data/defaults';

export interface Wallet {
  id: string;
  name: string;
  description: string;
  color: string;
  isDefault: boolean;
}

interface WalletStore {
  wallets: Wallet[];
  currentWalletId: string;
  setCurrentWallet: (id: string) => void;
  addWallet: (name: string, description?: string, color?: string) => void;
  updateWallet: (id: string, data: Partial<Omit<Wallet, 'id'>>) => void;
  deleteWallet: (id: string) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      wallets: defaultWallets as Wallet[],
      currentWalletId: 'default',

      setCurrentWallet: (id) => {
        set({ currentWalletId: id });
      },

      addWallet: (name, description = '', color) => {
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        const walletColor = color || colors[get().wallets.length % colors.length];
        const newWallet: Wallet = {
          id: crypto.randomUUID(),
          name,
          description,
          color: walletColor,
          isDefault: false,
        };
        const wallets = [...get().wallets, newWallet];
        set({ wallets });
      },

      updateWallet: (id, data) => {
        const wallets = get().wallets.map((w) => (w.id === id ? { ...w, ...data } : w));
        set({ wallets });
      },

      deleteWallet: (id) => {
        const wallets = get().wallets.filter((w) => w.id !== id);
        let currentWalletId = get().currentWalletId;
        if (get().currentWalletId === id) {
          currentWalletId = wallets[0]?.id || 'default';
        }
        set({ wallets, currentWalletId });
      },
    }),
    {
      name: 'wallet-storage',
    }
  )
);
