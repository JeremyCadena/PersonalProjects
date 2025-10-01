// ARCHIVO: /components/dashboard/cargamentos/CargamentoButtons.tsx
'use client';

import React from 'react';
import { PencilIcon, TrashIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { IconButton, Button, Tooltip } from '@mui/material'; // Usaremos componentes de MUI para un look consistente

interface CargamentoButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  onDownloadPdf: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canDownloadPdf?: boolean; 
}

export const CargamentoButtons: React.FC<CargamentoButtonsProps> = ({
  onEdit, onDelete, onDownloadPdf, canEdit, canDelete, canDownloadPdf
}) => {
  return (
    // Contenedor que alinea los botones
    <div className="flex items-center gap-1">
      {canEdit && (
        <Tooltip title="Editar">
          <IconButton onClick={onEdit} size="small">
            <PencilIcon className="h-5 w-5" />
          </IconButton>
        </Tooltip>
      )}
      {canDelete && (
        <Tooltip title="Eliminar">
          <IconButton onClick={onDelete} size="small" sx={{ color: 'error.main' }}>
            <TrashIcon className="h-5 w-5" />
          </IconButton>
        </Tooltip>
      )}
      {canDownloadPdf && (
        <Tooltip title="Descargar Reporte">
          <IconButton onClick={onDownloadPdf} size="small">
            <DocumentArrowDownIcon className="h-5 w-5" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};