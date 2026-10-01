import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Minimal data-fetching hook.
 * fetcher must return a promise resolving to the data you want stored.
 * Returns { data, loading, error, refetch }.
 *
 * `loading` is true only while there is nothing to show yet — refetches keep
 * the previous data on screen so pages don't flash back to a spinner.
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const hasData = useRef(false);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    if (!hasData.current) setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (cancelled) return;
        hasData.current = true;
        setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, refetch };
}
