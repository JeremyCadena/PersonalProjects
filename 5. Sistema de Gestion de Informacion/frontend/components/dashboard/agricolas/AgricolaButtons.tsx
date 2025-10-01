// ARCHIVO: /components/dashboard/agricolas/AgricolaButtons.tsx
'use client';

import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { RolUsuario } from '@/lib/types';

interface AgricolaButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const AgricolaButtons: React.FC<AgricolaButtonsProps> = ({ onEdit, onDelete, canEdit, canDelete }) => {
  const { user } = useAuth();
  const canManage = user?.role === RolUsuario.ADMIN;

  if (!canManage) return null;

  return (
    <div className="flex justify-end gap-2">
      <button onClick={onEdit} className="group rounded-md p-2 hover:bg-blue-500" title="Editar">
        <PencilIcon className="w-5 group-hover:text-white" />
      </button>
      <button onClick={onDelete} className="group rounded-md p-2 hover:bg-red-500" title="Eliminar">
        <TrashIcon className="w-5 group-hover:text-white" />
      </button>
    </div>
  );
};