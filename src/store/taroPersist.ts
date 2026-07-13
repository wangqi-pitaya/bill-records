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
          const dataOnly: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(state)) {
            if (typeof value !== 'function') {
              dataOnly[key] = value;
            }
          }
          setStorage(options.name, dataOnly);
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
