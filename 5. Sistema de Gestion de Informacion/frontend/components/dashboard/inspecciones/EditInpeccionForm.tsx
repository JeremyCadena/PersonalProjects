'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateInspeccion, getAllUsuariosForSelection, getJefesPlantaList, uploadInspectionImageApi, deleteInspectionImage, addImagesToInspeccion } from '@/lib/api'; 
import { Inspeccion, InspeccionUpdate, TipoInspeccion, Usuario, NivelRiesgo, JefePlanta, ImagenInspeccion } from '@/lib/types';
import { CalendarIcon, DocumentArrowUpIcon, PlusIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Autocomplete, TextField, debounce } from '@mui/material';
import { useDropzone } from 'react-dropzone';

interface EditInspeccionFormProps {
    inspeccion: Inspeccion;
    onClose: () => void;
    onSuccess: () => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const EditInspeccionForm: React.FC<EditInspeccionFormProps> = ({ inspeccion, onClose, onSuccess }) => {
    const { token } = useAuth();
    
    const [formData, setFormData] = useState({
        fecha: inspeccion.fecha.split('T')[0], // Formatear fecha para el input
        observacion: inspeccion.observacion || '',
        tipo_inspeccion: inspeccion.tipo_inspeccion,
        nivel_riesgo: inspeccion.nivel_riesgo,
    });

    const [inspectores, setInspectores] = useState<Usuario[]>([]);

    const [isDragActive, setIsDragActive] = useState(false);
    const [existingImages, setExistingImages] = useState<ImagenInspeccion[]>(inspeccion.imagenes);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [jefePlantaOptions, setJefePlantaOptions] = useState<JefePlanta[]>([]);
    const [selectedJefePlanta, setSelectedJefePlanta] = useState<JefePlanta | null>(inspeccion.jefe_planta_rel);

    const [fieldErrors, setFieldErrors] = useState<Partial<InspeccionUpdate>>({});

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
        const currentTotal = existingImages.length + newImages.length;
        const filesToAdd = imageFiles.slice(0, 5 - currentTotal);
        setNewImages(prev => [...prev, ...filesToAdd]);
        setIsDragActive(false);
    }, [existingImages, newImages]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] },
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
    });

    useEffect(() => {
        const loadInspectores = async () => {
            if (!token) return;
            try {
                const users = await getAllUsuariosForSelection();
                setInspectores(users);
            } catch (err) {
                console.error("Error al cargar inspectores", err);
                setError("No se pudo cargar la lista de inspectores.");
            }
        };
        loadInspectores();
    }, [token]);

    const debouncedFetchJefes = useCallback(
        debounce(async (query: string) => {
            if (query && query.length >= 3) {
                try {
                    const results = await getJefesPlantaList(query);
                    setJefePlantaOptions(results);
                } catch (err) { console.error("Error buscando jefes de planta", err); }
            } else {
                setJefePlantaOptions([]);
            }
        }, 500), []
    );
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const currentTotal = existingImages.length + newImages.length;
            const filesToAdd = Array.from(e.target.files).slice(0, 5 - currentTotal);
            setNewImages(prev => [...prev, ...filesToAdd]);
            e.target.value = '';
        }
    };
    
    const handleRemoveExistingImage = (idToRemove: number) => {
        setExistingImages(prev => prev.filter(img => img.imagen_id !== idToRemove));
        setImagesToDelete(prev => [...prev, idToRemove]);
    };

    const handleRemoveNewImage = (indexToRemove: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Paso 1: Borrar imágenes existentes marcadas
            if (imagesToDelete.length > 0) {
                await Promise.all(imagesToDelete.map(id => deleteInspectionImage(id)));
            }

            // Paso 2: Subir nuevas imágenes y añadirlas a la inspección
            if (newImages.length > 0) {
                const imageFormData = new FormData();
                newImages.forEach(file => imageFormData.append('files', file));
                const uploadResponse = await uploadInspectionImageApi(imageFormData);
                const newUrls = uploadResponse.map(item => item.url);
                await addImagesToInspeccion(inspeccion.inspeccion_id, newUrls);
            }

            // Paso 3: Actualizar los datos de texto de la inspección
            const updatePayload: InspeccionUpdate = {
                ...formData,
                jefe_planta_id: selectedJefePlanta ? selectedJefePlanta.jefe_planta_id : null,
            };
            
            await updateInspeccion(inspeccion.inspeccion_id, updatePayload);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al actualizar la inspección.');
        } finally {
            setLoading(false);
        }
    };

    const MAX_IMAGES = 5;
    const currentImageCount = existingImages.length + newImages.length;

     return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-center">Editar Registro de Inspección</h2>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
                
                <form id="edit-inspeccion-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Columna Izquierda */}
                        <div className="flex-1 space-y-4">
                             <div>
                                <label htmlFor="fecha_inspeccion-edit" className="block text-sm font-medium text-gray-700">Fecha de Inspección</label>
                                <div className="relative mt-1">
                                    <input type="date" id="fecha_inspeccion-edit" name="fecha" value={formData.fecha} onChange={handleFormChange}
                                        className="peer block w-full rounded-md border-gray-300 shadow-sm py-2 pl-10 text-sm" />
                                    <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Inspector a Cargo</label>
                                <input type="text" disabled value={inspeccion.inspector_rel.nombres_apellidos}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                            </div>
                            <div>
                                <label htmlFor="tipo_inspeccion-edit" className="block text-sm font-medium text-gray-700">Tipo de Inspección</label>
                                <select id="tipo_inspeccion-edit" name="tipo_inspeccion" value={formData.tipo_inspeccion} onChange={handleFormChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-700 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                >
                                    {Object.values(TipoInspeccion).map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jefe de Planta (Opcional)</label>
                                <Autocomplete
                                    options={jefePlantaOptions}
                                    getOptionLabel={(option) => `${option.nombres} ${option.apellidos}`}
                                    value={selectedJefePlanta}
                                    onChange={(event, newValue) => setSelectedJefePlanta(newValue)}
                                    onInputChange={(event, newInputValue) => debouncedFetchJefes(newInputValue)}
                                    isOptionEqualToValue={(option, value) => option.jefe_planta_id === value.jefe_planta_id}
                                    renderInput={(params) => <TextField {...params} placeholder="Buscar..." variant="outlined" size="small" />}
                                    className="mt-1 bg-white"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label htmlFor="tipo_inspeccion" className="block text-sm font-medium text-gray-700">Tipo de Inspección</label>
                                    <select id="tipo_inspeccion" name="tipo_inspeccion" value={formData.tipo_inspeccion} onChange={handleFormChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-700 focus:ring focus:ring-green-200 focus:ring-opacity-50">
                                        {Object.values(TipoInspeccion).map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="nivel_riesgo" className="block text-sm font-medium text-gray-700">Nivel de Riesgo</label>
                                    <select id="nivel_riesgo" name="nivel_riesgo" value={formData.nivel_riesgo} onChange={handleFormChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-700 focus:ring focus:ring-green-200 focus:ring-opacity-50">
                                        {Object.values(NivelRiesgo).map(nivel => (<option key={nivel} value={nivel}>{nivel}</option>))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha */}
                        <div className="w-full md:w-1/2 flex flex-col">
                            <div>
                                <label htmlFor="observacion-edit" className="block text-sm font-medium text-gray-700">Observación</label>
                                <textarea id="observacion-edit" name="observacion" value={formData.observacion} onChange={handleFormChange} rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                            </div>
                            <div className="flex-grow flex flex-col mt-4">
                                <label className="block text-sm font-medium text-gray-700">Imágenes ({currentImageCount}/{MAX_IMAGES})</label>
                                
                                {(existingImages.length > 0 || newImages.length > 0) && (
                                    <div className="mt-2 space-y-2 border rounded-md p-2 max-h-32 overflow-y-auto">
                                        {/* Imágenes Existentes */}
                                        {existingImages.map((img) => (
                                            <div key={img.imagen_id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/${img.url}`} alt="Evidencia" className="h-10 w-10 object-cover rounded" />
                                                    <p className="font-medium text-blue-600 text-sm truncate">Existente</p>
                                                </div>
                                                <button type="button" onClick={() => handleRemoveExistingImage(img.imagen_id)} className="p-1 text-gray-400 hover:text-red-600"><XMarkIcon className="h-5 w-5" /></button>
                                            </div>
                                        ))}
                                        {/* Nuevas Imágenes */}
                                        {newImages.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                                                 <div className="flex items-center gap-2 overflow-hidden">
                                                    <img src={URL.createObjectURL(file)} alt={file.name} className="h-10 w-10 object-cover rounded" />
                                                    <p className="font-medium text-gray-800 text-sm truncate">{file.name}</p>
                                                </div>
                                                <button type="button" onClick={() => handleRemoveNewImage(index)} className="p-1 text-gray-400 hover:text-red-600"><XMarkIcon className="h-5 w-5" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {currentImageCount < MAX_IMAGES && (
                                    <div {...getRootProps()} className={`mt-2 flex-grow flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${isDragActive ? 'border-green-700 bg-green-50' : 'border-gray-300 hover:border-green-600'}`}>
                                        <input {...getInputProps()} />
                                        <DocumentArrowUpIcon className="w-10 h-10 text-gray-400 mb-2" />
                                        <p className="text-gray-600 text-center"><span className="font-semibold text-green-700">Añadir más imágenes</span> o arrastra y suelta</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
                
                <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                    <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancelar</button>
                    <button type="submit" form="edit-inspeccion-form" disabled={loading} className="px-4 py-2 rounded-md bg-[#144836] text-white hover:bg-green-800 disabled:bg-green-300 flex items-center">
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};