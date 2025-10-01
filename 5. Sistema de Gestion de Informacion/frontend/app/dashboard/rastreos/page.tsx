'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Cargamento, RolUsuario, PaginatedResponse } from '@/lib/types';
import { getAllCargamentos, deleteCargamento } from '@/lib/api';
import { CardsGridSkeleton } from '@/components/ui/skeletons';
import { useDebounce } from '@/hooks/useDebounce';
import { PlusIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Search } from '@/components/ui/search';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { lusitana } from '@/components/ui/fonts';
import { CargamentoCard } from '@/components/dashboard/cargamento/CargamentoCard';
import { CargamentoDetailModal } from '@/components/dashboard/cargamento/CargamentoDetailModal';
import { CreateCargamentoForm } from '@/components/dashboard/cargamento/CreateCargamentoForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { DEFAULT_PAGE_SIZE_RASTREOS } from '@/lib/constants';
import { EditCargamentoForm } from '@/components/dashboard/cargamento/EditCargamentoForm';

export default function RastreosPage() {
  const { token, user: currentUser } = useAuth();

  // 🔽 CAMBIO: Estados para manejar la paginación
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Cargamento> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Estados para la exportación a Excel (se mantienen igual)
  const [excelDateFrom, setExcelDateFrom] = useState('');
  const [excelDateTo, setExcelDateTo] = useState('');
  
  // Estados para los modales (se mantienen igual)
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCargamento, setSelectedCargamento] = useState<Cargamento | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const [deleteReason, setDeleteReason] = useState('');
  const canManage = currentUser?.role === RolUsuario.ADMIN || currentUser?.role === RolUsuario.INSPECTOR;
  const canExport = true; // Todos los roles pueden exportar

  // 🔽 CAMBIO: La función de fetch ahora usa paginación
  const fetchCargamentos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCargamentos(currentPage, DEFAULT_PAGE_SIZE_RASTREOS, debouncedSearchTerm, dateFilter);
      setPaginatedData(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los rastreos.');
      setPaginatedData(null);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, debouncedSearchTerm, dateFilter]);

  useEffect(() => {
    fetchCargamentos();
  }, [fetchCargamentos]);

  // CAMBIO: Al buscar, volver a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, dateFilter]);

  const handleAction = (action: 'edit' | 'delete' | 'details', cargamento: Cargamento) => {
    setSelectedCargamento(cargamento);
    if (action === 'edit') setEditModalOpen(true);
    if (action === 'delete') setDeleteModalOpen(true);
    if (action === 'details') setDetailModalOpen(true);
  };

  const handleSuccess = () => {
    fetchCargamentos();
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDetailModalOpen(false);
    setDeleteModalOpen(false);
  };
  
  const confirmDelete = async () => {
    if (!token || !selectedCargamento) return;
    if (!deleteReason || deleteReason.trim().length < 5) {
      alert("Por favor, ingrese un motivo de al menos 5 caracteres.");
      return;
    }
    setIsLoadingAction(true);
    try {
      await deleteCargamento(selectedCargamento.cargamento_id, deleteReason);
      handleSuccess();
    } catch (err: any) {
      setError(err.message || "Error al eliminar el cargamento.");
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleExportExcel = async () => {
    if (!token) {
        alert("No autorizado. Por favor, inicia sesión para exportar.");
        return;
    }
    setIsLoadingAction(true);
    setError(null);
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const params = new URLSearchParams();
        if (excelDateFrom) params.append('fecha_inicio', excelDateFrom);
        if (excelDateTo) params.append('fecha_fin', excelDateTo);

        const response = await fetch(`${API_BASE_URL}/cargamentos/export/excel?${params.toString()}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Error al generar el archivo Excel.");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Cargamentos_${excelDateFrom || ''}_a_${excelDateTo || ''}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err: any) {
        console.error("Error al exportar a Excel:", err);
        setError(err.message);
    } finally {
        setIsLoadingAction(false);
    }
  };


  return (
        <div className="w-full px-4 md:px-6 py-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h1 className={`${lusitana.className} text-xl md:text-3xl font-bold text-gray-900`}>
                    ENTREGA DE RASTREOS
                </h1>
                {canManage && (
                    <Button onClick={() => setCreateModalOpen(true)} className="flex items-center px-4 py-2 text-sm w-full md:w-auto">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        <span>Registrar Rastreo</span>
                    </Button>
                )}
            </div>

            <div className="mb-6 space-y-4">
                <Search placeholder="Buscar datos de cargamento..." onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div>
                        <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Fecha</label>
                        <input type="date" id="dateFilter" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                            className="peer block w-full rounded-md border border-gray-300 py-[9px] px-3 text-sm focus:border-blue-500 focus:ring-blue-500"/>
                    </div>
                    
                    <div className="hidden md:block">
                        <label htmlFor="excelDateFrom" className="block text-sm font-medium text-gray-700 mb-1">Reporte Desde</label>
                        <input type="date" id="excelDateFrom" value={excelDateFrom} onChange={e => setExcelDateFrom(e.target.value)}
                            className="peer block w-full rounded-md border border-gray-300 py-[9px] px-3 text-sm"/>
                    </div>
                    <div className="hidden md:block">
                        <label htmlFor="excelDateTo" className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input type="date" id="excelDateTo" value={excelDateTo} onChange={e => setExcelDateTo(e.target.value)}
                            className="peer block w-full rounded-md border border-gray-300 py-[9px] px-3 text-sm"/>
                    </div>
                    
                    <div className="hidden md:flex md:items-end">
                        {canExport && (
                            <Button onClick={handleExportExcel} isLoading={isLoadingAction} className="w-full flex items-center justify-center px-4 py-2 text-sm bg-green-600 hover:bg-green-700">
                                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                <span>Exportar</span>
                            </Button>
                        )}
                    </div>

                </div>
            </div>

      {loading ? (
        <CardsGridSkeleton count={DEFAULT_PAGE_SIZE_RASTREOS} />
      ) : error ? (
        <div className="mt-6 text-center text-red-500">{error}</div>
      ) : (
        <>
          {/* 🔽 CAMBIO: Se mapea sobre `paginatedData.items` */}
          {paginatedData && paginatedData.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {paginatedData.items.map(c => (
                <CargamentoCard
                  key={c.cargamento_id}
                  cargamento={c}
                  onEdit={() => handleAction('edit', c)}
                  onDelete={() => handleAction('delete', c)}
                  onViewDetails={() => handleAction('details', c)}
                />
              ))}
            </div>
          ) : (
            <p className="col-span-full text-center text-gray-500 mt-10">No se encontraron rastreos que coincidan con la búsqueda.</p>
          )}
          
          {paginatedData && paginatedData.total_pages > 1 && (
            <div className="mt-8 flex w-full justify-center">
                <Pagination 
                    currentPage={currentPage}
                    totalPages={paginatedData.total_pages}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
          )}
        </>
      )}

      {isCreateModalOpen && <CreateCargamentoForm onClose={() => setCreateModalOpen(false)} onSuccess={handleSuccess} />}
      {isEditModalOpen && selectedCargamento && <EditCargamentoForm cargamentoToEdit={selectedCargamento} onClose={() => setEditModalOpen(false)} onSuccess={handleSuccess} />}
      {isDetailModalOpen && selectedCargamento && <CargamentoDetailModal cargamento={selectedCargamento} onClose={() => setDetailModalOpen(false)} />}
      {isDeleteModalOpen && selectedCargamento && (
        <ConfirmationModal
          title="Confirmar Eliminación"
          message={`¿Seguro que quieres eliminar el registro de la finca "${selectedCargamento.agricola_rel.finca}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModalOpen(false)}
          isLoading={isLoadingAction}
        >
          {/* Se añade un "hijo" al modal: el campo de texto para el motivo */}
          <div className="mt-4">
            <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-700">
              Motivo de la eliminación (requerido)
            </label>
            <textarea
              id="deleteReason"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Ej: Registro duplicado, error de digitación, etc."
            />
          </div>
        </ConfirmationModal>
      )}
    </div>
  );
}