// ARCHIVO: /components/ui/skeletons.tsx
import React from 'react';

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr className="w-full border-b border-gray-200 last-of-type:border-none">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="whitespace-nowrap px-3 py-4">
          <div className="h-6 w-full rounded bg-gray-200"></div>
        </td>
      ))}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-7 w-7 rounded bg-gray-200"></div>
          <div className="h-7 w-7 rounded bg-gray-200"></div>
        </div>
      </td>
    </tr>
  );
}

export function TableSkeleton({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <div className={`${shimmer} relative mt-6 flow-root overflow-hidden`}>
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-100 p-2">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} scope="col" className="px-3 py-5 font-medium">
                    <div className="h-6 rounded bg-gray-200"></div>
                  </th>
                ))}
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {Array.from({ length: rows }).map((_, index) => (
                <TableRowSkeleton key={index} columns={columns} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


export function CardSkeleton() {
  return (
    <div className={`${shimmer} relative overflow-hidden rounded-lg bg-white shadow-md`}>
      {/* Encabezado */}
      <div className="flex items-center p-4 bg-gray-100 border-b">
        <div className="h-6 w-6 rounded-full bg-gray-200 mr-2"></div>
        <div className="h-6 w-3/4 rounded bg-gray-200"></div>
      </div>
      {/* Cuerpo */}
      <div className="p-4 space-y-3">
        <div className="h-5 w-5/6 rounded bg-gray-200"></div>
        <div className="h-5 w-4/6 rounded bg-gray-200"></div>
        <div className="h-5 w-3/6 rounded bg-gray-200"></div>
      </div>
      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
        <div className="h-8 w-24 rounded-md bg-gray-200"></div>
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-md bg-gray-200"></div>
          <div className="h-8 w-8 rounded-md bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

export function CardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
