// app/dashboard/agricolas/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Agricola, RolUsuario, PaginatedResponse } from '@/lib/types';
import { deleteAgricola, getAllAgricolas } from '@/lib/api';
import { AgricolasTable } from '@/components/dashboard/agricolas/AgricolasTable';
import { TableSkeleton } from '@/components/ui/skeletons';
import { useDebounce } from '@/hooks/useDebounce';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CreateAgricolaForm } from '@/components/dashboard/agricolas/CreateAgricolaForm';
import { Search } from '@/components/ui/search';
import { Pagination } from '@/components/ui/Pagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { Button, Fab, Tooltip } from '@mui/material';
import { EditAgricolaForm } from '@/components/dashboard/agricolas/EditAgricolaForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

export default function AgricolasPage() {
  const { token, user: currentUser } = useAuth();

  // 🔽 ESTADOS ACTUALIZADOS PARA MANEJAR LA PAGINACIÓN
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Agricola> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAgricola, setSelectedAgricola] = useState<Agricola | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  const canCreate = currentUser?.role === RolUsuario.ADMIN;
  const canEdit = currentUser?.role === RolUsuario.ADMIN;
  const canDelete = currentUser?.role === RolUsuario.ADMIN;

  const fetchAgricolas = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // 🔽 LLAMADA A LA API CON PAGINACIÓN Y BÚSQUEDA
      const data = await getAllAgricolas(currentPage, DEFAULT_PAGE_SIZE, debouncedSearchTerm);
      setPaginatedData(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los registros agrícolas.');
      setPaginatedData(null);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchAgricolas();
  }, [fetchAgricolas]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleEdit = (agricola: Agricola) => {
    setSelectedAgricola(agricola);
    setEditModalOpen(true);
  };

  const handleDelete = (agricola: Agricola) => {
    setSelectedAgricola(agricola);
    setDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    fetchAgricolas();
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const confirmDelete = async () => {
      if (!selectedAgricola || !token) return;
  
      setIsLoadingAction(true);
      try {
        await deleteAgricola(selectedAgricola.agricola_id);
        handleSuccess();
      } catch (err: any) {
        setError(err.message || "Error al eliminar el agricola.");
      } finally {
        setIsLoadingAction(false);
      }
    };

  return (
        // 1. Usa 'relative' para que el botón flotante se posicione correctamente
        <div className="w-full relative min-h-[calc(100vh-150px)]">
            
            {/* --- CABECERA RESPONSIVA --- */}
            {/* En móvil se apila (flex-col), en escritorio se alinea (md:flex-row) */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                {/* La barra de búsqueda ahora ocupa todo el ancho disponible */}
                <div className="flex-grow">
                    <Search 
                        placeholder="Buscar por finca, productor, MAGAP..." 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                {/* El botón de creación de escritorio se oculta en móvil */}
                {canCreate && (
                    <div className="hidden md:block">
                        <Button variant="contained" onClick={() => setCreateModalOpen(true)} startIcon={<PlusIcon className="h-4 w-4" />}
                        sx={{ backgroundColor: '#144836', '&:hover': { backgroundColor: '#45A049' } }}>
                            NUEVA AGRICOLA
                        </Button>
                    </div>
                )}
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            {loading ? (
                <div className="w-full mt-6"><TableSkeleton columns={5} /></div>
            ) : error ? (
                <div className="mt-6 text-center text-red-500">{error}</div>
            ) : paginatedData && paginatedData.items.length > 0 ? (
                // 3. CORRECCIÓN: Envuelve la tabla y la paginación en un div con ancho completo
                <div className="w-full">
                    <AgricolasTable 
                        agricolas={paginatedData.items} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                    <div className="mt-5 flex w-full justify-center">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={paginatedData.total_pages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            ) : (
                <div className="mt-6 text-center text-gray-500">No se encontraron registros agrícolas.</div>
            )}

            {/* --- 2. BOTÓN DE ACCIÓN FLOTANTE PARA MÓVIL --- */}
            {/* Se muestra solo en móvil (md:hidden) */}
            {canCreate && !isCreateModalOpen && !isEditModalOpen && !isDeleteModalOpen && (
                <div className="md:hidden">
                    <Tooltip title="Crear Nueva Agrícola">
                        <Fab
                            color="primary"
                            aria-label="add"
                            onClick={() => setCreateModalOpen(true)}
                            sx={{
                                position: 'fixed',
                                bottom: '5rem', // 80px (para no chocar con la barra de navegación)
                                right: '1.5rem', // 24px
                                backgroundColor: '#144836',
                                '&:hover': { backgroundColor: '#0f3a29' }
                            }}
                        >
                            <PlusIcon className="h-6 w-6" />
                        </Fab>
                    </Tooltip>
                </div>
            )}

            {isCreateModalOpen && <CreateAgricolaForm onClose={() => setCreateModalOpen(false)} onSuccess={handleSuccess} />}
            {isEditModalOpen && selectedAgricola && <EditAgricolaForm agricola={selectedAgricola} onClose={() => setEditModalOpen(false)} onSuccess={handleSuccess} />}
            {isDeleteModalOpen && selectedAgricola && (
                <ConfirmationModal
                title="Confirmar Eliminación"
                message={`¿Está seguro de que desea eliminar a ${selectedAgricola.finca}?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalOpen(false)}
                isLoading={isLoadingAction}
                />
            )}
        </div>
    );
}