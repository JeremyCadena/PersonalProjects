'use client';

import { Box, Button, Fab, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Exportadora, RolUsuario, PaginatedResponse } from '@/lib/types';
import { getAllExportadoras, deleteExportadora } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Search } from '@/components/ui/search';
import { TableSkeleton } from '@/components/ui/skeletons';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ExportadorasTable } from '@/components/dashboard/parametros/exportadoras/ExportadoraTable';
import { CreateExportadoraForm } from '@/components/dashboard/parametros/exportadoras/CreateExportadoraForm';
import { EditExportadoraForm } from '@/components/dashboard/parametros/exportadoras/EditExportadoraForm';

export default function ExportadorasPage() {
    const { token, user: currentUser } = useAuth();
    const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Exportadora> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
      
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedExportadora, setSelectedExportadora] = useState<Exportadora | null>(null);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
      
    const canCreate = currentUser?.role === RolUsuario.ADMIN;
    const canEdit = currentUser?.role === RolUsuario.ADMIN;
    const canDelete = currentUser?.role === RolUsuario.ADMIN;
    
    const fetchExportadoras = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
          const data = await getAllExportadoras(currentPage, DEFAULT_PAGE_SIZE, debouncedSearchTerm);
          setPaginatedData(data);
        } catch (err: any) {
          setError(err.message || 'Error al cargar las exportadoras.');
        } finally {
          setLoading(false);
        }
      }, [token, currentPage, debouncedSearchTerm]);

    useEffect(() => { fetchExportadoras(); }, [fetchExportadoras]);
    useEffect(() => { if (currentPage !== 1) setCurrentPage(1); else fetchExportadoras(); }, [debouncedSearchTerm]);
    
    const handleSuccess = () => {
    fetchExportadoras();
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    };

    const handleEdit = (exportadora: Exportadora) => {
        setSelectedExportadora(exportadora);
        setEditModalOpen(true);
      };
    
      const handleDelete = (exportadora: Exportadora) => {
        setSelectedExportadora(exportadora);
        setDeleteModalOpen(true);
      };

    const confirmDelete = async () => {
        if (!selectedExportadora || !token) return;
    
        setIsLoadingAction(true);
        try {
            await deleteExportadora(selectedExportadora.exportadora_id);
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
          placeholder="Buscar exportadora..." 
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
                },}}>
                Crear Exportadora
        </Button></div>
        )}
        </Box>

      {loading ? (
        <TableSkeleton columns={2} />
      ) : error ? (
        <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>
      ) : paginatedData && paginatedData.items.length > 0 ? (
        <>
          <ExportadorasTable
            exportadoras={paginatedData.items}
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
        <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>No se encontraron exportadoras.</Typography>
      )}

      {canCreate && !isCreateModalOpen && !isEditModalOpen && !isDeleteModalOpen && (
        <div className="md:hidden">
            <Tooltip title="Crear Exportadora">
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

      {isCreateModalOpen && <CreateExportadoraForm onClose={() => setCreateModalOpen(false)} onSuccess={handleSuccess} />}
      {isEditModalOpen && selectedExportadora && <EditExportadoraForm exportadora={selectedExportadora} onClose={() => setEditModalOpen(false)} onSuccess={handleSuccess} />}
      
      {/* El modal de confirmación ahora vive en la página principal */}
      {isDeleteModalOpen && selectedExportadora && (
        <ConfirmationModal
          title="Confirmar Eliminación"
          message={`¿Seguro que quieres eliminar a ${selectedExportadora.nombre}?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModalOpen(false)}
          isLoading={isLoadingAction}
        >
        </ConfirmationModal>
      )}
    </Box>
  );
}