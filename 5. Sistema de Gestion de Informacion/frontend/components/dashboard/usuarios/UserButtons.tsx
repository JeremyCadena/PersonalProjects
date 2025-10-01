// ARCHIVO: /components/users/UserButtons.tsx
'use client';

import { PencilIcon, TrashIcon, CheckIcon, } from '@heroicons/react/24/outline';
import { RolUsuario } from '@/lib/types';

interface UserButtonsProps {
  userId: number;
  onEdit: (userId: number) => void;
  onDelete: (userId: number) => void;
  onToggleActiveStatus: (userId: number, currentStatus: boolean) => void;
  currentRolUsuario: RolUsuario | null;
}

export const UserButtons: React.FC<UserButtonsProps> = ({ 
  userId, 
  onEdit, 
  onDelete, 
  onToggleActiveStatus,
  currentRolUsuario,
}) => {
  const canEdit = currentRolUsuario === RolUsuario.ADMIN;
  const canDelete = currentRolUsuario === RolUsuario.ADMIN;
  const canToggleActiveStatus = currentRolUsuario === RolUsuario.ADMIN;

  return (
    <div className="flex justify-end gap-2">
      {canEdit && (
        <button 
          onClick={() => onEdit(userId)}
          className="rounded-md border p-2 hover:bg-blue-700 group"
          title="Editar Usuario"
        >
          <PencilIcon className="w-5 group-hover:text-white" />
        </button>
      )}
      {canDelete && (
        <button 
          onClick={() => onDelete(userId)}
          className="rounded-md border p-2 hover:bg-red-500 group"
          title="Eliminar Usuario"
        >
          <TrashIcon className="w-5 group-hover:text-white" />
        </button>
      )}
      {/* Botón para cambiar estado activo/inactivo */}
      {canToggleActiveStatus && (
        <button 
          onClick={() => onToggleActiveStatus(userId, true)} 
          className="rounded-md border p-2 hover:bg-emerald-400 group"
          title="Cambiar Estado Activo"
        >
          <CheckIcon className="w-5 text-green-500 group-hover:text-white" />
        </button>
      )}
    </div>
  );
};