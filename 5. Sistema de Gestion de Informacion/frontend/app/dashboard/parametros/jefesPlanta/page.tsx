'use client';

import { Box, Button, Fab, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RolUsuario, PaginatedResponse, JefePlanta } from '@/lib/types';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Search } from '@/components/ui/search';
import { TableSkeleton } from '@/components/ui/skeletons';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { deleteJefePlanta, getAllJefesPlanta } from '@/lib/api';
import { JefesTable } from '@/components/dashboard/parametros/jefesPlanta/JefesTable';
import { CreateJefesForm } from '@/components/dashboard/parametros/jefesPlanta/CreateJefesForm';
import { EditJefesForm } from '@/components/dashboard/parametros/jefesPlanta/EditJefesForm';

export default function JefesPage() {
    const { token, user: currentUser } = useAuth();
    const [paginatedData, setPaginatedData] = useState<PaginatedResponse<JefePlanta> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
      
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedJefes, setSelectedJefes] = useState<JefePlanta | null>(null);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
      
    const canCreate = currentUser?.role === RolUsuario.ADMIN;
    const canEdit = currentUser?.role === RolUsuario.ADMIN;
    const canDelete = currentUser?.role === RolUsuario.ADMIN;
    
    const fetchJefess = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
          const data = await getAllJefesPlanta(currentPage, DEFAULT_PAGE_SIZE, debouncedSearchTerm);
          setPaginatedData(data);
        } catch (err: any) {
          setError(err.message || 'Error al cargar los jefes de planta.');
        } finally {
          setLoading(false);
        }
      }, [token, currentPage, debouncedSearchTerm]);

    useEffect(() => { fetchJefess(); }, [fetchJefess]);
    useEffect(() => { if (currentPage !== 1) setCurrentPage(1); else fetchJefess(); }, [debouncedSearchTerm]);
    
    const handleSuccess = () => {
    fetchJefess();
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    };

    const handleEdit = (jefe_planta: JefePlanta) => {
        setSelectedJefes(jefe_planta);
        setEditModalOpen(true);
      };
    
      const handleDelete = (jefe_planta: JefePlanta) => {
        setSelectedJefes(jefe_planta);
        setDeleteModalOpen(true);
      };

    const confirmDelete = async () => {
        if (!selectedJefes || !token) return;
    
        setIsLoadingAction(true);
        try {
            await deleteJefePlanta(selectedJefes.jefe_planta_id);
            handleSuccess();
        } catch (err: any) {
            setError(err.message || "Error al eliminar el jefe de planta.");
        } finally {
            setIsLoadingAction(false);
        }
    };

    return (
      <div className="w-full relative min-h-[calc(100vh-150px)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex-grow">
            <Search placeholder="Buscar..." onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {canCreate && (
          <div className="hidden md:block">
            <Button variant="contained" onClick={() => setCreateModalOpen(true)} startIcon={<PlusIcon className="h-4 w-4" />}
              sx={{ color: '#ffffff', borderColor: '#144836', 
                backgroundColor: '#144836',
                '&:hover': {
                    backgroundColor: '#04932B', 
                    borderColor: '#ffffff',
                    color: '#ffffff'
                },}} >
                NUEVO JEFE
            </Button>
          </div>
          )}
        </div>
        {loading ? (
          <div className="mt-6"><TableSkeleton columns={2} /></div>
        ) : error ? (
          <div className="mt-6 text-center text-red-500">{error}</div>
        ) : paginatedData && paginatedData.items.length > 0 ? (
          <div className="w-full">
            <JefesTable
              jefes_planta={paginatedData.items}
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
          <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>No se encontraron jefes de planta.</Typography>
        )}

        {canCreate && !isCreateModalOpen && !isEditModalOpen && !isDeleteModalOpen && (
        <div className="md:hidden">
              <Tooltip title="Crear Nuevo Jefe de Planta">
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

        {isCreateModalOpen && <CreateJefesForm onClose={() => setCreateModalOpen(false)} onSuccess={handleSuccess} />}
        {isEditModalOpen && selectedJefes && <EditJefesForm jefe_planta={selectedJefes} onClose={() => setEditModalOpen(false)} onSuccess={handleSuccess} />}
        
        {isDeleteModalOpen && selectedJefes && (
          <ConfirmationModal
            title="Confirmar Eliminación"
            message={`¿Seguro que quieres eliminar a ${selectedJefes.nombres}?`}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteModalOpen(false)}
            isLoading={isLoadingAction}
          >
          </ConfirmationModal>
        )}
      </div>
  );
}