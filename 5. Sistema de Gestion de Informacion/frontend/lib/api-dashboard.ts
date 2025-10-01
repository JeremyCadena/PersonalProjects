// ARCHIVO: /lib/api-dashboard.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }
  const data = await response.json();
  if (!response.ok) {
    let errorMessage = 'Ocurrió un error en el servidor.';
    if (data.detail) {
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((err: any) => `${err.loc.join('.')} - ${err.msg}`).join('; ');
      }
    }
    throw new Error(errorMessage);
  }
  return data as T;
}

async function apiFetchDashboard<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!options.body || typeof options.body === 'string') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const config: RequestInit = { ...options, headers, credentials: 'include' }; // <-- Añadir credentials: 'include'
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse<T>(response);
}

// --- Funciones para obtener los KPIs del Dashboard ---
// KPI Summary
export const getKpisSummary = async (startDate?: string, endDate?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return apiFetchDashboard(`/dashboard/kpis-summary?${params.toString()}`);
};

// Daily Trends
interface DailyTrendData {
  date: string;
  total: number;
  contenedores: number;
  carga_suelta: number;
}

// Nueva función unificada que reemplaza a las tres anteriores
export const getDailyTrend = async (startDate?: string, endDate?: string): Promise<DailyTrendData[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return apiFetchDashboard(`/dashboard/daily-trend?${params.toString()}`);
};

// Top Marcas
export interface MarcaStatistics {
  stats_por_variante: {
    [key: string]: { variante: string; count: number }[];
  };
  stats_por_destino: { destino: string; id: string; count: number }[];
  stats_por_finca: { finca: string; count: number }[];
  stats_finca_variante: {
    data: {
      finca: string;
      [key: string]: string | number; 
    }[];
    variants: string[]; 
  };
  stats_inspecciones: {
    inspeccionados: number;
    total: number;
    porcentaje: number;
  };
  daily_trend: { date: string; count: number }[];
}

export const getMarcasDailyTrend = async (limit: number, startDate?: string, endDate?: string): Promise<any[]> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return apiFetchDashboard(`/dashboard/marcas-daily-trend?${params.toString()}`);
};

export const getMarcaStatistics = async (
  marcaId: number,
  startDate?: string,
  endDate?: string
): Promise<MarcaStatistics> => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const queryString = params.toString();
  const endpoint = `/dashboard/${marcaId}/statistics${queryString ? `?${queryString}` : ''}`;
  
  return apiFetchDashboard(endpoint);
};

// Top Exportadoras
export const getTopExportadoras = async (limit: number, startDate?: string, endDate?: string): Promise<any[]> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return apiFetchDashboard(`/dashboard/top-exportadoras?${params.toString()}`);
};

// Top Puertos
export const getTopPuertos = async (limit: number, startDate?: string, endDate?: string): Promise<any[]> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return apiFetchDashboard(`/dashboard/top-puertos?${params.toString()}`);
};

// Top Choferes
export const getTopChoferes = async (limit: number, startDate?: string, endDate?: string): Promise<any[]> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return apiFetchDashboard(`/dashboard/top-choferes?${params.toString()}`);
};

// Top Fincas
export const getTopFincas = async (limit: number, startDate?: string, endDate?: string): Promise<any[]> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return apiFetchDashboard(`/dashboard/top-fincas?${params.toString()}`);
};

export const getTopFincasAndChoferes = async (
  fincasLimit: number,
  choferesLimit: number,
  startDate?: string,
  endDate?: string
): Promise<any[]> => {
  const params = new URLSearchParams();
  params.append('fincas_limit', fincasLimit.toString());
  params.append('choferes_limit', choferesLimit.toString());
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  // Realiza la petición al nuevo endpoint de la API
  return apiFetchDashboard(`/dashboard/top-fincas-choferes?${params.toString()}`);
};

// Top Inspectores
export const getTopInspectores = async (limit: number, startDate?: string, endDate?: string): Promise<any[]> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return apiFetchDashboard(`/dashboard/top-inspectores?${params.toString()}`);
};

// Estadística de Inspecciones por Afiliación de Agrícola
export const getInspeccionesByAfiliacion = async (
  afiliacion: string,
  startDate?: string,
  endDate?: string
): Promise<{ agricola: string; total_inspecciones: number }[]> => {
  const params = new URLSearchParams();
  params.append('afiliacion', afiliacion);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  return apiFetchDashboard(`/dashboard/inspecciones-por-afiliacion?${params.toString()}`);
};

// --- 1. NUEVA INTERFAZ PARA LOS INSIGHTS ---
interface KpiSummary {
  total_cargamentos: number;
  total_inspecciones: number;
  porcentaje_inspecciones: number;
  growth_inspecciones: number;
  growth_cargamentos: number;
  growth_contenedores: number;
  growth_carga_suelta: number;
}

interface RankingItem {
  label: string;
  value: number;
}

interface Alerts {
  uninspected_high_risk: number;
}

export interface DashboardInsights {
  kpi_summary: KpiSummary;
  daily_trend: DailyTrendData[]; // Reutilizamos la interfaz existente
  rankings: {
    top_fincas: RankingItem[];
    top_inspectores: RankingItem[];
  };
  alerts: Alerts;
}


// --- FUNCIÓN UNIFICADA PARA INSIGHTS ---
export const getFullDashboardInsights = async (startDate?: string, endDate?: string): Promise<DashboardInsights> => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  return apiFetchDashboard(`/dashboard/insights?${params.toString()}`);
};
