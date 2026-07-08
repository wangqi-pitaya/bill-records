import { StateCreator } from 'zustand';
import { getStorage, setStorage } from '../lib/utils';

export function taroPersist<T extends object>(
  config: StateCreator<T>,
  options: { name: string }
): StateCreator<T> {
  return (set, get, api) => {
    const store = config(
      (partial, replace) => {
        // @ts-ignore
        set(partial, replace);
        try {
          const state = get();
          setStorage(options.name, state);
        } catch (e) {
          console.error('Persist error:', e);
        }
      },
      get,
      api
    );

    try {
      const saved = getStorage<Record<string, unknown> | null>(options.name, null);
      if (saved) {
        // @ts-ignore
        set(saved);
      }
    } catch (e) {
      console.error('Rehydrate error:', e);
    }

    return store;
  };
}
