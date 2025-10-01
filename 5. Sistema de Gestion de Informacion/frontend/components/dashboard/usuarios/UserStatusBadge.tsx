// ARCHIVO: /components/users/UserStatusBadge.tsx
import React from 'react';
import clsx from 'clsx';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface UserStatusBadgeProps {
  status: boolean; 
  label?: string; 
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status, label }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        {
          'bg-green-100 text-green-700': status, // Activo
          'bg-red-100 text-red-700': !status, // Inactivo
        }
      )}
    >
      {status ? (
        <>
          <CheckCircleIcon className="mr-1 h-4 w-4" />
          {label || 'Activo'}
        </>
      ) : (
        <>
          <XCircleIcon className="mr-1 h-4 w-4" />
          {label || 'Inactivo'}
        </>
      )}
    </span>
  );
};

interface UserRoleBadgeProps {
  role: string; 
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize',
        {
          'bg-blue-100 text-blue-800': role === 'administrador',
          'bg-purple-100 text-purple-800': role === 'inspector',
          'bg-gray-100 text-gray-800': role === 'visualizador',
        }
      )}
    >
      {role}
    </span>
  );
};