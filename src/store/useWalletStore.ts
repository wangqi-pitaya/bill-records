import { create } from 'zustand';
import { Wallet } from '../types';
import { defaultWallets } from '../data/defaults';
import { generateId } from '../lib/utils';
import { taroPersist } from './taroPersist';
import Taro from '@tarojs/taro';

interface WalletStore {
  wallets: Wallet[];
  currentWalletId: string;
  setCurrentWallet: (id: string) => void;
  setCurrentWalletId: (id: string) => void;
  setWallets: (wallets: Wallet[]) => void;
  addWallet: (name: string, description?: string, color?: string) => void;
  updateWallet: (id: string, data: Partial<Omit<Wallet, 'id'>>) => void;
  deleteWallet: (id: string) => void;
}

function updateTabBarColor(color: string) {
  try {
    Taro.setTabBarStyle({ selectedColor: color });
  } catch {
    // ignore
  }
}

export const useWalletStore = create<WalletStore>()(
  taroPersist(
    (set, get) => ({
      wallets: defaultWallets as Wallet[],
      currentWalletId: 'default',

          setCurrentWallet: (id) => {
        set({ currentWalletId: id });
        const wallet = get().wallets.find((w) => w.id === id);
        if (wallet) {
          Taro.setStorageSync('wallet-selected-color', wallet.color);
          updateTabBarColor(wallet.color);
        }
      },

      setWallets: (wallets) => {
        set({ wallets });
      },

      addWallet: (name, description = '', color) => {
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        const walletColor = color || colors[get().wallets.length % colors.length];
        const newWallet: Wallet = {
          id: generateId(),
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
        if (get().currentWalletId === id && data.color) {
          Taro.setStorageSync('wallet-selected-color', data.color);
          updateTabBarColor(data.color);
        }
      },

      deleteWallet: (id) => {
        const wallets = get().wallets.filter((w) => w.id !== id);
        let currentWalletId = get().currentWalletId;
        if (get().currentWalletId === id) {
          currentWalletId = wallets[0]?.id || 'default';
          const wallet = wallets[0];
          if (wallet) {
            Taro.setStorageSync('wallet-selected-color', wallet.color);
            updateTabBarColor(wallet.color);
          }
        }
        set({ wallets, currentWalletId });
      },
    }),
    {
      name: 'wallet-storage',
    }
  )
);
