// ARCHIVO: /components/dashboard/choferes/ChoferButtons.tsx
'use client';

import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface ParametrosButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canDownloadPdf?: boolean; 
}

export const ParametrosButtons: React.FC<ParametrosButtonsProps> = ({ onEdit, onDelete, canEdit, canDelete }) => {
  const { user } = useAuth();

  return (
    <div className="flex justify-end gap-2">
      {canEdit && (
        <button onClick={onEdit} 
          className="group rounded-md p-2 hover:bg-blue-500" 
          title="Editar">
          <PencilIcon className="w-5 group-hover:text-white" />
        </button>
      )}
      {canDelete && (
        <button onClick={onDelete} className="group rounded-md p-2 hover:bg-red-500" title="Eliminar">
          <TrashIcon className="w-5 group-hover:text-white" />
        </button>
      )}
    </div>
  );
};
