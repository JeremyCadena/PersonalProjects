'use client';

import { Box, Button, Fab, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Destino, RolUsuario, PaginatedResponse } from '@/lib/types';
import { getAllDestinos, deleteDestino } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Search } from '@/components/ui/search';
import { TableSkeleton } from '@/components/ui/skeletons';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { DestinosTable } from '@/components/dashboard/parametros/destinos/DestinoTable';
import { CreateDestinoForm } from '@/components/dashboard/parametros/destinos/CreateDestinoForm';
import { EditDestinoForm } from '@/components/dashboard/parametros/destinos/EditDestinoForm';

export default function DestinosPage() {
    const { token, user: currentUser } = useAuth();
    const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Destino> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
      
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedDestino, setSelectedDestino] = useState<Destino | null>(null);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
      
    const canCreate = currentUser?.role === RolUsuario.ADMIN;
    const canEdit = currentUser?.role === RolUsuario.ADMIN;
    const canDelete = currentUser?.role === RolUsuario.ADMIN;
    
    const fetchDestinos = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
          const data = await getAllDestinos(currentPage, DEFAULT_PAGE_SIZE, debouncedSearchTerm);
          setPaginatedData(data);
        } catch (err: any) {
          setError(err.message || 'Error al cargar las destinos.');
        } finally {
          setLoading(false);
        }
      }, [token, currentPage, debouncedSearchTerm]);

    useEffect(() => { fetchDestinos(); }, [fetchDestinos]);
    useEffect(() => { if (currentPage !== 1) setCurrentPage(1); else fetchDestinos(); }, [debouncedSearchTerm]);
    
    const handleSuccess = () => {
    fetchDestinos();
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    };

    const handleEdit = (destino: Destino) => {
        setSelectedDestino(destino);
        setEditModalOpen(true);
      };
    
      const handleDelete = (destino: Destino) => {
        setSelectedDestino(destino);
        setDeleteModalOpen(true);
      };

    const confirmDelete = async () => {
        if (!selectedDestino || !token) return;
    
        setIsLoadingAction(true);
        try {
            await deleteDestino(selectedDestino.destino_id);
            handleSuccess();
        } catch (err: any) {
            setError(err.message || "Error al eliminar el chofer.");
        } finally {
            setIsLoadingAction(false);
        }
    };

    return (
    <Box sx={{ width: '100%', padding: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
        <Search 
          placeholder="Buscar destino..." 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        {canCreate && (
          <div className="hidden md:block">
          <Button variant="outlined" onClick={() => setCreateModalOpen(true)}
            startIcon={<PlusIcon className="h-5 w-5" />}
            sx={{
                color: '#ffffff',
                borderColor: '#144836',
                backgroundColor: '#144836',
                '&:hover': {
                    backgroundColor: '#04932B', 
                    borderColor: '#ffffff',
                    color: '#ffffff'
                },}} >
                Crear Destino
        </Button></div>
        )}
        </Box>

      {loading ? (
        <TableSkeleton columns={2} />
      ) : error ? (
        <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>
      ) : paginatedData && paginatedData.items.length > 0 ? (
        <>
          <DestinosTable
            destinos={paginatedData.items}
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

      {isCreateModalOpen && <CreateDestinoForm onClose={() => setCreateModalOpen(false)} onSuccess={handleSuccess} />}
      {isEditModalOpen && selectedDestino && <EditDestinoForm destino={selectedDestino} onClose={() => setEditModalOpen(false)} onSuccess={handleSuccess} />}
      
      {/* El modal de confirmación ahora vive en la página principal */}
      {isDeleteModalOpen && selectedDestino && (
        <ConfirmationModal
          title="Confirmar Eliminación"
          message={`¿Seguro que quieres eliminar a ${selectedDestino.nombre}?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModalOpen(false)}
          isLoading={isLoadingAction}
        >
        </ConfirmationModal>
      )}
    </Box>
  );
}