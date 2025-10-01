'use client';

import React, { useState, useCallback } from 'react';
import { AgricolaCreate, Productor, AfiliacionFinca } from '@/lib/types';
import { createAgricola, getProductorList} from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { lusitana } from '@/components/ui/fonts';
import { TagIcon, UserIcon, MapPinIcon, GlobeAltIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { Autocomplete, TextField, CircularProgress, debounce } from '@mui/material';

// Definición de tipos para los datos del formulario, alineado con el tipo AgricolaCreate de la API
type FormAgricolaCreate = Omit<AgricolaCreate, 'productor_id'> & { productor_id: number | null };

interface CreateAgricolaFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAgricolaForm: React.FC<CreateAgricolaFormProps> = ({ onClose, onSuccess }) => {
  // Estado del formulario
  const [formData, setFormData] = useState<FormAgricolaCreate>({
    magap: '',
    codigo: '',
    finca: '',
    sector: '',
    afiliacion: AfiliacionFinca.PALMAR, // Valor por defecto
    productor_id: null,
  });
  
  // Estado para la lista de productores y el productor seleccionado en el Autocomplete
  const [productores, setProductores] = useState<Productor[]>([]);
  const [productoresLoading, setProductoresLoading] = useState(false);
  const [selectedProductor, setSelectedProductor] = useState<Productor | null>(null);

  // Estados para errores del formulario y de la API
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormAgricolaCreate, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

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
          setProductores([]);
          setApiError('Error al buscar choferes.');
        } finally {
          setProductoresLoading(false);
        }
      }, 300),
      [token]
    );

  // Maneja los cambios en los campos de texto y select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpia el error del campo si el usuario comienza a escribir
    if (fieldErrors[name as keyof FormAgricolaCreate]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormAgricolaCreate];
        return newErrors;
      });
    }
  };

  const handleProductorAutocompleteChange = (event: React.SyntheticEvent, newValue: Productor | null) => {
      setSelectedProductor(newValue);
      setFormData((prev) => ({ ...prev, productor_id: newValue?.productor_id || null }));
      setFieldErrors((prev: any) => ({ ...prev, productor_id: undefined }));
    };

  // Función de validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormAgricolaCreate, string>> = {};
    if (!formData.afiliacion) newErrors.afiliacion = 'Agregue una afiliación.';
    if (!formData.magap.trim()) newErrors.magap = 'El código MAGAP es requerido.';
    if (!formData.codigo.trim()) newErrors.codigo = 'El código es requerido.';
    // La validación ahora se basa en el productor_id directamente, que es el valor relevante
    if (formData.productor_id === null) newErrors.productor_id = 'Debe seleccionar un productor.';
    if (!formData.finca.trim()) newErrors.finca = 'La finca es requerida.';
    if (!formData.sector.trim()) newErrors.sector = 'La ubicación es requerida.';

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Maneja el envío del formulario
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
      // Se construye el objeto final para la API, que ahora contiene 'productor_id'
      const payload: AgricolaCreate = {
          magap: formData.magap,
          codigo: formData.codigo,
          productor_id: formData.productor_id!,
          finca: formData.finca,
          sector: formData.sector,
          afiliacion: formData.afiliacion,
      };
      
      await createAgricola(payload);
      onSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Error al crear el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
        <h2 className={`${lusitana.className} text-xl md:text-2xl font-bold mb-4 text-center`}>Nuevo Registro Agrícola</h2>
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <div className="mb-4">
              <label htmlFor="magap" className="mb-2 block text-sm font-medium">Código MAGAP</label>
              <div className="relative">
                <input type="text" id="magap" name="magap" placeholder='MAGAP' className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.magap} onChange={handleChange} disabled={isLoading} maxLength={10} />
                <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.magap && <p className="text-red-500 text-xs mt-1">{fieldErrors.magap}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="codigo" className="mb-2 block text-sm font-medium">Código Finca</label>
              <div className="relative">
                <input type="text" id="codigo" placeholder='Código de Finca' name="codigo" className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.codigo} onChange={handleChange} disabled={isLoading} maxLength={10} />
                <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.codigo && <p className="text-red-500 text-xs mt-1">{fieldErrors.codigo}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="productor_id" className="mb-2 block text-sm font-medium">Productor</label>
              <Autocomplete
                id="productor_id"
                options={productores}
                getOptionLabel={(option) => (option ? option.nombre_productor : '')}
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
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <UserIcon className="h-[18px] w-[18px] text-gray-500 mr-2" />,
                      endAdornment: (
                        <React.Fragment>
                          {productoresLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                    error={!!fieldErrors.productor_id}
                    helperText={fieldErrors.productor_id}
                    sx={{
                      '& .MuiInputBase-root': {
                        paddingLeft: '32px !important',
                        paddingTop: '3px !important',
                        paddingBottom: '3px !important',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                      },
                      '& .MuiInputBase-input': {
                        padding: '6px 0',
                      },
                      '& .MuiSvgIcon-root': {
                        marginLeft: '8px',
                      },
                      '& .MuiFormHelperText-root': {
                        marginLeft: 0,
                      },
                    }}
                  />
                )}
              />
              {fieldErrors.productor_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.productor_id}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="finca" className="mb-2 block text-sm font-medium">Finca</label>
              <div className="relative">
                <input type="text" id="finca" name="finca" placeholder='Nombre de Finca' className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.finca} onChange={handleChange} disabled={isLoading} maxLength={100} />
                <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.finca && <p className="text-red-500 text-xs mt-1">{fieldErrors.finca}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="sector" className="mb-2 block text-sm font-medium">Sector</label>
              <div className="relative">
                <input type="text" id="sector" name="sector" placeholder='Ubicación de Finca' className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm" value={formData.sector} onChange={handleChange} disabled={isLoading} maxLength={200} />
                <GlobeAltIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.sector && <p className="text-red-500 text-xs mt-1">{fieldErrors.sector}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="afiliacion" className="mb-2 block text-sm font-medium">Afiliación</label>
              <div className="relative">
                <select
                  id="afiliacion"
                  name="afiliacion"
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm"
                  value={formData.afiliacion}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  {Object.values(AfiliacionFinca).map((afiliacion) => (
                    <option key={afiliacion} value={afiliacion}>
                      {afiliacion}
                    </option>
                  ))}
                </select>
                <BriefcaseIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {fieldErrors.afiliacion && <p className="text-red-500 text-xs mt-1">{fieldErrors.afiliacion}</p>}
            </div>
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
