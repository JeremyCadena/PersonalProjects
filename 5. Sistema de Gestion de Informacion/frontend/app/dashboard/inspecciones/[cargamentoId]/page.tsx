'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import { useAuth } from '@/hooks/useAuth';
import { Cargamento, TipoVehiculo, Inspeccion, RolUsuario } from '@/lib/types';
import { downloadCargamentoPdf, getCargamentoById, getInspeccionesByCargamentoId } from '@/lib/api';
import { lusitana } from '@/components/ui/fonts';
import { ArrowLeftIcon, TruckIcon } from '@heroicons/react/24/outline';
import AddIcon from '@mui/icons-material/Add';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { CreateInspeccionForm } from '@/components/dashboard/inspecciones/CreateInspeccionForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { deleteInspeccion } from '@/lib/api';
import { Box, Typography, CircularProgress, Alert, Button as MuiButton } from '@mui/material';
import { PiTruckDuotone, PiShippingContainerFill, PiTruckTrailerFill } from "react-icons/pi";
import { EditInspeccionForm } from '@/components/dashboard/inspecciones/EditInpeccionForm';
import { InspeccionAccordion } from '@/components/dashboard/inspecciones/InspeccionAccordion';
import { RiskBadge } from '@/components/dashboard/inspecciones/RiskBadge';
import { useTheme, useMediaQuery } from '@mui/material';

export const dynamic = 'force-dynamic';

