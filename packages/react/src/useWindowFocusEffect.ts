import { useEffect } from 'react';

export type UseFocusChangeEffectOptions = {
  enabled?: boolean;
};

export const useWindowFocusEffect = (
  fn: (...args: unknown[]) => unknown,
  { enabled = true }: UseFocusChangeEffectOptions = {}
) => {
  useEffect(() => {
    const visibilityChangeFn = () => {
      if (globalThis.document?.visibilityState === 'visible') {
        fn();
      }
    };

    globalThis.addEventListener?.('visibilitychange', visibilityChangeFn);
    globalThis.addEventListener?.('focus', fn);

    return () => {
      globalThis.removeEventListener?.('visibilitychange', visibilityChangeFn);
      globalThis.removeEventListener?.('focus', fn);
    };
  }, [enabled, fn]);
};
