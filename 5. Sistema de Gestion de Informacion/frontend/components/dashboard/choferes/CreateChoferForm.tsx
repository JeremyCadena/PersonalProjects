// ARCHIVO: /app/components/dashboard/choferes/CreateChoferForm.tsx
'use client';

import React, { useState } from 'react';
import { ChoferCreate } from '@/lib/types';
import { createChofer } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { IdentificationIcon, UserIcon, DeviceTabletIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/components/ui/fonts';

interface CreateChoferFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateChoferForm: React.FC<CreateChoferFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<ChoferCreate>({
    cedula: '', nombres: '', apellidos: '', placa_cabezal: '', telefono: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ChoferCreate, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof ChoferCreate]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ChoferCreate];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChoferCreate, string>> = {};
    if (!formData.cedula || !/^[0-9]{10}$/.test(formData.cedula)) newErrors.cedula = 'Cédula debe tener 10 dígitos.';
    if (!formData.nombres.trim()) newErrors.nombres = 'Nombres son requeridos.';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Apellidos son requeridos.';
    if (!formData.placa_cabezal.trim()) newErrors.placa_cabezal = 'Placa es requerida.';
    if (!formData.telefono || !/^[0-9]{10}$/.test(formData.telefono)) newErrors.telefono = 'Teléfono debe tener 10 dígitos.';
    
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
      await createChofer(formData);
      onSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Error al crear el chofer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className={`${lusitana.className} text-xl md:text-2xl font-bold mb-4 text-center`}>Nuevo Chofer</h2>
        {apiError && <p className="text-center text-red-500 mb-4">{apiError}</p>}
        <form onSubmit={handleSubmit} noValidate>
          {/* Cédula */}
          <div className="mb-4">
            <label htmlFor="cedula-create" className="mb-2 block text-sm font-medium">Cédula</label>
            <div className="relative">
              <input type="text" id="cedula-create" name="cedula" value={formData.cedula} onChange={handleChange} className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" placeholder='Cédula' maxLength={10} />
              <IdentificationIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.cedula && <p className="text-red-500 text-xs mt-1">{fieldErrors.cedula}</p>}
          </div>

          {/* Nombres */}
          <div className="mb-4">
            <label htmlFor="nombres-create" className="mb-2 block text-sm font-medium">Nombres</label>
            <div className="relative">
              <input type="text" id="nombres-create" name="nombres" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder="Nombres" value={formData.nombres} onChange={handleChange} disabled={isLoading} maxLength={50} />
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.nombres && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.nombres}</p>}
          </div>

          {/* Apellidos */}
          <div className="mb-4">
            <label htmlFor="apellidos-create" className="mb-2 block text-sm font-medium">Apellidos</label>
            <div className="relative">
              <input type="text" id="apellidos-create" name="apellidos" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} disabled={isLoading} maxLength={50} />
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.apellidos && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.apellidos}</p>}
          </div>

          {/* Placa Cabezal */}
          <div className="mb-4">
            <label htmlFor="placa_cabezal-create" className="mb-2 block text-sm font-medium">Placa Cabezal</label>
            <div className="relative">
              <input type="text" id="placa_cabezal-create" name="placa_cabezal" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder="Placa Cabezal" value={formData.placa_cabezal} onChange={handleChange} disabled={isLoading} maxLength={10} />
              <DeviceTabletIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.placa_cabezal && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.placa_cabezal}</p>}
          </div>

          {/* Teléfono */}
          <div className="mb-4">
            <label htmlFor="telefono-create" className="mb-2 block text-sm font-medium">Teléfono</label>
            <div className="relative">
              <input type="text" id="telefono-create" name="telefono" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} disabled={isLoading} maxLength={10} />
              <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.telefono && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.telefono}</p>}
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