'use client';
import React, { useState } from 'react';
import { ExportadoraCreate } from '@/lib/types';
import { createExportadora } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import { lusitana } from '@/components/ui/fonts';

interface CreateExportadoraFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateExportadoraForm: React.FC<CreateExportadoraFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<ExportadoraCreate>({
    nombre: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ExportadoraCreate, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof ExportadoraCreate]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ExportadoraCreate];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExportadoraCreate, string>> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Es necesario un nombre de exportadora.';
    
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
      await createExportadora(formData);
      onSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Error al crear la exportadora.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className={`${lusitana.className} text-2xl font-bold mb-4 text-center`}>Nueva Exportadora</h2>
        {apiError && <p className="text-center text-red-500 mb-4">{apiError}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <div className="relative">
              <input type="text" id="nombre-create" name="nombre" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder="Exportadora Principal" value={formData.nombre} onChange={handleChange} disabled={isLoading} maxLength={30} />
              <AddBusinessIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.nombre && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.nombre}</p>}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">Cancelar</Button>
            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full sm:w-auto">Crear Registro</Button>
          </div>
        </form>
      </div>
    </div>
  );
};