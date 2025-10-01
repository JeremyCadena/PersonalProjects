'use client';
import React, { useState } from 'react';
import { PuertoCreate } from '@/lib/types';
import { createPuerto } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { lusitana } from '@/components/ui/fonts';

interface CreatePuertoFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePuertoForm: React.FC<CreatePuertoFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<PuertoCreate>({
    nombre_puerto: '', 
    ciudad_origen: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PuertoCreate, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof PuertoCreate]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof PuertoCreate];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PuertoCreate, string>> = {};
    if (!formData.nombre_puerto.trim()) newErrors.nombre_puerto = 'Es necesario asignar un nombre para el puerto.';
    if (!formData.ciudad_origen.trim()) newErrors.ciudad_origen = 'Es necesario poner la ciudad de origen del puerto.';
    
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
      await createPuerto(formData);
      onSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Error al crear puerto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className={`${lusitana.className} text-2xl font-bold mb-4 text-center`}>Nuevo Puerto</h2>
        {apiError && <p className="text-center text-red-500 mb-4">{apiError}</p>}
        <form onSubmit={handleSubmit} noValidate>
          {/* Nombres */}
          <div className="mb-4">
            <label htmlFor="nombre-create" className="mb-2 block text-sm font-medium">Nombre del Puerto</label>
            <div className="relative">
              <input type="text" id="nombre-create" name="nombre_puerto" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder="Nombre de Puerto" value={formData.nombre_puerto} onChange={handleChange} disabled={isLoading} maxLength={30} />
              <ModeOfTravelIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.nombre_puerto && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.nombre_puerto}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="ciudad-create" className="mb-2 block text-sm font-medium">Localización del Puerto</label>
            <div className="relative">
                <input 
                    type="text" 
                    id="ciudad-create"
                    // Asegúrate de que este 'name' coincida con la llave en tu estado
                    name="ciudad_origen" 
                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                    placeholder="Ciudad de Origen del Puerto"
                    // Y que este 'value' apunte a la misma llave
                    value={formData.ciudad_origen}
                    onChange={handleChange} 
                    disabled={isLoading} 
                    maxLength={30} 
                />
                <LocationCityIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.ciudad_origen && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.ciudad_origen}</p>}
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