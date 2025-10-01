'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getKpisSummary, getTopExportadoras, getTopPuertos, getTopInspectores, 
  getMarcasDailyTrend, getInspeccionesByAfiliacion, getDailyTrend, 
  DashboardInsights,
  getFullDashboardInsights} from '@/lib/api-dashboard';
import { ChartPieIcon, ExclamationTriangleIcon, PresentationChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { PiShippingContainerFill } from 'react-icons/pi';
import { HiTruck } from "react-icons/hi2";
import { AiFillSecurityScan } from "react-icons/ai";
import { lusitana } from '@/components/ui/fonts';
import { DEFAULT_TOP } from '@/lib/constants';
import { Box, Button, TextField, Typography } from '@mui/material';
import KpiCard from '@/components/dashboard/KpiCard';
import PieChartIcon from '@mui/icons-material/PieChart';
import DynamicAreaChart from '@/components/dashboard/DynamicAreaChart';
import CustomPieChart from '@/components/dashboard/CustomPieChart';
import TreemapChart from '@/components/dashboard/TreemapChart';
import Link from 'next/link';
import { COLORS, GRADIENTE_AMARILLO, GRADIENTE_AZUL, GRADIENTE_ROJO, GRADIENTE_VERDE, TREEMAP_COLORS, VERDE } from '@/lib/colors';
import VerticalBarChart from '@/components/dashboard/VerticalBarChart';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { StatCard } from '@/components/dashboard/StatCard';
import AdaptiveBarChart from '@/components/dashboard/AdaptiveBarChart';
import { AlertCard } from '@/components/dashboard/AlertCard';

const EmptyStateChart = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-full text-gray-500">
        <p>{message}</p>
    </div>
);

