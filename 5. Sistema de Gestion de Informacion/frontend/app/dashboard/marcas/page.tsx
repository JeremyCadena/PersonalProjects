'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { getAllMarcasList } from '@/lib/api';
import { getMarcaStatistics, MarcaStatistics } from '@/lib/api-dashboard';
import { COLORS, GRADIENTE_NEUTRO, MARCAS } from '@/lib/colors';
import CountryLeaderboard from '@/components/dashboard/CountryLeaderboard';
import GroupedVerticalBarChart from '@/components/dashboard/GroupedVerticalBarChart ';
import StackedVerticalBarChart from '@/components/dashboard/StackedVerticalBarChart';

interface MarcaSimple {
  marca_id: number;
  nombre: string;
}

const EmptyStateChart = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-full text-gray-500 p-4">
        <p>{message}</p>
    </div>
);

export default function AnalisisMarcasPage() {
  const { token } = useAuth();
  
  // Estados para los controles
  const [marcasList, setMarcasList] = useState<MarcaSimple[]>([]);
  const [selectedMarcaId, setSelectedMarcaId] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Estados para los datos y la carga
  const [statsData, setStatsData] = useState<MarcaStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efecto para cargar la lista de marcas al inicio
  useEffect(() => {
    getAllMarcasList ()
      .then(data => setMarcasList(data))
      .catch(() => setError("No se pudo cargar la lista de marcas."));
  }, []);

  // Efecto para cargar las estadísticas cuando se selecciona una marca o cambia la fecha
  useEffect(() => {
    if (!selectedMarcaId) {
      setStatsData(null);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const startDate = dateRange?.from?.toISOString().split('T')[0];
        const endDate = dateRange?.to?.toISOString().split('T')[0];
        const data = await getMarcaStatistics(Number(selectedMarcaId), startDate, endDate);
        setStatsData(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar las estadísticas de la marca.');
        setStatsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedMarcaId, dateRange, token]);

  const handleMarcaChange = (event: SelectChangeEvent<string>) => {
    setSelectedMarcaId(event.target.value);
  };

  useEffect(() => {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    setDateRange({ from, to: today });
  }, []);

  const groupedChartData = useMemo(() => {
        if (!statsData?.stats_por_variante) return { data: [], categories: [] };

        const originalData = statsData.stats_por_variante;
        const categories = Object.keys(originalData); // ["CAMIÓN", "FURGÓN", "CONTENEDOR"]
        
        const allVariants = new Set<string>();
        categories.forEach(cat => {
            originalData[cat].forEach(item => allVariants.add(item.variante));
        });

        const transformedData = Array.from(allVariants).map(variante => {
            const dataPoint: { variante: string; [key: string]: string | number } = { variante };
      
            categories.forEach(cat => {
                const item = originalData[cat].find(d => d.variante === variante);
                dataPoint[cat] = item ? item.count : 0;
            });
            
            return dataPoint;
        });

        return { data: transformedData, categories };

    }, [statsData]);
    
   return (
    <div className="w-full px-4 md:px-6 ">
      {/* --- CABECERA DE CONTROLES --- */}
      <Box sx={{p: 2, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, 
                justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: { xs: 2, md: 0 } }}>
                    Análisis de Marcas
                </Typography>
        <Box sx={{display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
          <FormControl fullWidth sx={{ minWidth: 200 }} size="small">
            <InputLabel id="select-marca-label">Seleccionar Marca</InputLabel>
            <Select
              labelId="select-marca-label"
              value={selectedMarcaId}
              label="Seleccionar Marca"
              onChange={handleMarcaChange}
            >
              <MenuItem value=""><em>Ninguna</em></MenuItem>
              {marcasList.map((marca) => (
                <MenuItem key={marca.marca_id} value={marca.marca_id.toString()}>
                  {marca.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DateRangePicker 
              range={dateRange}
              onDateChange={setDateRange} />
        </Box>
      </Box>

       {/* --- ÁREA DE GRÁFICOS --- */}
            {loading ? (
                <div className="w-full text-center py-10"><CircularProgress /></div>
            ) : error ? (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>
            ) : !selectedMarcaId ? (
                <div className="p-4 text-center text-gray-500 border-2 border-dashed rounded-md">Seleccione una marca para comenzar el análisis.</div>
            ) : !statsData || statsData.daily_trend.length === 0 ? (
                <div className="p-4 text-center text-gray-500 border-2 border-dashed rounded-md">No se encontraron datos para la marca en este rango.</div>
            ) : (
                // 2. Contenedor principal de los gráficos
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-3/4">
                            <GroupedVerticalBarChart
                                title="ROTACIÓN DE CADA MARCA"
                                data={groupedChartData.data}
                                categories={groupedChartData.categories}
                                colors={MARCAS}
                            />
                        </div>
                        
                        <div className="w-full md:w-1/4">
                           <CountryLeaderboard
                                title="PRINCIPALES DESTINOS"
                                data={statsData.stats_por_destino.map(d => ({ 
                                    id: d.id, 
                                    label: d.destino, 
                                    value: d.count 
                                }))}
                                colors={GRADIENTE_NEUTRO}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <StackedVerticalBarChart
                            title="DISTRIBUCIÓN EN CADA FINCA"
                            data={statsData.stats_finca_variante.data}
                            variants={statsData.stats_finca_variante.variants}
                            colors={MARCAS} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}