'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Chofer, RolUsuario, PaginatedResponse } from '@/lib/types';
import { getAllChoferes, deleteChofer } from '@/lib/api';
import { ChoferesTable } from '@/components/dashboard/choferes/ChoferesTable';
import { TableSkeleton } from '@/components/ui/skeletons';
import { useDebounce } from '@/hooks/useDebounce';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CreateChoferForm } from '@/components/dashboard/choferes/CreateChoferForm';
import { EditChoferForm } from '@/components/dashboard/choferes/EditChoferForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Search } from '@/components/ui/search';
import { Pagination } from '@/components/ui/Pagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { Box, Button, Fab, Tooltip, Typography } from '@mui/material';

export default function ChoferesPage() {
  const { token, user: currentUser } = useAuth();

  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Chofer> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedChofer, setSelectedChofer] = useState<Chofer | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  // Nuevo estado para el motivo de la eliminación
  const [deleteReason, setDeleteReason] = useState('');
  
  const canCreate = currentUser?.role === RolUsuario.ADMIN;
  const canEdit = currentUser?.role === RolUsuario.ADMIN;
  const canDelete = currentUser?.role === RolUsuario.ADMIN;

  const fetchChoferes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllChoferes(currentPage, DEFAULT_PAGE_SIZE, debouncedSearchTerm);
      setPaginatedData(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los choferes.');
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, debouncedSearchTerm]);

  useEffect(() => { fetchChoferes(); }, [fetchChoferes]);
  useEffect(() => { if (currentPage !== 1) setCurrentPage(1); else fetchChoferes(); }, [debouncedSearchTerm]);

  const handleSuccess = () => {
    fetchChoferes();
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
  };

  const handleEdit = (chofer: Chofer) => {
    setSelectedChofer(chofer);
    setEditModalOpen(true);
  };

  const handleDelete = (chofer: Chofer) => {
    setSelectedChofer(chofer);
    setDeleteReason(''); // Limpiar motivo anterior
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedChofer || !token) return;

    if (!deleteReason || deleteReason.trim().length < 5) {
      alert("Por favor, ingrese un motivo de al menos 5 caracteres.");
      return;
    }

    setIsLoadingAction(true);
    try {
      await deleteChofer(selectedChofer.chofer_id, deleteReason);
      handleSuccess();
    } catch (err: any) {
      setError(err.message || "Error al eliminar el chofer.");
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <div className="w-full relative min-h-[calc(100vh-150px)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex-grow">
          <Search placeholder="Buscar por nombre, cedula o placa..." onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        {canCreate && (
        <div className="hidden md:block">
          <Button variant="contained" onClick={() => setCreateModalOpen(true)} startIcon={<PlusIcon className="h-4 w-4" />}
            sx={{ backgroundColor: '#144836', '&:hover': { backgroundColor: '#45A049' } }}>
            NUEVO CHOFER
          </Button>
        </div>
        )}
      </div>

      {loading ? (
        <div className="mt-6"><TableSkeleton columns={5} /></div>
      ) : error ? (
        <div className="mt-6 text-center text-red-500">{error}</div>
      ) : paginatedData && paginatedData.items.length > 0 ? (
        <div className="w-full">
          <ChoferesTable choferes={paginatedData.items} 
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
          </div>
      ) : (
        <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>No se encontraron choferes.</Typography>
      )}

      {canCreate && !isCreateModalOpen && !isEditModalOpen && !isDeleteModalOpen && (
        <div className="md:hidden">
            <Tooltip title="Crear Nuevo Chofer">
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={() => setCreateModalOpen(true)}
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
        </div>
      )}

      {isCreateModalOpen && <CreateChoferForm onClose={() => setCreateModalOpen(false)} onSuccess={handleSuccess} />}
      {isEditModalOpen && selectedChofer && <EditChoferForm chofer={selectedChofer} onClose={() => setEditModalOpen(false)} onSuccess={handleSuccess} />}
      
      {/* El modal de confirmación ahora vive en la página principal */}
      {isDeleteModalOpen && selectedChofer && (
        <ConfirmationModal
          title="Confirmar Eliminación"
          message={`¿Seguro que quieres eliminar a ${selectedChofer.nombres}?`}
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
              placeholder="Ej: Renuncia, duplicado, etc."
            />
          </div>
        </ConfirmationModal>
      )}
    </div>
  );
}