'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createInspeccion, getAllUsuariosForSelection, getJefesPlantaList, uploadInspectionImageApi } from '@/lib/api'; 
import { InspeccionCreate, TipoInspeccion, Usuario, NivelRiesgo, JefePlanta } from '@/lib/types';
import { CalendarIcon, DocumentArrowUpIcon, DocumentIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { Autocomplete, TextField, debounce } from '@mui/material';
import { useDropzone } from 'react-dropzone';

interface CreateInspeccionFormProps {
    cargamentoId: number; 
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

export const CreateInspeccionForm: React.FC<CreateInspeccionFormProps> = ({ cargamentoId, onClose, onSuccess }) => {
    const { token, user: currentUser } = useAuth();
    
    // --- Estados del Formulario ---
    const [formData, setFormData] = useState({
        fecha: dayjs().format('YYYY-MM-DD'),
        observacion: '',
        tipo_inspeccion: TipoInspeccion.CANINA,
        nivel_riesgo: NivelRiesgo.BAJO,
        user_id: currentUser?.user_id || '',
    });
    
    const [inspectores, setInspectores] = useState<Usuario[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]); 
    const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    // --- Estados para el Autocomplete de Jefe de Planta ---
    const [jefePlantaOptions, setJefePlantaOptions] = useState<JefePlanta[]>([]);
    const [selectedJefePlanta, setSelectedJefePlanta] = useState<JefePlanta | null>(null);

    // --- Carga de Datos y Lógica de Búsqueda ---
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
                } catch (err) {
                    console.error("Error buscando jefes de planta", err);
                }
            } else {
                setJefePlantaOptions([]);
            }
        }, 500),
        []
    );
    
    // --- Handlers ---
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedPdf(e.target.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).slice(0, 5 - selectedImages.length);
            setSelectedImages(prev => [...prev, ...newFiles]);
            e.target.value = ''; 
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const MAX_IMAGES = 5;
    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Filtra solo archivos de imagen
        const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
        const newFiles = imageFiles.slice(0, 5 - selectedImages.length);
        setSelectedImages(prev => [...prev, ...newFiles]);
        setIsDragActive(false);
    }, [selectedImages]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] },
        maxFiles: MAX_IMAGES,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.user_id) {
            setError("Por favor, seleccione un inspector.");
            return;
        }
        setLoading(true);
        setError(null);
        
        // Crea el objeto FormData que se enviará a la API
        const submissionData = new FormData();
        submissionData.append('cargamento_id', String(cargamentoId));
        submissionData.append('fecha', formData.fecha);
        submissionData.append('observacion', formData.observacion);
        submissionData.append('tipo_inspeccion', formData.tipo_inspeccion);
        submissionData.append('nivel_riesgo', formData.nivel_riesgo);
        submissionData.append('user_id', String(formData.user_id));
        if (selectedJefePlanta) {
            submissionData.append('jefe_planta_id', String(selectedJefePlanta.jefe_planta_id));
        }

        // Condicionalmente, añade las imágenes O el PDF
        if (formData.tipo_inspeccion === TipoInspeccion.NOVEDAD && selectedPdf) {
            submissionData.append('documento_novedad', selectedPdf);
        } else {
            selectedImages.forEach(file => {
                submissionData.append('imagenes', file);
            });
        }

        try {
            // Llama a la nueva función de la API que maneja FormData
            await createInspeccion(submissionData);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al crear la inspección.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-center">Añadir Inspección</h2>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
                
                <form id="create-inspeccion-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
                    {/* --- Contenedor principal de 2 columnas --- */}
                    <div className="flex flex-col md:flex-row gap-8">

                        {/* === COLUMNA IZQUIERDA: DATOS DE LA INSPECCIÓN === */}
                        <div className="w-full md:w-1/2 space-y-4">
                            <div>
                                <label htmlFor="fecha_inspeccion" className="block text-sm font-medium text-gray-700">Fecha de Inspección</label>
                                <div className="relative mt-1">
                                    <input type="date" id="fecha_inspeccion" name="fecha" value={formData.fecha} onChange={handleFormChange}
                                           className="peer block w-full rounded-md border-gray-300 shadow-sm py-2 pl-10 text-sm" />
                                    <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="inspector" className="block text-sm font-medium text-gray-700">Inspector a Cargo</label>
                                <select id="inspector" name="user_id" value={formData.user_id} onChange={handleFormChange} required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-700 focus:ring focus:ring-green-200 focus:ring-opacity-50">
                                    <option value="" disabled>Seleccione un inspector</option>
                                    {inspectores.map((inspector) => (
                                        <option key={inspector.user_id} value={inspector.user_id}>{inspector.nombres_apellidos}</option>
                                    ))}
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
                                    renderInput={(params) => <TextField {...params} placeholder="Buscar por nombre o apellido..." variant="outlined" size="small" />}
                                    className="mt-1 bg-white"
                                />
                            </div>
                            {/* Campos de Tipo y Riesgo uno al lado del otro */}
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

                        {/* === COLUMNA DERECHA: HALLAZGOS Y EVIDENCIAS === */}
                        <div className="w-full md:w-1/2 flex flex-col">
                            <div>
                                <label htmlFor="observacion" className="block text-sm font-medium text-gray-700">Observación</label>
                                <textarea id="observacion" name="observacion" value={formData.observacion} onChange={handleFormChange} rows={4}
                                          className="mt-1 block w-full h-14 rounded-md border-gray-300 shadow-sm focus:border-green-700 focus:ring focus:ring-green-200 focus:ring-opacity-50"></textarea>
                            </div>

                            {formData.tipo_inspeccion === TipoInspeccion.NOVEDAD ? (
                                // --- SECCIÓN PARA SUBIR PDF ---
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Reporte de Novedad (PDF)</label>
                                    <div className="mt-2 flex items-center justify-center w-full p-6 border-2 border-dashed rounded-md">
                                        <input type="file" accept=".pdf" onChange={handlePdfChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                                    </div>
                                    {selectedPdf && (
                                        <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <DocumentIcon className="h-8 w-8 text-gray-500 flex-shrink-0" />
                                                <p className="font-medium text-gray-800 text-sm truncate">{selectedPdf.name}</p>
                                            </div>
                                            <button type="button" onClick={() => setSelectedPdf(null)} className="p-1 text-gray-400 hover:text-red-600 flex-shrink-0"><XMarkIcon className="h-5 w-5" /></button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Imágenes ({selectedImages.length}/{MAX_IMAGES})</label>
                                    {selectedImages.length < MAX_IMAGES && (
                                        <div {...getRootProps()} className={`mt-2 flex-grow flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${isDragActive ? 'border-green-700 bg-green-50' : 'border-gray-300 hover:border-green-600'}`}>
                                            <input {...getInputProps()}/>
                                            <DocumentArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                                            <p className="text-gray-600 text-center">
                                                <span className="font-semibold text-green-700">Haz clic para subir</span> o arrastra y suelta
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Soporta hasta {MAX_IMAGES} imágenes</p>
                                        </div>
                                    )}
                                    {selectedImages.length > 0 && (
                                        <div className="mt-2 space-y-2 border rounded-md p-2 max-h-44 overflow-y-auto">
                                            {selectedImages.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <img src={URL.createObjectURL(file)} alt={file.name} className="h-10 w-10 object-cover rounded flex-shrink-0" />
                                                        <p className="font-medium text-gray-800 text-sm truncate">{file.name}</p>
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveImage(index)} className="p-1 text-gray-400 hover:text-red-600 flex-shrink-0"><XMarkIcon className="h-5 w-5" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                            </div>
                            )}
                        </div>
                    </div>
                </form>
                
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 border-t pt-4">
                    <button type="button" onClick={onClose} disabled={loading} className="w-full sm:w-auto px-4 py-2 rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50">Cancelar</button>
                    <button type="submit" form="create-inspeccion-form" disabled={loading} className="w-full sm:w-auto px-4 py-2 rounded-md bg-[#144836] text-white hover:bg-green-800 disabled:bg-green-300 flex items-center justify-center">
                        {loading ? <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                        </> : 'Crear Inspección'}
                    </button>
                </div>
            </div>
        </div>
    );
};