// ARCHIVO: /components/dashboard/choferes/EditChoferForm.tsx
'use client';

import React, { useState } from 'react';
import { Exportadora, ExportadoraUpdate } from '@/lib/types';
import { updateExportadora } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { lusitana } from '@/components/ui/fonts';
import { Button } from '@/components/ui/Button';
import StoreIcon from '@mui/icons-material/Store';

interface EditExportadoraFormProps {
  exportadora: Exportadora;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditExportadoraForm: React.FC<EditExportadoraFormProps> = ({ exportadora, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<ExportadoraUpdate>({
    nombre: exportadora.nombre,
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ExportadoraUpdate, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof ExportadoraUpdate]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ExportadoraUpdate];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExportadoraUpdate, string>> = {};
    if (!formData.nombre?.trim()) newErrors.nombre = 'Nombre de exportadora es requerido.';
    
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!token) {
      setApiError("No autorizado.");
      return;
    }

    setIsLoading(true);
    setApiError(null);
    try {
      await updateExportadora(exportadora.exportadora_id, formData);
      onSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Error al actualizar la exportadora.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className={`${lusitana.className} text-2xl font-bold mb-4 text-center`}>Editar Nombre de Exportadora</h2>
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <div className="relative">
                <input type="text" id="nombre-edit" name="nombre" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.nombre} onChange={handleChange} disabled={isLoading} maxLength={30} />
                <StoreIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.nombre && <p className="text-red-500 text-xs mt-1">{fieldErrors.nombre}</p>}
            </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full sm:w-auto">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};