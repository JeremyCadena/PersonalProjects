'use client';

import { Box, Button, Typography, Paper, Grid, CircularProgress, Tooltip, Fab } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Marca, RolUsuario, PaginatedResponse, VarianteMarca } from '@/lib/types';
import { getAllMarcas, deleteMarca, getVariantesByMarcaId, deleteVarianteMarca } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Search } from '@/components/ui/search';
import { TableSkeleton } from '@/components/ui/skeletons';
import { CreateMarcaForm } from '@/components/dashboard/parametros/marcas/CreateMarcaForm';
import { EditMarcaForm } from '@/components/dashboard/parametros/marcas/EditMarcaForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { MarcasTable } from '@/components/dashboard/parametros/marcas/MarcasTable';
import { Pagination } from '@/components/ui/Pagination';
import { CreateVarianteMarcaForm } from '@/components/dashboard/parametros/variantes_marca/CreateVarianteForm';
import { EditVarianteMarcaForm } from '@/components/dashboard/parametros/variantes_marca/EditVarianteForm';

export default function MarcasPage() {
    const { token, user: currentUser } = useAuth();

    // --- ESTADOS PARA MARCAS ---
    const [paginatedMarcas, setPaginatedMarcas] = useState<PaginatedResponse<Marca> | null>(null);
    const [marcasLoading, setMarcasLoading] = useState(true);
    const [marcasError, setMarcasError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // --- ESTADO UNIFICADO PARA SELECCIÓN Y EXPANSIÓN ---
    const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);

    // --- ESTADO UNIFICADO PARA TODOS LOS MODALES ---
    const [modalState, setModalState] = useState({
        createMarca: false,
        editMarca: null as Marca | null,
        deleteMarca: null as Marca | null,
        createVariante: false,
        editVariante: null as VarianteMarca | null,
        deleteVariante: null as VarianteMarca | null,
    });
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    
    const canManage = currentUser?.role === RolUsuario.ADMIN;

    // --- LÓGICA DE OBTENCIÓN DE DATOS ---
    const fetchMarcas = useCallback(async (page = 1) => {
        if (!token) return;
        setMarcasLoading(true);
        setMarcasError(null);
        try {
            const data = await getAllMarcas(page, DEFAULT_PAGE_SIZE, debouncedSearchTerm);
            setPaginatedMarcas(data);

            if (!selectedMarca && data.items.length > 0) {
                setSelectedMarca(data.items[0]);
            } else if (selectedMarca && !data.items.some(m => m.marca_id === selectedMarca.marca_id)) {
                setSelectedMarca(data.items.length > 0 ? data.items[0] : null);
            } else if (data.items.length === 0) {
                setSelectedMarca(null);
            }
        } catch (err: any) {
            setMarcasError(err.message || 'Error al cargar las marcas.');
        } finally {
            setMarcasLoading(false);
        }
    }, [token, debouncedSearchTerm]);

    useEffect(() => { fetchMarcas(currentPage); }, [currentPage, fetchMarcas]);
    useEffect(() => { 
        setCurrentPage(1);
        fetchMarcas(1); 
    }, [debouncedSearchTerm]);

    const handleMarcaSelect = (marca: Marca) => {
        setSelectedMarca(prevSelected => 
            prevSelected?.marca_id === marca.marca_id ? null : marca
        );
    };

    const handleSuccess = () => {
        fetchMarcas(currentPage);
        setModalState({ createMarca: false, editMarca: null, deleteMarca: null, createVariante: false, editVariante: null, deleteVariante: null });
    };

    const confirmDeleteMarca = async () => {
        if (!modalState.deleteMarca) return;
        setIsLoadingAction(true);
        try {
            await deleteMarca(modalState.deleteMarca.marca_id);
            setSelectedMarca(null); 
            handleSuccess();
        } catch (err: any) {
            console.error("Error al eliminar marca:", err);
        } finally {
            setIsLoadingAction(false);
        }
    };
    
    const confirmDeleteVariante = async () => {
        if (!modalState.deleteVariante) return;
        setIsLoadingAction(true);
        try {
            await deleteVarianteMarca(modalState.deleteVariante.variacion_id);
            handleSuccess();
        } catch (err: any) {
            console.error("Error al eliminar variante:", err);
        } finally {
            setIsLoadingAction(false);
        }
    };

    const anyModalOpen = modalState.createMarca || !!modalState.editMarca || !!modalState.deleteMarca || 
                         modalState.createVariante || !!modalState.editVariante || !!modalState.deleteVariante;

    return (
        <Box sx={{ width: '100%', padding: { xs: 2, md: 3 }, position: 'relative', minHeight: 'calc(100vh - 150px)' }}>
          <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                gap: 2
            }}>
                <Box sx={{ flexGrow: 1, width: '100%' }}>
                    <Search placeholder="Buscar por nombre de marca..." onChange={(e) => setSearchTerm(e.target.value)} />
                </Box>
              {canManage && (
                <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
                    <Button variant="contained" onClick={() => setModalState(prev => ({...prev, createMarca: true}))} startIcon={<PlusIcon className="h-4 w-4" />}
                    sx={{color: '#ffffff', borderColor: '#144836', backgroundColor: '#144836',
                        '&:hover': {
                            backgroundColor: '#04932B', 
                            borderColor: '#ffffff',
                            color: '#ffffff'
                        },}}>
                        NUEVA MARCA
                    </Button>
                </Box>
              )}
            </Box>
          
            <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                {marcasLoading ? <TableSkeleton columns={3} /> : marcasError ? (
                    <Typography color="error" align="center" p={4}>{marcasError}</Typography>
                ) : paginatedMarcas && paginatedMarcas.items.length > 0 ? (
                    <MarcasTable
                        marcas={paginatedMarcas.items}
                        onRowClick={handleMarcaSelect}
                        expandedMarcaId={selectedMarca?.marca_id}
                        onEdit={(marca) => setModalState(prev => ({ ...prev, editMarca: marca }))}
                        onDelete={(marca) => setModalState(prev => ({ ...prev, deleteMarca: marca }))}
                        canEdit={canManage}
                        canDelete={canManage}
                        onCreateVariante={() => setModalState(prev => ({ ...prev, createVariante: true }))}
                        onEditVariante={(variante) => setModalState(prev => ({ ...prev, editVariante: variante }))}
                        onDeleteVariante={(variante) => setModalState(prev => ({ ...prev, deleteVariante: variante }))}
                    />
                ) : (
                    <Typography p={4} textAlign="center">No se encontraron marcas.</Typography>
                )}
            </Paper>

            {paginatedMarcas && paginatedMarcas.total_pages > 1 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Pagination currentPage={currentPage} totalPages={paginatedMarcas.total_pages} onPageChange={setCurrentPage} />
                </Box>
            )}

            {canManage && !anyModalOpen && (
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <Tooltip title="Crear Nueva Marca">
                        <Fab
                            color="primary"
                            aria-label="add"
                            onClick={() => setModalState(prev => ({...prev, createMarca: true}))}
                            sx={{
                                position: 'fixed',
                                bottom: '5rem',
                                right: '1.5rem',
                                backgroundColor: '#144836',
                                '&:hover': { backgroundColor: '#0f3a29' }
                            }}
                        >
                            <PlusIcon className="h-6 w-6" />
                        </Fab>
                    </Tooltip>
                </Box>
            )}

            {/* --- Modales --- */}
            {modalState.createMarca && <CreateMarcaForm onClose={() => setModalState(prev => ({...prev, createMarca: false}))} onSuccess={handleSuccess} />}
            {modalState.editMarca && <EditMarcaForm marca={modalState.editMarca} onClose={() => setModalState(prev => ({...prev, editMarca: null}))} onSuccess={handleSuccess} />}
            {modalState.deleteMarca && (
                <ConfirmationModal
                    title="Confirmar Eliminación de Marca"
                    message={`¿Seguro que quieres eliminar la marca "${modalState.deleteMarca.nombre}"? Todas sus variantes también serán eliminadas.`}
                    onConfirm={confirmDeleteMarca}
                    onCancel={() => setModalState(prev => ({...prev, deleteMarca: null}))}
                    isLoading={isLoadingAction}
                />
            )}
            
            {modalState.createVariante && selectedMarca && <CreateVarianteMarcaForm marcaSeleccionada={selectedMarca} onClose={() => setModalState(prev => ({...prev, createVariante: false}))} onSuccess={handleSuccess} />}
            {modalState.editVariante && <EditVarianteMarcaForm variante={modalState.editVariante} onClose={() => setModalState(prev => ({...prev, editVariante: null}))} onSuccess={handleSuccess} />}
            {modalState.deleteVariante && (
                <ConfirmationModal
                    title="Confirmar Eliminación de Variante"
                    message={`¿Seguro que quieres eliminar la variante "${modalState.deleteVariante.nombre}"?`}
                    onConfirm={confirmDeleteVariante}
                    onCancel={() => setModalState(prev => ({...prev, deleteVariante: null}))}
                    isLoading={isLoadingAction}
                />
            )}
        </Box>
    );
}