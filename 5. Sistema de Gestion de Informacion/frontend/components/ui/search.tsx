// =================================================================
// ARCHIVO: /app/components/ui/Search.tsx
// =================================================================
'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
}

export const Search: React.FC<SearchProps> = ({ placeholder, ...rest }) => {
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Buscar
      </label>
      <input
        id="search"
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        {...rest}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
};