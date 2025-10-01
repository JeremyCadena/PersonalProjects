'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Cargamento, PaginatedResponse, RolUsuario, TipoVehiculo } from '@/lib/types';
import { getAllCargamentos } from '@/lib/api';
import { CardsGridSkeleton } from '@/components/ui/skeletons';
import { lusitana } from '@/components/ui/fonts';
import { Pagination } from '@/components/ui/Pagination';
import { CreateInspeccionForm } from '@/components/dashboard/inspecciones/CreateInspeccionForm';
import { CargamentoHorizontalCard } from '@/components/dashboard/cargamento/HorizontalCard';
import { Search } from '@/components/ui/search';
import { DEFAULT_PAGE_SIZE_RASTREOS } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce'; 

export default function InspeccionesPage() {
  const { token, user: currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Cargamento> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCargamentoId, setSelectedCargamentoId] = useState<number | null>(null);

  const canCreateInspeccion = currentUser?.role === RolUsuario.ADMIN || currentUser?.role === RolUsuario.INSPECTOR;

  const currentPage = Number(searchParams.get('page')) || 1;
  const dateFilter = searchParams.get('date') || '';
  const typeFilter = searchParams.get('type') || '';
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms de retraso


  const fetchCargamentos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Se usan las variables leídas directamente de la URL
      const data = await getAllCargamentos(currentPage, DEFAULT_PAGE_SIZE_RASTREOS, debouncedSearchTerm, dateFilter, typeFilter);
      setPaginatedData(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los cargamentos.');
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, debouncedSearchTerm, dateFilter, typeFilter]);// El array de dependencias ahora refleja la URL

  useEffect(() => {
    fetchCargamentos();
  }, [fetchCargamentos]); 
  
  useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('search', debouncedSearchTerm);
        params.set('page', '1');
        // Usamos replace para no llenar el historial del navegador con cada búsqueda
        router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm, pathname, router]);

  // --- CAMBIO #3: Los handlers ahora solo se preocupan de actualizar la URL ---
  const handleFilterChange = (key: 'date' | 'type', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        params.set('page', '1'); 
        router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAddInspeccion = (cargamentoId: number) => {
    setSelectedCargamentoId(cargamentoId);
    setCreateModalOpen(true);
  };

  const handleViewAllInspecciones = (cargamentoId: number) => {
    router.push(`/dashboard/inspecciones/${cargamentoId}`);
  };

  return (
    <div className="w-full px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`${lusitana.className} text-xl md:text-3xl font-bold text-gray-900`}>REGISTRO DE INSPECCIÓN</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-gray-50 items-end">
        <div className="md:col-span-1 lg:col-span-2">
          <label htmlFor="search-finca" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <Search placeholder="Buscar por finca, contenedor, placa..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>

        <div className="w-full md:w-auto">
          <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" id="dateFilter" value={dateFilter} onChange={e => handleFilterChange('date', e.target.value)}
              className="peer block w-full rounded-md border border-gray-300 py-[9px] px-3 text-sm" />
        </div>

        <div className="w-full md:w-auto">
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vehículo</label>
            <select id="typeFilter" value={typeFilter} onChange={e => handleFilterChange('type', e.target.value)}
              className="peer block w-full rounded-md border border-gray-300 py-[9px] px-3 text-sm" >
                <option value="">Todos</option>
                  {Object.values(TipoVehiculo).map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>))}
            </select>
        </div>
      </div>

      {loading ? (
        <CardsGridSkeleton count={DEFAULT_PAGE_SIZE_RASTREOS}/>
      ) : error ? (
        <div className="mt-6 text-center text-red-500">{error}</div>
      ) : (
        <>
          {paginatedData && paginatedData.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {paginatedData.items.map((cargamento) => (
                <CargamentoHorizontalCard
                  key={cargamento.cargamento_id}
                  cargamento={cargamento}
                  onAddInspeccion={handleAddInspeccion}
                  onViewAllInspecciones={handleViewAllInspecciones}
                  canAddInspeccion={canCreateInspeccion}
                  canViewAllInspecciones={true}
                />
              ))}
            </div>
          ) : (
            <p className="col-span-full text-center text-gray-500 mt-10">No se encontraron cargamentos.</p>
          )}
          
          {paginatedData && paginatedData.total_pages > 1 && (
            <div className="mt-8 flex w-full justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={paginatedData.total_pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {isCreateModalOpen && selectedCargamentoId !== null && (
        <CreateInspeccionForm
          cargamentoId={selectedCargamentoId}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchCargamentos(); // Recargar datos después de crear
          }}
        />
      )}
    </div>
  );
}