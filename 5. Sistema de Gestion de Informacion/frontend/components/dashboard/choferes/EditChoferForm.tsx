// ARCHIVO: /components/dashboard/choferes/EditChoferForm.tsx
'use client';

import React, { useState } from 'react';
import { Chofer, ChoferUpdate } from '@/lib/types';
import { updateChofer } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { lusitana } from '@/components/ui/fonts';
import { DeviceTabletIcon, IdentificationIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface EditChoferFormProps {
  chofer: Chofer;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditChoferForm: React.FC<EditChoferFormProps> = ({ chofer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<ChoferUpdate>({
    cedula: chofer.cedula,
    nombres: chofer.nombres,
    apellidos: chofer.apellidos,
    placa_cabezal: chofer.placa_cabezal,
    telefono: chofer.telefono,
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ChoferUpdate, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof ChoferUpdate]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ChoferUpdate];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChoferUpdate, string>> = {};
    if (formData.cedula && !/^[0-9]{10}$/.test(formData.cedula)) newErrors.cedula = 'Cédula debe tener 10 dígitos.';
    if (!formData.nombres?.trim()) newErrors.nombres = 'Nombres son requeridos.';
    if (!formData.apellidos?.trim()) newErrors.apellidos = 'Apellidos son requeridos.';
    if (!formData.placa_cabezal?.trim()) newErrors.placa_cabezal = 'Placa es requerida.';
    if (formData.telefono && !/^[0-9]{10}$/.test(formData.telefono)) newErrors.telefono = 'Teléfono debe tener 10 dígitos.';
    
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
      await updateChofer(chofer.chofer_id, formData);
      onSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Error al actualizar el chofer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
        <h2 className={`${lusitana.className} text-2xl font-bold mb-4 text-center`}>Editar Chofer: {chofer.nombres} {chofer.apellidos}</h2>
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            {/* Nombres */}
            <div className="mb-4">
              <label htmlFor="nombres-edit" className="mb-2 block text-sm font-medium">Nombres</label>
              <div className="relative">
                <input type="text" id="nombres-edit" name="nombres" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.nombres} onChange={handleChange} disabled={isLoading} maxLength={255} />
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.nombres && <p className="text-red-500 text-xs mt-1">{fieldErrors.nombres}</p>}
            </div>

            {/* Apellidos */}
            <div className="mb-4">
              <label htmlFor="apellidos-edit" className="mb-2 block text-sm font-medium">Apellidos</label>
              <div className="relative">
                <input type="text" id="apellidos-edit" name="apellidos" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.apellidos} onChange={handleChange} disabled={isLoading} maxLength={255} />
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.apellidos && <p className="text-red-500 text-xs mt-1">{fieldErrors.apellidos}</p>}
            </div>

            {/* Cédula */}
            <div className="mb-4">
              <label htmlFor="cedula-edit" className="mb-2 block text-sm font-medium">Cédula</label>
              <div className="relative">
                <input type="text" id="cedula-edit" name="cedula" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.cedula} onChange={handleChange} disabled={isLoading} maxLength={10} />
                <IdentificationIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.cedula && <p className="text-red-500 text-xs mt-1">{fieldErrors.cedula}</p>}
            </div>

            {/* Placa Cabezal */}
            <div className="mb-4">
              <label htmlFor="placa_cabezal-edit" className="mb-2 block text-sm font-medium">Placa Cabezal</label>
              <div className="relative">
                <input type="text" id="placa_cabezal-edit" name="placa_cabezal" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.placa_cabezal} onChange={handleChange} disabled={isLoading} maxLength={10} />
                <DeviceTabletIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.placa_cabezal && <p className="text-red-500 text-xs mt-1">{fieldErrors.placa_cabezal}</p>}
            </div>

            {/* Teléfono */}
            <div className="mb-4 md:col-span-2">
              <label htmlFor="telefono-edit" className="mb-2 block text-sm font-medium">Teléfono</label>
              <div className="relative">
                <input type="text" id="telefono-edit" name="telefono" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.telefono} onChange={handleChange} disabled={isLoading} maxLength={10} />
                <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.telefono && <p className="text-red-500 text-xs mt-1">{fieldErrors.telefono}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};