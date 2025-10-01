'use client';
import React, { useState } from 'react';
import { ProductorCreate } from '@/lib/types';
import { createProductor } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import FaceIcon from '@mui/icons-material/Face';
import { lusitana } from '@/components/ui/fonts';

interface CreateProductorFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProductorForm: React.FC<CreateProductorFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<ProductorCreate>({
    nombre_productor: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProductorCreate, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof ProductorCreate]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ProductorCreate];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductorCreate, string>> = {};
    if (!formData.nombre_productor.trim()) newErrors.nombre_productor = 'Es necesario un nombre.';
    
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
      await createProductor(formData);
      onSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Error al crear el productor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className={`${lusitana.className} text-2xl font-bold mb-4 text-center`}>Nuevo Productor</h2>
        {apiError && <p className="text-center text-red-500 mb-4">{apiError}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <div className="relative">
              <input type="text" id="nombre_productor-create" name="nombre_productor" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder="Productor Principal" value={formData.nombre_productor} onChange={handleChange} disabled={isLoading} maxLength={30} />
              <FaceIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.nombre_productor && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.nombre_productor}</p>}
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