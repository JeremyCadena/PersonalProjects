// ARCHIVO: /hooks/useDebounce.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * Útil para evitar llamadas excesivas a la API en campos de búsqueda.
 * @param value El valor a "debouncear" (ej. el término de búsqueda).
 * @param delay El tiempo de retraso en milisegundos.
 * @returns El valor "debounceado".
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}