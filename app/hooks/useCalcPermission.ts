'use client';

import { useEffect, useState } from 'react';
import { fetchCalcPermission } from '@/lib/supabaseFunctions';

export function useCalcPermission() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const p = await fetchCalcPermission();
        if (!cancelled) setAllowed(!!p.allowed);
      } catch (e: any) {
        if (!cancelled) setAllowed(false);
        if (!cancelled) setError(e?.message ?? 'Permission check failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { allowed, loading, error };
}
