'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Cargamento, CargamentoUpdate, Agricola, Chofer, Exportadora, Puerto, TipoVehiculo,
  CargamentoDetalleCreate, VarianteMarca, FullCargamentoUpdatePayload, } from '@/lib/types';
import { updateCargamentoWithDetalles, getAgricolasList, getVariantesMarcaList,
  getAllExportadoras, getAllPuertos, searchChoferes, } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { lusitana } from '@/components/ui/fonts';
import { XCircleIcon} from 'lucide-react';
import { Autocomplete, debounce, TextField, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

type FormCargamentoUpdate = Partial<CargamentoUpdate>;
type FormDetalle = CargamentoDetalleCreate & {
  id: number;
  detalle_id?: number;
  initialVariant?: VarianteMarca; 
};

interface EditCargamentoFormProps {
  cargamentoToEdit: Cargamento;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditCargamentoForm: React.FC<EditCargamentoFormProps> = ({ cargamentoToEdit, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormCargamentoUpdate>({});
  const [detalles, setDetalles] = useState<FormDetalle[]>([]);
  const [agricolas, setAgricolas] = useState<Agricola[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [exportadoras, setExportadoras] = useState<Exportadora[]>([]);
  const [puertos, setPuertos] = useState<Puerto[]>([]);
  const [variantes, setVariantes] = useState<VarianteMarca[]>([]);
  
  const [selectedAgricola, setSelectedAgricola] = useState<Agricola | null>(null);
  const [selectedChofer, setSelectedChofer] = useState<Chofer | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchDependencies = async () => {
        if (!token) return;
        try {
            const [exportadorasRes, puertosRes] = await Promise.all([
                getAllExportadoras(1, 100),
                getAllPuertos(1, 100),
            ]);
            setExportadoras(exportadorasRes.items);
            setPuertos(puertosRes.items);
        } catch (err: any) {
            setApiError(`Error al cargar datos: ${err.message}`);
        }
    };
    fetchDependencies();
  }, [token]);

  useEffect(() => {
    if (cargamentoToEdit && exportadoras.length > 0 && puertos.length > 0) {
      setFormData({
        agricola_id: cargamentoToEdit.agricola_id,
        chofer_id: cargamentoToEdit.chofer_id,
        exportadora_id: cargamentoToEdit.exportadora_id,
        puerto_id: cargamentoToEdit.puerto_id,
        fecha: cargamentoToEdit.fecha.split('T')[0],
        tipo_vehiculo: cargamentoToEdit.tipo_vehiculo,
        rastreo_satelital: cargamentoToEdit.rastreo_satelital,
        codigo_contenedor: cargamentoToEdit.codigo_contenedor,
        rastreo_satelital_contenedor: cargamentoToEdit.rastreo_satelital_contenedor,
        sello_contenedor: cargamentoToEdit.sello_contenedor,
      });

      setSelectedAgricola(cargamentoToEdit.agricola_rel);
      setSelectedChofer(cargamentoToEdit.chofer_rel);

      if (cargamentoToEdit.detalles) {
        const initialDetalles = cargamentoToEdit.detalles.map(d => ({
          id: d.detalle_id,
          detalle_id: d.detalle_id,
          variacion_id: d.variacion_id,
          vapor: d.vapor,
          numero_vapor: d.numero_vapor,
          initialVariant: d.variante_marca_rel,
        }));
        setDetalles(initialDetalles);
      }
    }
  }, [cargamentoToEdit, exportadoras, puertos]);

  const debouncedFetchAgricolas = useCallback(debounce(async (query: string) => {
    if (!token || query.length < 3) { setAgricolas([]); return; }
    try {
        const data = await getAgricolasList(query);
        setAgricolas(data);
    } catch (err) { console.error('Error buscando agrícolas', err); }
  }, 300), [token]);

  const debouncedFetchChoferes = useCallback(debounce(async (query: string) => {
    if (!token || query.length < 3) { setChoferes([]); return; }
    try {
        const data = await searchChoferes(query);
        setChoferes(data);
    } catch (err) { console.error('Error buscando choferes', err); }
  }, 300), [token]);

  const debouncedFetchVariantes = useCallback(debounce(async (query: string) => {
    if (!token || query.length < 2) { setVariantes([]); return; }
    try {
        const data = await getVariantesMarcaList(query);
        setVariantes(data);
    } catch (err) { console.error('Error buscando variantes', err); }
  }, 300), [token]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any>) => {
        const { name, value } = e.target;
        if (name) {
            const newState = { ...formData, [name]: value };
            if (name === 'tipo_vehiculo') {
                newState.rastreo_satelital = '';
                newState.codigo_contenedor = '';
                newState.rastreo_satelital_contenedor = '';
                newState.sello_contenedor = '';
            }
            setFormData(newState);
        }
    };

  const handleSelectChange = (event: SelectChangeEvent<number | string>, name: keyof FormCargamentoUpdate) => {
    setFormData(prev => ({ ...prev, [name]: event.target.value as number }));
  };
  
    const handleAgricolaAutocompleteChange = (event: React.SyntheticEvent, newValue: Agricola | null) => {
        setSelectedAgricola(newValue);
        setFormData((prev) => ({ ...prev, agricola_id: newValue?.agricola_id}));
        setFieldErrors((prev: any) => ({ ...prev, agricola_id: undefined }));
    };

  const handleChoferAutocompleteChange = (event: React.SyntheticEvent, newValue: Chofer | null) => {
    setSelectedChofer(newValue);
    setFormData(prev => ({ ...prev, chofer_id: newValue?.chofer_id}));
  };
  
  const handleAddDetalle = () => {
    setDetalles([...detalles, { id: Date.now(), variacion_id: 0, vapor: '', numero_vapor: '' }]);
  };

  const handleRemoveDetalle = (idToRemove: number) => {
    setDetalles(detalles.filter(d => d.id !== idToRemove));
  };

  const handleDetalleChange = (id: number, field: keyof FormDetalle, value: any) => {
    setDetalles(detalles.map(d => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setApiError('No autorizado.'); return; }

    setIsLoading(true);
    setApiError(null);

    const updatePayload: FullCargamentoUpdatePayload = {
      cargamento: formData,
      detalles: detalles.map(({ id, initialVariant, detalle_id, ...rest }) => rest),
    };

    try {
      await updateCargamentoWithDetalles(cargamentoToEdit.cargamento_id, updatePayload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setApiError(err.message || 'Error al actualizar el cargamento.');
    } finally {
      setIsLoading(false);
    }
  };

  const isContenedor = formData.tipo_vehiculo === TipoVehiculo.CONTENEDOR;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-50 p-6 rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <h2 className={`${lusitana.className} text-xl md:text-3xl font-bold text-gray-800`}>EDITAR REGISTRO</h2>
        </div>
        {apiError && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{apiError}</div>}
        <form id="edit-cargamento-form" onSubmit={handleSubmit} noValidate className="flex-grow overflow-y-auto pr-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* --- COLUMNA IZQUIERDA --- */}
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Información General</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <TextField type="date" name="fecha" label="Fecha" value={formData.fecha || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                            <FormControl fullWidth>
                                <InputLabel>Tipo de Vehículo</InputLabel>
                                <Select name="tipo_vehiculo" value={formData.tipo_vehiculo || ''} label="Tipo de Vehículo" onChange={handleChange}>
                                    {Object.values(TipoVehiculo).map(tipo => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </div>
                        {isContenedor ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <TextField name="codigo_contenedor" label="ID Contenedor" inputProps={{maxLength: 12 }} value={formData.codigo_contenedor || ''} onChange={handleChange} />
                                <TextField name="rastreo_satelital_contenedor" label="Dispositivo Satélital" inputProps={{maxLength: 8 }} value={formData.rastreo_satelital_contenedor || ''} onChange={handleChange} />
                                <TextField name="sello_contenedor" label="Sello de Botella" inputProps={{maxLength: 12 }} value={formData.sello_contenedor || ''} onChange={handleChange} />
                            </div>
                        ) : (
                            <TextField name="rastreo_satelital" label="Dispositivo Satelital" value={formData.rastreo_satelital || ''} onChange={handleChange} fullWidth inputProps={{maxLength: 8 }}/>
                        )}
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                         <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Detalles de Cargamento</h3>
                         <div className="space-y-4">
                            <Autocomplete value={selectedAgricola} options={agricolas} getOptionLabel={(o) => o.finca} onInputChange={(e,v) => debouncedFetchAgricolas(v)} onChange={handleAgricolaAutocompleteChange} renderInput={(params) => <TextField {...params} label="Agrícola" />} />
                            <Autocomplete value={selectedChofer} options={choferes} getOptionLabel={(o) => `${o.nombres} ${o.apellidos}`} onInputChange={(e,v) => debouncedFetchChoferes(v)} onChange={handleChoferAutocompleteChange} renderInput={(params) => <TextField {...params} label="Chofer" />} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormControl fullWidth>
                                    <InputLabel>Exportadora</InputLabel>
                                    <Select name="exportadora_id" value={formData.exportadora_id || ''} label="Exportadora" onChange={(e) => handleSelectChange(e, 'exportadora_id')}>
                                        {exportadoras.map(e => <MenuItem key={e.exportadora_id} value={e.exportadora_id}>{e.nombre}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel>Puerto</InputLabel>
                                    <Select name="puerto_id" value={formData.puerto_id || ''} label="Puerto" onChange={(e) => handleSelectChange(e, 'puerto_id')}>
                                        {puertos.map(p => <MenuItem key={p.puerto_id} value={p.puerto_id}>{p.nombre_puerto}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </div>
                         </div>
                    </div>
                </div>

                {/* --- COLUMNA DERECHA --- */}
                <div className="bg-white p-4 rounded-lg border flex flex-col min-h-[300px]">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Marcas Asociadas</h3>
                    <div className="space-y-4 flex-grow overflow-y-auto">
                        {detalles.map((detalle, index) => (
                            <div key={detalle.id} className="p-3 border rounded-md bg-gray-50/50">
                                <Autocomplete 
                                    defaultValue={detalle.initialVariant}
                                    options={variantes} 
                                    getOptionLabel={(o) => o.marca && o.destino ? `${o.marca.nombre} ${o.nombre} (${o.destino.nombre})` : o.nombre} 
                                    getOptionKey={(o)=>o.variacion_id} 
                                    isOptionEqualToValue={(o,v)=>o.variacion_id === v.variacion_id} 
                                    onInputChange={(e,v)=>debouncedFetchVariantes(v)} 
                                    onChange={(e, val) => handleDetalleChange(detalle.id, 'variacion_id', val?.variacion_id || null)} 
                                    renderInput={(params) => <TextField {...params} label={`Marca #${index + 1}`} />} 
                                />
                                <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3">
                                    <TextField label="Vapor" value={detalle.vapor || ''} onChange={(e) => handleDetalleChange(detalle.id, 'vapor', e.target.value)} size="small" fullWidth/>
                                    <TextField label="N° Vapor" value={detalle.numero_vapor || ''} onChange={(e) => handleDetalleChange(detalle.id, 'numero_vapor', e.target.value)} size="small" fullWidth/>
                                    <Button variant="danger" onClick={() => handleRemoveDetalle(detalle.id)} className="p-2 h-10 flex-shrink-0">
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
            <Button type="submit" form="edit-cargamento-form" variant="primary" isLoading={isLoading}>
              Guardar Cambios
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
};