'use client';
import React, { useCallback, useState } from 'react';
import { Destino, Marca, VarianteMarcaCreate } from '@/lib/types';
import { createVarianteMarca, getDestinosList } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import ArchiveIcon from '@mui/icons-material/Archive';
import BusinessIcon from '@mui/icons-material/Business';
import { lusitana } from '@/components/ui/fonts';
import { Autocomplete, debounce, TextField } from '@mui/material';

type FormVarianteMarcaCreate = Omit<VarianteMarcaCreate, 'destino_id'> & {
  marca_id: number | null;
  destino_id: number | null;
};

interface CreateVarianteMarcaFormProps {
  marcaSeleccionada: Marca;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateVarianteMarcaForm: React.FC<CreateVarianteMarcaFormProps> = ({ marcaSeleccionada, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormVarianteMarcaCreate>({
    nombre: '', 
    marca_id: 0, destino_id: null,
  });
  
  const [marca, setMarca] = useState<Marca[]>([]);
  const [destino, setDestino] = useState<Destino[]>([]);
  const [marcaLoading, setMarcaLoading] = useState(false);
  const [destinoLoading, setDestinoLoading] = useState(false);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [selectedDestino, setSelectedDestino] = useState<Destino | null>(null);
  const [nombreVariante, setNombreVariante] = useState('');
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof VarianteMarcaCreate, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useAuth();

    const debouncedFetchDestino = useCallback(
      debounce(async (query: string) => {
        if (!token || query.length < 3) {
          setDestino([]);
          return;
        }
        setDestinoLoading(true);
        try {
          const data = await getDestinosList(query);
          setDestino(data);
        } catch (err) {
          console.error('Error buscando choferes', err);
          setDestino([]);
          setApiError('Error al buscar choferes.');
        } finally {
          setDestinoLoading(false);
        }
      }, 300),
      [token]
    );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNombreVariante(e.target.value);
        if (fieldErrors.nombre) {
            setFieldErrors(prev => ({ ...prev, nombre: undefined }));
        }
    };

    const handleDestinoAutocompleteChange = (event: React.SyntheticEvent, newValue: Destino | null) => {
      setSelectedDestino(newValue);
      setFormData((prev) => ({ ...prev, destino_id: newValue?.destino_id || null }));
      setFieldErrors((prev: any) => ({ ...prev, chofer_id: undefined }));
    };

  const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof VarianteMarcaCreate, string>> = {};
        if (!nombreVariante.trim()) newErrors.nombre = 'El nombre es requerido.';
        if (!selectedDestino) newErrors.destino_id = 'Debe seleccionar un destino.';
        
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

    const variantePayload: VarianteMarcaCreate = {
            nombre: nombreVariante,
            marca_id: marcaSeleccionada.marca_id,
            destino_id: selectedDestino!.destino_id, 
        };

    try {
      await createVarianteMarca(variantePayload);
      onSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Error al crear la marca.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">NUEVA VARIANTE</h2>
            {apiError && <p className="text-center text-red-500 mb-4">{apiError}</p>}
            
            <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-6">
                    <TextField
                        fullWidth
                        disabled
                        label="Marca Principal"
                        value={marcaSeleccionada.nombre}
                        InputProps={{
                            startAdornment: <BusinessIcon sx={{ color: 'action.disabled', mr: 1, my: 0.5 }} />,
                        }}
                        />
                    <TextField
                        fullWidth
                        id="nombre-create"
                        name="nombre"
                        label="Nombre de la Variante"
                        placeholder="Ej: Premium, Clásica, etc."
                        value={nombreVariante}
                        onChange={handleChange}
                        disabled={isLoading}
                        error={!!fieldErrors.nombre}
                        helperText={fieldErrors.nombre}
                        InputProps={{
                            startAdornment: <ArchiveIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />,
                        }}
                    />
                        <Autocomplete
                            options={destino}
                            getOptionLabel={(option) => option.nombre}
                            onInputChange={(event, value) => debouncedFetchDestino(value)}
                            onChange={(event, value) => setSelectedDestino(value)}
                            loading={destinoLoading}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Destino Final"
                                    placeholder="Buscar destino..."
                                    error={!!fieldErrors.destino_id}
                                    helperText={fieldErrors.destino_id}
                                />
                            )}
                        />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" variant="primary" isLoading={isLoading}>Crear Variante</Button>
                </div>
            </form>
        </div>
    </div>
  </div>
  );
};