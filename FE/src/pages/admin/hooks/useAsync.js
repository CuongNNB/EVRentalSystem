import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useAsync Hook
 * 
 * NOTE: Được sửa để tránh warning về dependency array thay đổi kích thước
 * - Sử dụng eslint-disable để cho phép dynamic deps
 * - Đảm bảo các giá trị trong deps được memoize ở hook gọi nó
 */
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ctlRef = useRef(null);
  const isMountedRef = useRef(true);

  const run = useCallback(async () => {
    try {
      // Abort previous request
      if (ctlRef.current) {
        ctlRef.current.abort();
      }
      
      // Create new controller
      ctlRef.current = new AbortController();
      
      // Only set loading if mounted
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }
      
      const res = await fn(ctlRef.current.signal);
      
      // Only update state if not aborted and still mounted
      if (!ctlRef.current.signal.aborted && isMountedRef.current) {
        setData(res);
        setLoading(false);
      }
    } catch (e) {
      // Check if error is due to cancellation
      const isCanceled = 
        ctlRef.current?.signal?.aborted || 
        e?.code === 'ERR_CANCELED' || 
        e?.message === 'canceled' || 
        e?.name === 'CanceledError' ||
        e?.name === 'AbortError';
      
      // Only set error if not canceled and still mounted
      if (!isCanceled && isMountedRef.current && !ctlRef.current?.signal?.aborted) {
        setError(e?.message || String(e) || 'Failed');
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { 
    isMountedRef.current = true;
    run();
    
    return () => {
      isMountedRef.current = false;
      if (ctlRef.current) {
        ctlRef.current.abort();
      }
    };
  }, [run]);

  return { data, loading, error, refetch: run };
}
