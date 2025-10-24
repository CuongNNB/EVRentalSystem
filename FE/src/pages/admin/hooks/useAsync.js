import { useCallback, useEffect, useRef, useState } from "react";

export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ctl = useRef(null);

  const run = useCallback(async () => {
    try {
      ctl.current?.abort();
      ctl.current = new AbortController();
      setLoading(true);
      setError(null);
      const res = await fn(ctl.current.signal);
      if (!ctl.current.signal.aborted) setData(res);
    } catch (e) {
      // If the error is due to abort/cancel, ignore it (don't surface 'canceled')
      const isCanceled = ctl.current?.signal?.aborted || e?.code === 'ERR_CANCELED' || e?.message === 'canceled' || e?.name === 'CanceledError';
      if (!isCanceled && !ctl.current.signal.aborted) setError(e?.message || 'Failed');
    } finally {
      if (!ctl.current.signal.aborted) setLoading(false);
    }
  }, deps);

  useEffect(() => { run(); return () => ctl.current?.abort(); }, [run]);

  return { data, loading, error, refetch: run };
}
