'use client';

import React, { useState, useCallback } from 'react';
import { Agricola, Productor, AgricolaUpdate, AfiliacionFinca } from '@/lib/types';
import { updateAgricola, getProductorList } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { lusitana } from '@/components/ui/fonts';
import { TagIcon, UserIcon, MapPinIcon, GlobeAltIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { Autocomplete, TextField, CircularProgress, debounce } from '@mui/material';

type FormAgricolaUpdate = Omit<AgricolaUpdate, 'productor_id'> & { productor_id: number | null };

interface EditAgricolaFormProps {
  agricola: Agricola;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditAgricolaForm: React.FC<EditAgricolaFormProps> = ({ agricola, onClose, onSuccess }) => {
  const { token } = useAuth();

  const [formData, setFormData] = useState<FormAgricolaUpdate>({
    magap: agricola.magap,
    codigo: agricola.codigo,
    finca: agricola.finca,
    sector: agricola.sector,
    afiliacion: agricola.afiliacion,
    productor_id: agricola.productor_rel.productor_id, 
  });

  const [productores, setProductores] = useState<Productor[]>([]);
  const [productoresLoading, setProductoresLoading] = useState(false);
  const [selectedProductor, setSelectedProductor] = useState<Productor | null>(agricola.productor_rel);
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof AgricolaUpdate, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedFetchProductores = useCallback(
    debounce(async (query: string) => {
      if (!token || query.length < 3) {
        setProductores([]);
        return;
      }
      setProductoresLoading(true);
      try {
        const data = await getProductorList(query);
        setProductores(data);
      } catch (err) {
        console.error('Error buscando productores', err);
      } finally {
        setProductoresLoading(false);
      }
    }, 300),
    [token]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FormAgricolaUpdate]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormAgricolaUpdate];
        return newErrors;
      });
    }
  };

  const handleProductorAutocompleteChange = (event: React.SyntheticEvent, newValue: Productor | null) => {
    setSelectedProductor(newValue);
    setFormData((prev) => ({ ...prev, productor_id: newValue?.productor_id || null }));
    setFieldErrors((prev: any) => ({ ...prev, productor_id: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormAgricolaUpdate, string>> = {};
    if (!formData.afiliacion) newErrors.afiliacion = 'Agregue una afiliación.';
    if (!formData.magap?.trim()) newErrors.magap = 'El código MAGAP es requerido.';
    if (!formData.codigo?.trim()) newErrors.codigo = 'El código es requerido.';
    if (formData.productor_id === null) newErrors.productor_id = 'Debe seleccionar un productor.';
    if (!formData.finca?.trim()) newErrors.finca = 'La finca es requerida.';
    if (!formData.sector?.trim()) newErrors.sector = 'La ubicación es requerida.';
    
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
      const payload: AgricolaUpdate = {
        ...formData,
        productor_id: formData.productor_id!,
      };
      await updateAgricola(agricola.agricola_id, payload);
      onSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Error al actualizar el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
        <h2 className={`${lusitana.className} text-2xl font-bold mb-4 text-center`}>Editar Registro: {agricola.finca}</h2>
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {apiError}
          </div>
        )}
        {/* El JSX del formulario es idéntico al de creación */}
        <form onSubmit={handleSubmit} noValidate>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            {/* MAGAP */}
          <div className="mb-4">
            <label htmlFor="magap-edit" className="mb-2 block text-sm font-medium">MAGAP</label>
            <div className="relative">
              <input type="text" id="magap-edit" name="magap" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder="Código MAGAP" value={formData.magap} onChange={handleChange} disabled={isLoading} maxLength={8} />
              <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.magap && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.magap}</p>}
          </div>
          {/* Código */}
          <div className="mb-4">
            <label htmlFor="codigo-edit" className="mb-2 block text-sm font-medium">Código</label>
            <div className="relative">
              <input type="text" id="codigo-edit" name="codigo" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder="Código de Finca" value={formData.codigo} onChange={handleChange} disabled={isLoading} maxLength={8} />
              <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.codigo && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.codigo}</p>}
          </div>

            <div className="mb-4">
              <label htmlFor="productor_id-edit" className="mb-2 block text-sm font-medium">Productor</label>
              <Autocomplete
                id="productor_id-edit"
                options={productores}
                getOptionLabel={(option) => option.nombre_productor}
                onInputChange={(event, value, reason) => {
                  if (reason === 'input') debouncedFetchProductores(value);
                }}
                onChange={handleProductorAutocompleteChange}
                value={selectedProductor}
                disabled={isLoading}
                loading={productoresLoading}
                isOptionEqualToValue={(option, value) => option.productor_id === value.productor_id}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    name="productor_id"
                    placeholder='Seleccione un Productor'
                    error={!!fieldErrors.productor_id}
                    helperText={fieldErrors.productor_id}
                    // Puedes reutilizar los estilos (sx) del form de creación si lo deseas
                  />
                )}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="finca-edit" className="mb-2 block text-sm font-medium">Finca</label>
              <div className="relative">
                <input type="text" id="finca-edit" name="finca" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.finca} onChange={handleChange} disabled={isLoading} maxLength={50} />
                <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.finca && <p className="text-red-500 text-xs mt-1">{fieldErrors.finca}</p>}
            </div>
            {/* Sector */}
          <div className="mb-4">
            <label htmlFor="sector-edit" className="mb-2 block text-sm font-medium">Sector</label>
            <div className="relative">
              <input type="text" id="sector-edit" name="sector" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder="Sector" value={formData.sector} onChange={handleChange} disabled={isLoading} maxLength={100} />
              <GlobeAltIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.sector && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.sector}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="afiliacion-edit" className="mb-2 block text-sm font-medium">Afiliación </label>
            <div className="relative">
              <input type="text" id="afiliacion-edit" name="afiliacion" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500" placeholder="Nombre de la Afiliación" value={formData.afiliacion} onChange={handleChange} disabled={isLoading} maxLength={20} />
              <BriefcaseIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {fieldErrors.afiliacion && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.afiliacion}</p>}
          </div>
          
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">Cancelar</Button>
            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full sm:w-auto">Guardar Cambios</Button>
          </div>
        </form>
      </div>
    </div>
  );
};