export default function CargamentoProductPage() {
    const params = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter(); 
    const cargamentoId = params.cargamentoId as string;
    const { token, user: currentUser } = useAuth();

    const [cargamento, setCargamento] = useState<Cargamento | null>(null);
    const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingAction, setIsLoadingAction] = useState(false);

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    
    const [selectedInspeccion, setSelectedInspeccion] = useState<Inspeccion | null>(null);
    const [deleteReason, setDeleteReason] = useState('');
    const primerDetalle = cargamento?.detalles?.[0];
    const destino = primerDetalle?.variante_marca_rel?.destino;

    const canManageInspecciones = currentUser?.role === RolUsuario.ADMIN || currentUser?.role === RolUsuario.INSPECTOR;

    const fetchCargamentoAndInspecciones = useCallback(async () => {
        if (!token) {
            setError("No autorizado. Por favor, inicia sesión.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const fetchedCargamento = await getCargamentoById(parseInt(cargamentoId));
            setCargamento(fetchedCargamento);

            const responseInspecciones = await getInspeccionesByCargamentoId(parseInt(cargamentoId));
            const inspeccionesArray = Array.isArray(responseInspecciones?.items) 
                ? responseInspecciones.items 
                : [];

            const sortedInspecciones = inspeccionesArray.sort((a, b) => 
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );
            setInspecciones(sortedInspecciones);

        } catch (err: any) {
            setError(err.message || `Error al cargar los datos.`);
        } finally {
            setLoading(false);
        }
    }, [token, cargamentoId]);

    useEffect(() => {
        fetchCargamentoAndInspecciones();
    }, [fetchCargamentoAndInspecciones]);

    const handleSuccess = () => {
        setCreateModalOpen(false);
        setEditModalOpen(false);
        setDeleteModalOpen(false);
        setSelectedInspeccion(null); // <-- Limpia la inspección seleccionada
        fetchCargamentoAndInspecciones();
    };

    const handleEditClick = (inspeccion: Inspeccion) => {
        setSelectedInspeccion(inspeccion); // <-- Usa el estado unificado
        setEditModalOpen(true);
    };

    const handleDeleteClick = (inspeccion: Inspeccion) => {
        setSelectedInspeccion(inspeccion); // <-- Usa el estado unificado
        setDeleteReason('');
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!token || !selectedInspeccion) return;
        if (!deleteReason || deleteReason.trim().length < 5) {
          alert("Por favor, ingrese un motivo de al menos 5 caracteres.");
          return;
        }
        setIsLoadingAction(true);
        try {
          await deleteInspeccion(selectedInspeccion.inspeccion_id, deleteReason);
          handleSuccess();
        } catch (err: any) {
          setError(err.message || "Error al eliminar el cargamento.");
        } finally {
          setIsLoadingAction(false);
        }
    };


    if (loading) {
        return (
            <div className="w-full px-4 md:px-6 py-8 text-center">
                <p className={`${lusitana.className} text-xl text-gray-700`}>Cargando detalles del cargamento y sus inspecciones...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full px-4 md:px-6 py-8 text-center bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className={`${lusitana.className} text-xl`}>Error:</p>
                <p>{error}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center mx-auto"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" /> Volver
                </button>
            </div>
        );
    }

    const isContenedor = cargamento?.tipo_vehiculo === TipoVehiculo.CONTENEDOR;
    const isCamion = cargamento?.tipo_vehiculo === TipoVehiculo.CAMION;
    const isFurgon = cargamento?.tipo_vehiculo === TipoVehiculo.FURGON;

    let VehicleIconComponent: React.ElementType;
    if (isContenedor) {
        VehicleIconComponent = PiShippingContainerFill;
    } else if (isCamion) {
        VehicleIconComponent = PiTruckDuotone;
    } else if (isFurgon) {
        VehicleIconComponent = PiTruckTrailerFill;
    } else {
        VehicleIconComponent = TruckIcon; // Fallback general
    }

    const handleDownloadReport = async (templateName: string, reportTitle: string) => {
        if (!token || !cargamento) return;
        setIsLoadingAction(true);
        try {
            const blob = await downloadCargamentoPdf(cargamento.cargamento_id, templateName);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportTitle}_${cargamento.agricola_rel.finca}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoadingAction(false);
        }
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
    if (error) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;
    if (!cargamento) return <Box sx={{ p: 4 }}><Alert severity="warning">No se encontró el cargamento.</Alert></Box>;

    return (
        <>
            <div className="flex items-center mb-6">
                <button
                    onClick={() => router.back()} // <--- CAMBIO AQUÍ: Usa router.back()
                    className="mr-4 p-2 rounded-full hover:bg-gray-100"
                >
                    <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                </button>
                <h1 className={`${lusitana.className} text-xl md:text-3xl font-bold text-gray-900 flex-grow`}>
                    DETALLE DE INSPECCIONES
                </h1>
            </div>

            {/* === SECCIÓN PRINCIPAL: Banner y Detalles del Cargamento === */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 border border-gray-200">
                {/* Banner */}
                <div className="w-full h-30 flex rounded-t-lg">
                    <img
                        src="/BANNER-INSPECCIONES.png"
                        alt="Banner Registro de Carga"
                        className="w-full h-full object-scale-down" />
                </div>

                <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 w-full md:w-52 flex flex-col items-center justify-center bg-gray-50 p-4 rounded-md border">
                        <VehicleIconComponent className="w-16 h-16 md:w-24 md:h-24 text-green-700 mb-2" />
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 text-center mb-1">
                            {cargamento?.agricola_rel?.finca || 'Finca Desconocida'}
                        </h3>
                        <p className="text-gray-600 text-sm text-center">
                            {cargamento?.exportadora_rel?.nombre || 'N/A'}
                        </p>
                    </div>

                    {/* Columna Derecha: Información Detallada del Cargamento */}
                    <div className="flex-grow p-4 rounded-md"> {/* flex-grow para ocupar el resto del espacio */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-gray-700 text-base">
                            <p><span className="font-semibold">CHOFER:</span> {cargamento?.chofer_rel ? `${cargamento.chofer_rel.nombres} ${cargamento.chofer_rel.apellidos}` : 'N/A'}</p>
                            <p><span className="font-semibold">TELEFONO:</span> {cargamento?.chofer_rel ? `${cargamento.chofer_rel.telefono}` : 'N/A'}</p>
                            {isContenedor && (
                                <p><span className="font-semibold">NUMERO DE CONTENEDOR:</span> {cargamento?.codigo_contenedor || 'N/A'}</p>
                            )}
                            {!isContenedor && (
                                <p><span className="font-semibold">TIPO DE VEHICULO:</span> {cargamento?.tipo_vehiculo || 'N/A'}</p>
                            )}
                            <p><span className="font-semibold">PLACA VEHICULAR:</span> {cargamento?.chofer_rel?.placa_cabezal || 'N/A'}</p>
                            <p><span className="font-semibold">MARCA: </span> 
                                {cargamento.detalles && cargamento.detalles.length > 0 
                                    ? `${cargamento.detalles[0].variante_marca_rel?.marca?.nombre || ''} ${cargamento.detalles[0].variante_marca_rel?.nombre || ''}` 
                                    : 'N/A'}</p>
                            <p><span className="font-semibold">PUERTO:</span> {cargamento?.puerto_rel.nombre_puerto || 'N/A'}</p>
                            <p><span className="font-semibold">VAPOR: </span> 
                                {cargamento.detalles && cargamento.detalles.length > 0 
                                    ? `${cargamento.detalles[0].vapor || 'N/A'}` : 'N/A'}</p>
                            <p><span className="font-semibold">NÚMERO DE VAPOR: </span> 
                                {cargamento.detalles && cargamento.detalles.length > 0 
                                    ? `${cargamento.detalles[0].numero_vapor || 'N/A'}` : 'N/A'}</p>
                            {isContenedor && (
                                <p><span className="font-semibold">DISPOSITIVO SATÉLITAL:</span> {cargamento ? `${cargamento.rastreo_satelital_contenedor}` : 'N/A'}</p>
                            )}
                            {!isContenedor && (
                                <p><span className="font-semibold">DISPOSITIVO SATÉLITAL:</span> {cargamento?.rastreo_satelital || 'N/A'}</p>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">DESTINO:</span>
                                {destino ? (
                                    <>
                                        <span>{destino.nombre}</span>
                                        <RiskBadge 
                                            destinoName={destino.nombre}
                                            riesgo={destino.riesgo_historico} 
                                        />
                                    </>
                                ) : (
                                    <span>N/A</span>
                                )}
                            </div>
                            {inspecciones && inspecciones.length > 0 && (
                                <>
                                    <p>
                                        <span className="font-semibold">INSPECTOR: </span>
                                        {inspecciones[0].inspector_rel?.nombres_apellidos || 'No asignado'}
                                    </p>
                                    <p>
                                        <span className="font-semibold">JEFE DE PLANTA: </span>
                                        {inspecciones[0].jefe_planta_rel ? `${inspecciones[0].jefe_planta_rel.nombres} ${inspecciones[0].jefe_planta_rel.apellidos}` : 'N/A'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenedor para los botones de Añadir Inspección y Generar Reporte */}
           <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, // Se apila en móvil
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3, 
                borderTop: 1, 
                borderColor: 'divider', 
                pt: 3,
                gap: 2 // Espacio entre elementos
            }}>
                <Typography variant="h5" className={lusitana.className} fontWeight="bold">
                    Inspecciones Realizadas
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                    <MuiButton 
                        variant="outlined" 
                        fullWidth // Ocupa todo el ancho disponible en su contenedor
                        onClick={() => handleDownloadReport('inspecciones_report.html', 'INSPECCIONES')}
                        disabled={isLoadingAction} 
                        startIcon={<DownloadForOfflineIcon />}
                        sx={{ borderColor: '#144836', color: '#144836', '&:hover': { borderColor: '#45A049', backgroundColor: '#E6F4EA' } }}
                    >
                        Reporte
                    </MuiButton>
                    <MuiButton 
                        variant="contained"
                        fullWidth
                        onClick={() => setCreateModalOpen(true)} 
                        startIcon={<AddIcon />}
                        sx={{ backgroundColor: '#144836', '&:hover': { backgroundColor: '#45A049' } }}
                    >
                        Inspección
                    </MuiButton>
                </Box>
            </Box>

            {/* Lista de Inspecciones (Acordeón) */}
           <div className="space-y-3">
              {inspecciones.length > 0 ? (
                inspecciones.map((inspeccion) => (
                  <InspeccionAccordion
                    key={inspeccion.inspeccion_id}
                    inspeccion={inspeccion}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))
              ) : (
                <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
                  No hay inspecciones registradas para este cargamento.
                </Typography>
              )}
            </div>

            {isCreateModalOpen && <CreateInspeccionForm cargamentoId={cargamento.cargamento_id} onClose={() => setCreateModalOpen(false)} onSuccess={handleSuccess} />}
            {isEditModalOpen && selectedInspeccion && <EditInspeccionForm inspeccion={selectedInspeccion} onClose={() => setEditModalOpen(false)} onSuccess={handleSuccess} />}
            {isDeleteModalOpen && selectedInspeccion && (
                <ConfirmationModal
                          title="Confirmar Eliminación"
                          message={`¿Seguro que quieres eliminar este registro de inspección ${selectedInspeccion.tipo_inspeccion}?`}
                          onConfirm={confirmDelete}
                          onCancel={() => setDeleteModalOpen(false)}
                          isLoading={isLoadingAction}
                        >
                          <div className="mt-4">
                            <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-700">
                              Motivo (requerido)
                            </label>
                            <textarea
                              id="deleteReason"
                              rows={3}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                              value={deleteReason}
                              onChange={(e) => setDeleteReason(e.target.value)}
                              placeholder="Ej: Mal registro, duplicado, etc."
                            />
                          </div>
                        </ConfirmationModal>
            )}
        </>
    );
}