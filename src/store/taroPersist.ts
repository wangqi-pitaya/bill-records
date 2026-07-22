import { StateCreator } from 'zustand';
import { getStorage, setStorage } from '../lib/utils';

export function taroPersist<T extends object>(
  config: StateCreator<T>,
  options: { name: string }
): StateCreator<T> {
  return (set, get, api) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastPersisted = '';

    const schedulePersist = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        try {
          const state = get();
          const dataOnly: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(state)) {
            if (typeof value !== 'function') {
              dataOnly[key] = value;
            }
          }
          const json = JSON.stringify(dataOnly);
          if (json === lastPersisted) return;
          lastPersisted = json;
          setStorage(options.name, dataOnly);
        } catch (e) {
          console.error('Persist error:', e);
        }
      }, 300);
    };

    const store = config(
      (partial, replace) => {
        // @ts-ignore
        set(partial, replace);
        schedulePersist();
      },
      get,
      api
    );

    try {
      const saved = getStorage<Record<string, unknown> | null>(options.name, null);
      if (saved) {
        // @ts-ignore
        set(saved);
        lastPersisted = JSON.stringify(saved);
      }
    } catch (e) {
      console.error('Rehydrate error:', e);
    }

    return store;
  };
}