export default function DashboardPage() {
    const { token } = useAuth();
    const [kpis, setKpis] = useState<any>(null);
    const [dailyTrend, setDailyTrend] = useState<any[]>([]);
    const [marcasDaily, setMarcasDaily] = useState<any[]>([]);
    const [topExportadoras, setTopExportadoras] = useState<any[]>([]);
    const [topPuertos, setTopPuertos] = useState<any[]>([]);
    const [topInspectores, setTopInspectores] = useState<any[]>([]); 
    const [inspeccionesExternas, setInspeccionesExternas] = useState<any[]>([]);
    const [inspeccionesPalmar, setInspeccionesPalmar] = useState<any[]>([]);
    const [inspeccionesMidaja, setInspeccionesMidaja] = useState<any[]>([]);
    const [inspeccionesDanilup, setInspeccionesDanilup] = useState<any[]>([]);
    const [insights, setInsights] = useState<DashboardInsights | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>();
    const [tempStartDate, setTempStartDate] = useState<string>('');
    const [tempEndDate, setTempEndDate] = useState<string>(''); 

    const fetchDataForRange = useCallback(async (start: string, end: string) => {
        if (!token) {
            setError("No autorizado.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Llama a todas las APIs con las fechas proporcionadas
            const [kpisData, dailyTrendData, marcasDailyData,
                   topExportadorasData, topPuertosData, topInspectoresData, 
                   inspeccionesExternasData, inspeccionesPalmarData, 
                   inspeccionesMidajaData, inspeccionesDanilupData] = await Promise.all([
                getKpisSummary(start, end),
                getDailyTrend(start, end),
                getMarcasDailyTrend(DEFAULT_TOP, start, end),
                getTopExportadoras(DEFAULT_TOP, start, end),
                getTopPuertos(6, start, end),
                getTopInspectores(DEFAULT_TOP, start, end),
                getInspeccionesByAfiliacion('EXTERNA', start, end),
                getInspeccionesByAfiliacion('PALMAR', start, end),
                getInspeccionesByAfiliacion('MIDAJA', start, end),
                getInspeccionesByAfiliacion('DANILUP', start, end),
            ]);
            
            // Actualiza todos los estados
            setKpis(kpisData);
            setDailyTrend(dailyTrendData);
            setMarcasDaily(marcasDailyData);
            setTopExportadoras(topExportadorasData);
            setTopPuertos(topPuertosData);
            setTopInspectores(topInspectoresData);
            setInspeccionesExternas(inspeccionesExternasData);
            setInspeccionesPalmar(inspeccionesPalmarData);
            setInspeccionesDanilup(inspeccionesDanilupData);
            setInspeccionesMidaja(inspeccionesMidajaData);

        } catch (err: any) {
            setError(err.message || "Error al cargar datos del dashboard.");
        } finally {
            setLoading(false);
        }
    }, [token]);


    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
        const startStr = format(dateRange.from, 'yyyy-MM-dd');
        const endStr = format(dateRange.to, 'yyyy-MM-dd');
        fetchDataForRange(startStr, endStr);
        }

        const fetchInsights = async () => {
            setLoading(true);
            try {
                const startDate = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : undefined;
                const endDate = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : undefined;

                // UNA ÚNICA Y PODEROSA LLAMADA A LA API
                const data = await getFullDashboardInsights(startDate, endDate);
                
                setInsights(data);
            } catch (error) {
                console.error("Error al cargar los insights del dashboard:", error);
                // Manejar el error en la UI
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [dateRange, fetchDataForRange]);

    useEffect(() => {
        const today = new Date();
        const from = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        const initialRange = { from, to: today };
        
        setDateRange(initialRange);
        setTempDateRange(initialRange); 
    }, []);

    const handleApplyFilters = () => {
        setDateRange(tempDateRange);
    };

    if (loading) {
        return (
            <div className="w-full px-4 md:px-6 py-8 text-center">
                <p className={`${lusitana.className} text-xl text-gray-700`}>Cargando datos del Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full px-4 md:px-6 py-8 text-center bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className={`${lusitana.className} text-xl`}>Error al cargar el Dashboard:</p>
                <p>{error}</p>
            </div>
        );
    }

    const inspeccionesData = kpis?.inspecciones_por_tipo
    ? Object.entries(kpis.inspecciones_por_tipo).map(([name, value]) => ({
          label: name,
          value: value as number,
      }))
    : [];

    if (!insights) {
        return (
            <div className="text-center text-gray-500 mt-8">
                No se pudieron cargar los datos del dashboard.
            </div>
        );
    }

    return (
        <div className="w-full px-4 md:px-6 ">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-6">
                {/* --- Lado Izquierdo: Título --- */}
                <Typography 
                    variant="h4" 
                    color="black" 
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}
                    >
                    Resumen Ejecutivo
                </Typography>

                {/* --- Lado Derecho: Controles --- */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                <div className="flex items-center gap-2 ">
                    <Link href="/dashboard/marcas" passHref className="flex-grow md:flex-grow-0">
                    <Button
                        component="a"
                        variant="outlined"
                        size="small"
                        startIcon={<PresentationChartBarIcon className="h-5 w-5" />}
                        sx={{ height: '40px', minWidth: { xs: '40px', lg: 'auto' }, 
                            px: { xs: 1, lg: 2 }, width: { xs: '100%', md: 'auto' }, 
                            borderColor: '#144836', color: '#04932B',  
                            '&:hover': {
                                borderColor: '#144836',
                                backgroundColor: 'rgba(4, 48, 140, 0.04)'}}} 
                    >
                        <span className="flex items-center md:hidden lg:inline-block ml-1">
                            Análisis de Marcas
                        </span>
                    </Button>
                    </Link>
                </div>
                
                {/* Fila inferior en móvil / Parte derecha en escritorio */}
                <div className="flex items-stretch gap-2">
                    <DateRangePicker
                        range={tempDateRange}
                        onDateChange={setTempDateRange}
                        // Ocupa el espacio disponible para empujar el botón "Aplicar"
                        className="flex-grow"
                        />
                        <Button
                        variant="contained"
                        onClick={handleApplyFilters}
                        sx={{
                            backgroundColor: '#144836',
                            '&:hover': { backgroundColor: '#0f3a29' },
                            height: '40px' 
                        }}
                    >
                    Aplicar
                    </Button>
                </div>
                </div>
            </div>
            
            {/* --- 2. CUADRÍCULAS ESTANDAR --- */}
            {/* KPI Cards */}
            

            <div className="grid grid-cols-1 gap-6 mb-8">
                

                <KpiCard
                    title="DISPOSITIVOS SATELITALES"
                    icon={<ShieldCheckIcon className='w-10 h-10 text-[#04308C]'/>}
                    subtitle='Total de cargamentos monitoreados'
                    value={kpis?.total_cargamentos || 0}
                    growth={insights.kpi_summary.growth_cargamentos}
                    trendData={dailyTrend}
                    trendDataKey="total"
                    trendName="Dispositivos"
                    trendColor="#04308C"
                />
            </div>

            {/* Contenedores y Carga Suelta */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <KpiCard
                    title="CONTENEDORES"
                    subtitle='Total de contenedores monitoreados'
                    icon={<PiShippingContainerFill className='w-10 h-10 text-[#04932B]'/>}
                    value={kpis?.total_contenedores || 0}
                    growth={insights.kpi_summary.growth_contenedores}
                    trendData={dailyTrend}
                    trendDataKey="contenedores"
                    trendName='Contenedores'
                    trendColor="#04932B" />
                <KpiCard
                    title="CARGA SUELTA"
                    subtitle='Total de camiones y furgones monitoreados'
                    icon={<HiTruck className='w-10 h-10 text-black'/>}
                    value={kpis?.total_carga_suelta || 0}
                    growth={insights.kpi_summary.growth_carga_suelta}
                    trendData={dailyTrend}
                    trendDataKey="carga_suelta"
                    trendName='Carga Suelta'
                    trendColor="#000000" />
            </div>

            {/* KPIs de Inspecciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="INSPECCIONES"
                    subtitle="Procedimientos realizados en fincas"
                    value={kpis?.total_inspecciones || 0}
                    growth={insights.kpi_summary.growth_inspecciones}
                    icon={<AiFillSecurityScan className='w-10 h-10'/>}
                    colorClassName="text-red-600"
                />
                <StatCard
                    title="COBERTURA TOTAL"
                    subtitle={`Inspeccionados ${kpis?.cargamentos_inspeccionados} cargamentos`}
                    value={`${kpis?.porcentaje_inspecciones || 0}%`}
                    icon={<ChartPieIcon className='w-10 h-10'/>}
                    colorClassName="text-[#04308C]"
                />
                <StatCard
                    title="COBERTURA EN CONTENEDORES"
                    subtitle={`Inspeccionados ${kpis?.contenedores_inspeccionados}`}
                    value={`${kpis?.porcentaje_contenedores_inspeccionados || 0}%`}
                    icon={<PieChartIcon className='w-10 h-10' />}
                    colorClassName="text-[#04932B]"
                />
                {/* Alerta de Riesgo */}
                {insights.alerts.uninspected_high_risk > 0 && (
                    <AlertCard
                        title="¡ALERTA DE RIESGO!"
                        value={insights.alerts.uninspected_high_risk}
                        subtitle="Cargamentos de alto riesgo sin inspeccionar"
                        icon={<ExclamationTriangleIcon className='w-10 h-10 text-red-600' />}
                        onClick={() => {
                            // Lógica para navegar a la página de detalles
                        }}
                    />  
                )}
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-8">
                {marcasDaily.length > 0 ? (
                <DynamicAreaChart
                    title="MONITOREO DE MARCAS DE CAJA"
                    subtitle="Contribución diaria de las principales marcas de cabecera enviadas en cargamentos"
                    data={marcasDaily} mainValue={''}                />
                ) : <EmptyStateChart message="No hay datos de marcas para mostrar." />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">         
                {/* Exportadoras - Gráfico Circular*/}
                {topExportadoras.length > 0 ? (
                <CustomPieChart
                    title="APORTE DE EXPORTADORAS"
                    data={topExportadoras.map(item => ({ label: item.exportadora, value: item.count }))}
                    colors={COLORS}
                />
                 ) : (<EmptyStateChart message="No hay datos de exportadoras." />)}
                {/* Tipos de Inspecciones - Gráfico Circular */}
                {inspeccionesData.length > 0 ? (
                    <CustomPieChart
                        title="TIPOS DE INSPECCIONES"
                        data={inspeccionesData}
                        colors={COLORS}
                    />
                ) : (
                    <EmptyStateChart message="No hay datos de inspecciones." />
                )}
                {/* Inspectores - Gráfico Circular */}
                {topInspectores.length > 0 ? (
                <CustomPieChart
                    title="INSPECTORES"
                    data={topInspectores.map(item => ({ label: item.inspector, value: item.count }))}
                    colors={COLORS}
                />
            ) : ( <EmptyStateChart message="No hay datos de inspectores."  />)}
            </div>

            <div className="grid grid-cols-1 gap-2 mb-6">
                {inspeccionesPalmar.length > 0 ? (
                    <AdaptiveBarChart
                        title="INSPECCIONES EN FINCAS PALMAR"
                        data={inspeccionesPalmar.map(item => ({ 
                            label: item.agricola, 
                            value: item.total_inspecciones 
                        }))}
                        barColor="#2E7D32" 
                    />
                ) : ( 
                    <EmptyStateChart message="No hay datos de fincas de Palmar." /> 
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {inspeccionesDanilup.length > 0 ? (
                    <VerticalBarChart
                        title="INSPECCIONES EN FINCAS DANILUP"
                        data={inspeccionesDanilup.map(item => ({ 
                            label: item.agricola, value: item.total_inspecciones }))}
                        colors={GRADIENTE_AZUL}
                    />
                ) : ( <EmptyStateChart message="No hay datos de fincas propias." /> )}

                {inspeccionesMidaja.length > 0 ? (
                    <VerticalBarChart
                        title="INSPECCIONES EN FINCAS MIDAJA"
                        data={inspeccionesMidaja.map(item => ({ 
                            label: item.agricola, value: item.total_inspecciones }))}
                        colors={VERDE}
                    />
                ) : ( <EmptyStateChart message="No hay datos de fincas propias." /> )}
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6">
                {inspeccionesExternas.length > 0 ? (
                    <AdaptiveBarChart
                        title="INSPECCIONES EN FINCAS EXTERNAS"
                        data={inspeccionesExternas.map(item => ({ 
                            label: item.agricola, value: item.total_inspecciones }))}
                        barColor="#2A65C7"
                    />
                ) : ( <EmptyStateChart message="No hay datos de fincas externas." /> )}
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">   
                {/* Puertos - Treemap */}
                <TreemapChart
                    title="MONITOREO DE PUERTOS"
                    subtitle='Distribución de cargamentos según su destino final'
                    data={topPuertos.map(item => ({ name: item.puerto, size: item.count }))}
                    colors={TREEMAP_COLORS}
                    />
            </div>
        </div>
    );
}