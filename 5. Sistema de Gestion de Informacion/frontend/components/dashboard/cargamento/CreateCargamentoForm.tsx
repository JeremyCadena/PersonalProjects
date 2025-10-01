'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CargamentoCreate, Agricola, Chofer, Exportadora, Puerto, TipoVehiculo, CargamentoDetalleCreate,
  VarianteMarca, FullCargamentoPayload, } from '@/lib/types';
import { createCargamentoWithDetalles, getAgricolasList, getVariantesMarcaList, getAllExportadoras,
  getAllPuertos, searchChoferes, } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { lusitana } from '@/components/ui/fonts';
import { Autocomplete, debounce, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { PlusCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

// Tipo para el formulario, compatible con CargamentoCreate
type FormCargamentoCreate = Omit<CargamentoCreate, 'agricola_id' | 'chofer_id' | 'exportadora_id' | 'puerto_id' | 'inspecciones_count'> & {
  agricola_id: number | null;
  chofer_id: number | null;
  exportadora_id: number | null;
  puerto_id: number | null;
};

type FormDetalle = Omit<CargamentoDetalleCreate, 'variacion_id'> & {
    id: number; // ID temporal para el renderizado en React
    variacion_id: number | null; // Permite que el campo esté vacío inicialmente
};
interface CreateCargamentoFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCargamentoForm: React.FC<CreateCargamentoFormProps> = ({ onClose, onSuccess }) => {
  const initialFormData: FormCargamentoCreate = {
    agricola_id: null, chofer_id: null, exportadora_id: null, puerto_id: null,
    fecha: dayjs().format('YYYY-MM-DD'),
    tipo_vehiculo: TipoVehiculo.CAMION,
    rastreo_satelital: '', codigo_contenedor: '', rastreo_satelital_contenedor: '', sello_contenedor: '',
  };

  const [formData, setFormData] = useState<FormCargamentoCreate>(initialFormData);
  const [detalles, setDetalles] = useState<FormDetalle[]>([
  { id: Date.now(), variacion_id: null, vapor: '', numero_vapor: '' }
  ]);
  const [agricolas, setAgricolas] = useState<Agricola[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [exportadoras, setExportadoras] = useState<Exportadora[]>([]);
  const [puertos, setPuertos] = useState<Puerto[]>([]);
  const [variantes, setVariantes] = useState<VarianteMarca[]>([]);
  
  const [agricolasLoading, setAgricolasLoading] = useState(false);
  const [choferesLoading, setChoferesLoading] = useState(false);
  const [variantesLoading, setVariantesLoading] = useState(false); 
  const [dependenciesLoading, setDependenciesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedAgricola, setSelectedAgricola] = useState<Agricola | null>(null);
  const [selectedChofer, setSelectedChofer] = useState<Chofer | null>(null);
  const [selectedExportadora, setSelectedExportadora] = useState<Exportadora | null>(null);
  const [selectedPuerto, setSelectedPuerto] = useState<Puerto | null>(null);
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const { token } = useAuth();

  // Carga inicial de exportadoras y puertos
  useEffect(() => {
    if (!token) {
      setApiError('No autorizado. Por favor, inicia sesión.');
      setDependenciesLoading(false);
      return;
    }

    const fetchDependencies = async () => {
      setDependenciesLoading(true);
      try {
        const [exportadorasRes, puertosRes] = await Promise.all([
          getAllExportadoras(1, 10),
          getAllPuertos(1, 10),
        ]);
        setExportadoras(exportadorasRes.items);
        setPuertos(puertosRes.items);
      } catch (err: any) {
        setApiError(`Error al cargar datos: ${err.message}`);
      } finally {
        setDependenciesLoading(false);
      }
    };
    fetchDependencies();
  }, [token]);

  // Búsquedas con debounce
  const debouncedFetchAgricolas = useCallback(
    debounce(async (query: string) => {
      if (!token || query.length < 3) {
        setAgricolas([]);
        return;
      }
      setAgricolasLoading(true);
      try {
        const data = await getAgricolasList(query);
        setAgricolas(data);
      } catch (err) {
        console.error('Error buscando agrícolas', err);
        setAgricolas([]);
        setApiError('Error al buscar agrícolas.');
      } finally {
        setAgricolasLoading(false);
      }
    }, 300),
    [token]
  );

  const debouncedFetchChoferes = useCallback(
    debounce(async (query: string) => {
      if (!token || query.length < 3) {
        setChoferes([]);
        return;
      }
      setChoferesLoading(true);
      try {
        const data = await searchChoferes(query);
        setChoferes(data);
      } catch (err) {
        console.error('Error buscando choferes', err);
        setChoferes([]);
        setApiError('Error al buscar choferes.');
      } finally {
        setChoferesLoading(false);
      }
    }, 300),
    [token]
  );
  
  const debouncedFetchVariantes = useCallback(debounce(async (query: string) => {
    if (!token || query.length < 3) {
      setVariantes([]);
      return;
    }
    setVariantesLoading(true);
    try {
      const data = await getVariantesMarcaList(query);
      setVariantes(data);
    } catch (err) {
      console.error('Error buscando variantes', err);
      setVariantes([]);
    } finally {
      setVariantesLoading(false);
    }
  }, 300), [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === 'tipo_vehiculo') {
        newState.rastreo_satelital = '';
        newState.codigo_contenedor = '';
        newState.rastreo_satelital_contenedor = '';
        newState.sello_contenedor = '';
      }
      return newState;
    });
    setFieldErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const handleAddDetalle = () => {
    setDetalles([...detalles, { id: Date.now(), variacion_id: null, vapor: '', numero_vapor: '' }]);
  };

  const handleRemoveDetalle = (idToRemove: number) => {
    setDetalles(detalles.filter(d => d.id !== idToRemove));
  };
  
  const handleDetalleChange = (id: number, field: keyof FormDetalle, value: any) => {
    setDetalles(detalles.map(d => (d.id === id ? { ...d, [field]: value } : d)));
    const newErrors = { ...fieldErrors };
    if (newErrors.detalles?.[id]?.[field]) {
        delete newErrors.detalles[id][field];
        if (Object.keys(newErrors.detalles[id]).length === 0) delete newErrors.detalles[id];
        if (Object.keys(newErrors.detalles).length === 0) delete newErrors.detalles;
        setFieldErrors(newErrors);
    }
  };
  const handleAutocompleteChange = (name: keyof FormCargamentoCreate) => (event: React.SyntheticEvent, newValue: any) => {
      let selectedValue: number | null = null;
      if(newValue){
          switch (name) {
              case 'exportadora_id':
                  selectedValue = newValue.exportadora_id
                  setSelectedExportadora(newValue)
                  break;
              case 'puerto_id':
                  selectedValue = newValue.puerto_id
                  setSelectedPuerto(newValue)
                  break;
          }
      } else {
          if (name === 'exportadora_id') setSelectedExportadora(null)
          if (name === 'puerto_id') setSelectedPuerto(null)
      }
      setFormData((prev) => ({ ...prev, [name]: selectedValue }));
      setFieldErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const handleAgricolaAutocompleteChange = (event: React.SyntheticEvent, newValue: Agricola | null) => {
    setSelectedAgricola(newValue);
    setFormData((prev) => ({ ...prev, agricola_id: newValue?.agricola_id || null }));
    setFieldErrors((prev: any) => ({ ...prev, agricola_id: undefined }));
  };

  const handleChoferAutocompleteChange = (event: React.SyntheticEvent, newValue: Chofer | null) => {
    setSelectedChofer(newValue);
    setFormData((prev) => ({ ...prev, chofer_id: newValue?.chofer_id || null }));
    setFieldErrors((prev: any) => ({ ...prev, chofer_id: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};
    if (!formData.agricola_id) newErrors.agricola_id = 'Debe seleccionar un registro agrícola.';
    if (!formData.chofer_id) newErrors.chofer_id = 'Debe seleccionar un chofer.';
    if (!formData.exportadora_id) newErrors.exportadora_id = 'Debe seleccionar una exportadora.';
    if (!formData.puerto_id) newErrors.puerto_id = 'Debe seleccionar un puerto.';
    
    if (formData.tipo_vehiculo === TipoVehiculo.CAMION || formData.tipo_vehiculo === TipoVehiculo.FURGON) {
        if (!formData.rastreo_satelital?.trim()) {
            newErrors.rastreo_satelital = 'El dispositivo satelital es requerido.';
        }
    } else if (formData.tipo_vehiculo === TipoVehiculo.CONTENEDOR) {
        if (!formData.codigo_contenedor?.trim()) {
            newErrors.codigo_contenedor = 'El ID del contenedor es requerido.';
        }
        if (!formData.rastreo_satelital_contenedor?.trim()) {
            newErrors.rastreo_satelital_contenedor = 'El dispositivo satelital es requerido.';
        }
    }

    if (detalles.length === 0) {
        newErrors.detalles_general = 'Debe añadir al menos un detalle de cargamento.';
    } else {
        newErrors.detalles = {};
        detalles.forEach(detalle => {
            if (!detalle.variacion_id) {
                if (!newErrors.detalles[detalle.id]) newErrors.detalles[detalle.id] = {};
                newErrors.detalles[detalle.id].variacion_id = 'Seleccione una marca.';
            }
        });
        if (Object.keys(newErrors.detalles).length === 0) {
            delete newErrors.detalles;
        }
    }
    
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!token) {
        setApiError('No autorizado.');
        return;
    }

    setIsLoading(true);
    setApiError(null);

    const cargamentoPayload: CargamentoCreate = {
      agricola_id: formData.agricola_id!,
      chofer_id: formData.chofer_id!,
      exportadora_id: formData.exportadora_id!,
      puerto_id: formData.puerto_id!,
      fecha: formData.fecha,
      tipo_vehiculo: formData.tipo_vehiculo,
      rastreo_satelital: formData.tipo_vehiculo !== TipoVehiculo.CONTENEDOR ? formData.rastreo_satelital || null : null,
      codigo_contenedor: isContenedor ? formData.codigo_contenedor || null : null,
      rastreo_satelital_contenedor: isContenedor ? formData.rastreo_satelital_contenedor || null : null,
      sello_contenedor: isContenedor ? formData.sello_contenedor || null : null,
    };

    const detallesPayload: CargamentoDetalleCreate[] = detalles.map(d => ({
      variacion_id: d.variacion_id!,
      vapor: d.vapor || null,
      numero_vapor: d.numero_vapor || null,
    }));
    
    const fullPayload: FullCargamentoPayload = {
      cargamento: cargamentoPayload,
      detalles: detallesPayload,
    };

    try {
      await createCargamentoWithDetalles(fullPayload);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setApiError(err.message || 'Error al crear el cargamento.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setFormData(initialFormData);
    setDetalles([]);
    setSelectedAgricola(null);
    setSelectedChofer(null);
    setSelectedExportadora(null);
    setSelectedPuerto(null);
    setFieldErrors({});
    setApiError(null);
    onClose();
  };

  const handleSelectChange = (event: SelectChangeEvent<number>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value as number }));
    setFieldErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };
  
  const isContenedor = formData.tipo_vehiculo === TipoVehiculo.CONTENEDOR;
  
   return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* CORRECCIÓN: Modal más ancho con max-w-7xl */}
      <div className="bg-gray-50 p-6 rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <h2 className={`${lusitana.className} text-xl md:text-2xl font-bold text-gray-800`}>NUEVO CARGAMENTO</h2>
        </div>

        {apiError && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{apiError}</div>}

        <form id="create-cargamento-form" onSubmit={handleSubmit} noValidate className="flex-grow overflow-y-auto pr-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Sección: Información General y del Vehículo */}
                    <div className="bg-white p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Información General</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <TextField type="date" name="fecha" label="Fecha" value={formData.fecha} onChange={(e: any) => handleChange(e)} InputLabelProps={{ shrink: true }} error={!!fieldErrors.fecha} helperText={fieldErrors.fecha} />
                            <FormControl fullWidth error={!!fieldErrors.tipo_vehiculo}>
                                <InputLabel>Tipo de Vehículo</InputLabel>
                                <Select name="tipo_vehiculo" value={formData.tipo_vehiculo} label="Tipo de Vehículo" onChange={(e: any) => handleChange(e)}>
                                    {Object.values(TipoVehiculo).map(tipo => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </div>
                        {isContenedor ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <TextField name="codigo_contenedor" label="ID Contenedor" inputProps={{maxLength: 12 }} value={formData.codigo_contenedor} onChange={(e: any) => handleChange(e)} error={!!fieldErrors.codigo_contenedor} helperText={fieldErrors.codigo_contenedor} />
                                <TextField name="rastreo_satelital_contenedor" label="Dispositivo Satélital" inputProps={{maxLength: 8 }} value={formData.rastreo_satelital_contenedor} onChange={(e: any) => handleChange(e)} error={!!fieldErrors.rastreo_satelital_contenedor} helperText={fieldErrors.rastreo_satelital_contenedor} />
                                <TextField name="sello_contenedor" label="Sello de Botella" inputProps={{maxLength: 12 }} value={formData.sello_contenedor} onChange={(e: any) => handleChange(e)} />
                            </div>
                        ) : (
                            <TextField name="rastreo_satelital" label="Dispositivo Satelital" value={formData.rastreo_satelital} onChange={(e: any) => handleChange(e)} fullWidth inputProps={{maxLength: 8 }} error={!!fieldErrors.rastreo_satelital} helperText={fieldErrors.rastreo_satelital}/>
                        )}
                    </div>

                    {/* Sección: Actores Involucrados */}
                    <div className="bg-white p-4 rounded-lg border">
                         <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Detalles de Cargamento</h3>
                         <div className="space-y-4">
                            <Autocomplete options={agricolas} getOptionLabel={(o) => o.finca} onInputChange={(e,v) => debouncedFetchAgricolas(v)} onChange={handleAgricolaAutocompleteChange} renderInput={(params) => <TextField {...params} label="Agrícola" placeholder="Buscar finca..." error={!!fieldErrors.agricola_id} helperText={fieldErrors.agricola_id} />} />
                            <Autocomplete options={choferes} getOptionLabel={(o) => `${o.nombres} ${o.apellidos}`} onInputChange={(e,v) => debouncedFetchChoferes(v)} onChange={handleChoferAutocompleteChange} renderInput={(params) => <TextField {...params} label="Chofer" placeholder="Buscar por nombre o cédula..." error={!!fieldErrors.chofer_id} helperText={fieldErrors.chofer_id} />} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormControl fullWidth error={!!fieldErrors.exportadora_id}>
                                    <InputLabel>Exportadora</InputLabel>
                                    <Select name="exportadora_id" value={formData.exportadora_id || ''} label="Exportadora" onChange={handleSelectChange}>
                                        {exportadoras.map(e => <MenuItem key={e.exportadora_id} value={e.exportadora_id}>{e.nombre}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth error={!!fieldErrors.puerto_id}>
                                    <InputLabel>Puerto</InputLabel>
                                    <Select name="puerto_id" value={formData.puerto_id || ''} label="Puerto" onChange={handleSelectChange}>
                                        {puertos.map(p => <MenuItem key={p.puerto_id} value={p.puerto_id}>{p.nombre_puerto}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                         </div>
                    </div>
                </div>

                {/* --- COLUMNA DERECHA: DETALLES --- */}
                <div className="bg-white p-4 rounded-lg border flex flex-col min-h-[300px]">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Marcas Asociadas</h3>
                    {fieldErrors.detalles_general && <p className="text-red-500 text-xs mb-2">{fieldErrors.detalles_general}</p>}
                    <div className="space-y-4 flex-grow overflow-y-auto">
                        {detalles.map((detalle, index) => (
                            <div key={detalle.id} className="p-3 border rounded-md bg-gray-50/50">
                                <Autocomplete 
                                    options={variantes} 
                                    getOptionLabel={(o) => o.marca && o.destino ? `${o.marca.nombre} ${o.nombre} (${o.destino.nombre})` : o.nombre} 
                                    getOptionKey={(o)=>o.variacion_id} 
                                    isOptionEqualToValue={(o,v)=>o.variacion_id === v.variacion_id} 
                                    onInputChange={(e,v)=>debouncedFetchVariantes(v)} 
                                    onChange={(e, val) => handleDetalleChange(detalle.id, 'variacion_id', val?.variacion_id || null)} 
                                    renderInput={(params) => <TextField {...params} label={`Marca #${index + 1}`} placeholder="Buscar..." error={!!fieldErrors.detalles?.[detalle.id]?.variacion_id} helperText={fieldErrors.detalles?.[detalle.id]?.variacion_id} />} 
                                />
                                <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3">
                                    <TextField label="Vapor" value={detalle.vapor || ''} onChange={(e) => handleDetalleChange(detalle.id, 'vapor', e.target.value)} size="small" fullWidth/>
                                    <TextField label="N° Vapor" value={detalle.numero_vapor || ''} onChange={(e) => handleDetalleChange(detalle.id, 'numero_vapor', e.target.value)} size="small" fullWidth/>
                                    <Button variant="danger" onClick={() => handleRemoveDetalle(detalle.id)} className="p-2 h-10">
                                        <XCircleIcon className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                     </div>
                     <Button type="button" variant="secondary" onClick={handleAddDetalle} className="mt-4 w-full">
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        Añadir Marca
                    </Button>
                </div>
            </div>
        </form>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t">
          <Button type="submit" form="create-cargamento-form" variant="primary" isLoading={isLoading} className="w-full sm:w-auto">Crear Cargamento</Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">Cancelar</Button>
        </div>
      </div>
    </div>
  );
};