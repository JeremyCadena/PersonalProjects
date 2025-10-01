'use client';
import React, { useCallback, useState } from 'react';
import { Destino, Marca, VarianteMarca, VarianteMarcaUpdate } from '@/lib/types';
import { updateVarianteMarca, getDestinosList, getMarcaList } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import ArchiveIcon from '@mui/icons-material/Archive';
import { lusitana } from '@/components/ui/fonts';
import { Autocomplete, debounce, TextField } from '@mui/material';

interface EditVarianteMarcaFormProps {
  variante: VarianteMarca; // <-- Prop con los datos a editar
  onClose: () => void;
  onSuccess: () => void;
}

export const EditVarianteMarcaForm: React.FC<EditVarianteMarcaFormProps> = ({ variante, onClose, onSuccess }) => {
  const { token } = useAuth();

  // --- ESTADO INICIALIZADO CON LOS DATOS DE LA VARIANTE A EDITAR ---
  const [nombreVariante, setNombreVariante] = useState(variante.nombre);
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(variante.marca);
  const [selectedDestino, setSelectedDestino] = useState<Destino | null>(variante.destino);

  // --- Estados para las listas, carga y errores (igual que en el de creación) ---
  const [marcaOptions, setMarcaOptions] = useState<Marca[]>([]);
  const [destinoOptions, setDestinoOptions] = useState<Destino[]>([]);
  const [marcaLoading, setMarcaLoading] = useState(false);
  const [destinoLoading, setDestinoLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof VarianteMarcaUpdate, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Lógica de búsqueda (sin cambios) ---
  const debouncedFetchMarca = useCallback(
        debounce(async (query: string) => {
          if (!token || query.length < 3) {
            setMarcaOptions([]);
            return;
          }
          setMarcaLoading(true);
          try {
            const data = await getMarcaList(query);
            setMarcaOptions(data);
          } catch (err) {
            console.error('Error buscando marcas', err);
            setMarcaOptions([]);
            setApiError('Error al buscar marcas.');
          } finally {
            setMarcaLoading(false);
          }
        }, 300),
        [token]
      );
    
      const debouncedFetchDestino = useCallback(
        debounce(async (query: string) => {
          if (!token || query.length < 3) {
            setDestinoOptions([]);
            return;
          }
          setDestinoLoading(true);
          try {
            const data = await getDestinosList(query);
            setDestinoOptions(data);
          } catch (err) {
            console.error('Error buscando destinos', err);
            setDestinoOptions([]);
            setApiError('Error al buscar destinos.');
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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof VarianteMarcaUpdate, string>> = {};
    if (!nombreVariante.trim()) newErrors.nombre = 'El nombre es requerido.';
    if (!selectedMarca) newErrors.marca_id = 'Debe seleccionar una marca.';
    if (!selectedDestino) newErrors.destino_id = 'Debe seleccionar un destino.';
    
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- FUNCIÓN DE SUBMIT ADAPTADA PARA ACTUALIZAR ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!token) {
      setApiError("No autorizado.");
      return;
    }

    setIsLoading(true);
    setApiError(null);

    const variantePayload: VarianteMarcaUpdate = {
      nombre: nombreVariante,
      marca_id: selectedMarca!.marca_id,
      destino_id: selectedDestino!.destino_id,
    };

    try {
      // Llama a la función de actualizar, pasando el ID de la variante
      await updateVarianteMarca(variante.variacion_id, variantePayload);
      onSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Error al actualizar la variante.');
    } finally {
      setIsLoading(false);
    }
  };

   return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h2 className={`${lusitana.className} text-2xl font-bold mb-4 text-center`}>Editar Variante de Marca</h2>
        {apiError && <p className="text-center text-red-500 mb-4">{apiError}</p>}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <TextField
              fullWidth
              id="nombre-edit"
              name="nombre"
              label="Nombre de la Variante"
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
              options={destinoOptions}
              getOptionLabel={(option) => option.nombre}
              value={selectedDestino} 
              onInputChange={(event, value) => debouncedFetchDestino(value)}
              onChange={(event, value) => setSelectedDestino(value)}
              loading={destinoLoading}
              renderInput={(params) => (
                <TextField {...params} label="Destino Final" error={!!fieldErrors.destino_id} helperText={fieldErrors.destino_id} />
              )}
            />
          </div>

          {/* --- BOTONES ADAPTABLES --- */}
          {/* Se apilan en móvil y se alinean en escritorio */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-4 border-t">
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