import { create } from 'zustand';

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
  addWallet: (name: string, description?: string) => void;
  updateWallet: (id: string, data: Partial<Omit<Wallet, 'id'>>) => void;
  deleteWallet: (id: string) => void;
}

const STORAGE_KEY = 'wallet-storage';

const loadFromStorage = (): { wallets: Wallet[]; currentWalletId: string } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error('Failed to load wallet data from storage');
  }
  return {
    wallets: [
      {
        id: 'default',
        name: '日常账本',
        description: '记录日常生活开支和收入',
        color: '#10b981',
        isDefault: true,
      },
    ],
    currentWalletId: 'default',
  };
};

const saveToStorage = (data: { wallets: Wallet[]; currentWalletId: string }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error('Failed to save wallet data to storage');
  }
};

const initialData = loadFromStorage();

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallets: initialData.wallets,
  currentWalletId: initialData.currentWalletId,

  setCurrentWallet: (id) => {
    const data = { wallets: get().wallets, currentWalletId: id };
    saveToStorage(data);
    set(data);
  },

  addWallet: (name, description = '') => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const newWallet: Wallet = {
      id: Date.now().toString(),
      name,
      description,
      color: colors[get().wallets.length % colors.length],
      isDefault: false,
    };
    const wallets = [...get().wallets, newWallet];
    const data = { wallets, currentWalletId: get().currentWalletId };
    saveToStorage(data);
    set(data);
  },

  updateWallet: (id, data) => {
    const wallets = get().wallets.map((w) => (w.id === id ? { ...w, ...data } : w));
    const storageData = { wallets, currentWalletId: get().currentWalletId };
    saveToStorage(storageData);
    set({ wallets });
  },

  deleteWallet: (id) => {
    let wallets = get().wallets.filter((w) => w.id !== id);
    let currentWalletId = get().currentWalletId;
    if (get().currentWalletId === id) {
      currentWalletId = wallets[0]?.id || 'default';
    }
    const data = { wallets, currentWalletId };
    saveToStorage(data);
    set(data);
  },
}));