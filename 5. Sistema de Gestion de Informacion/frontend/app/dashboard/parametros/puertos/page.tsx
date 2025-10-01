'use client';
import { Box, Button, Fab, Paper, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Search } from '@/components/ui/search';
import { TableSkeleton } from '@/components/ui/skeletons';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { PaginatedResponse, Puerto, RolUsuario } from '@/lib/types';
import { deletePuerto, getAllPuertos } from '@/lib/api';
import { PuertosTable } from '@/components/dashboard/parametros/puertos/PuertoTable';
import { EditPuertoForm } from '@/components/dashboard/parametros/puertos/EditPuertoForm';
import { CreatePuertoForm } from '@/components/dashboard/parametros/puertos/CreatePuertoForm';

export default function PuertosPage() {
    const { token, user: currentUser } = useAuth();
    const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Puerto> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
      
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedPuerto, setSelectedPuerto] = useState<Puerto | null>(null);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
      
    const canCreate = currentUser?.role === RolUsuario.ADMIN;
    const canEdit = currentUser?.role === RolUsuario.ADMIN;
    const canDelete = currentUser?.role === RolUsuario.ADMIN;
    
    const fetchPuertos = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
          const data = await getAllPuertos(currentPage, DEFAULT_PAGE_SIZE, debouncedSearchTerm);
          setPaginatedData(data);
        } catch (err: any) {
          setError(err.message || 'Error al cargar las marcas.');
        } finally {
          setLoading(false);
        }
      }, [token, currentPage, debouncedSearchTerm]);

    useEffect(() => { fetchPuertos(); }, [fetchPuertos]);
    useEffect(() => { if (currentPage !== 1) setCurrentPage(1); else fetchPuertos(); }, [debouncedSearchTerm]);
    
    const handleSuccess = () => {
    fetchPuertos();
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    };

    const handleEdit = (marca: Puerto) => {
        setSelectedPuerto(marca);
        setEditModalOpen(true);
      };
    
      const handleDelete = (marca: Puerto) => {
        setSelectedPuerto(marca);
        setDeleteModalOpen(true);
      };

    const confirmDelete = async () => {
        if (!selectedPuerto || !token) return;
    
        setIsLoadingAction(true);
        try {
            await deletePuerto(selectedPuerto.puerto_id);
            handleSuccess();
        } catch (err: any) {
            setError(err.message || "Error al eliminar el puerto.");
        } finally {
            setIsLoadingAction(false);
        }
    };

    return (
    <Box sx={{ width: '100%', padding: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
            <Search 
                placeholder="Buscar puerto..." 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
            {canCreate && (
              <div className="hidden md:block">
                <Button variant="outlined" onClick={() => setCreateModalOpen(true)} startIcon={<PlusIcon className="h-5 w-5" />}
                    sx={{color: '#ffffff', borderColor: '#144836', backgroundColor: '#144836',
                        '&:hover': {
                            backgroundColor: '#04932B', 
                            borderColor: '#ffffff',
                            color: '#ffffff'
                        },}}>
                        Crear Puerto
                </Button> </div>
            )}
        </Box>

      {loading ? (
        <TableSkeleton columns={3} />
      ) : error ? (
        <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>
      ) : paginatedData && paginatedData.items.length > 0 ? (
        <>
          <PuertosTable
            puertos={paginatedData.items}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              currentPage={currentPage}
              totalPages={paginatedData.total_pages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </Box>
        </>
      ) : (
        <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>No se encontraron choferes.</Typography>
      )}

      {canCreate && !isCreateModalOpen && !isEditModalOpen && !isDeleteModalOpen && (
        <div className="md:hidden">
            <Tooltip title="Crear Nuevo Productor">
            <Fab
                color="primary"
                aria-label="add"
                onClick={() => setCreateModalOpen(true)}
                sx={{ position: 'fixed', bottom: '5rem', right: '1.5rem', 
                  backgroundColor: '#144836', '&:hover': { backgroundColor: '#0f3a29' } }}>
                    <PlusIcon className="h-6 w-6" />
            </Fab>
            </Tooltip>
          </div>
      )}
      
      {isCreateModalOpen && <CreatePuertoForm onClose={() => setCreateModalOpen(false)} onSuccess={handleSuccess} />}
      {isEditModalOpen && selectedPuerto && <EditPuertoForm puerto={selectedPuerto} onClose={() => setEditModalOpen(false)} onSuccess={handleSuccess} />}
      
      {/* El modal de confirmación ahora vive en la página principal */}
      {isDeleteModalOpen && selectedPuerto && (
        <ConfirmationModal
          title="Confirmar Eliminación"
          message={`¿Seguro que quieres eliminar a ${selectedPuerto.nombre_puerto}?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModalOpen(false)}
          isLoading={isLoadingAction}
        >
        </ConfirmationModal>
      )}
    </Box>
  );
}