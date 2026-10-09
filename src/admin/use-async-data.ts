import { useCallback, useEffect, useState } from 'react';

type State<T> = Readonly<{
  status: 'loading' | 'error' | 'success';
  data?: T;
  error?: unknown;
}>;

/**
 * Runs `loader` on mount (and whenever it changes) and exposes the result with
 * the loading / error / success states the screens expect. `loader` must be
 * stable (wrap it in useCallback). `reload` shows the loading state again.
 */
export function useAsyncData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    loader().then(
      (data) => {
        if (active) setState({ status: 'success', data });
      },
      (error: unknown) => {
        if (active) setState({ status: 'error', error });
      },
    );
    return () => {
      active = false;
    };
  }, [loader, attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  /** Refreshes in the background, keeping what is on screen meanwhile. */
  const refresh = useCallback(() => setAttempt((value) => value + 1), []);

  return { ...state, reload, refresh };
}
