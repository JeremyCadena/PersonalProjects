// ARCHIVO: /lib/api.ts
import {
  AuthToken, Usuario, UsuarioCreate, UsuarioUpdate, RolUsuario, Chofer, ChoferCreate, ChoferUpdate, Productor,
  ProductorCreate, ProductorUpdate, JefePlanta, JefePlantaCreate, JefePlantaUpdate, Agricola, AgricolaCreate, 
  AgricolaUpdate, Exportadora, ExportadoraCreate, ExportadoraUpdate, Marca, MarcaCreate, MarcaUpdate,
  Puerto, PuertoCreate, PuertoUpdate, Destino, DestinoCreate, DestinoUpdate, VarianteMarca,
  VarianteMarcaCreate, VarianteMarcaUpdate, Cargamento, 
  CargamentoCreate, CargamentoUpdate, CargamentoDetalle, CargamentoDetalleCreate, CargamentoDetalleUpdate, FullCargamentoPayload,
  Inspeccion, InspeccionCreate, InspeccionUpdate, PaginatedResponse, FullCargamentoUpdatePayload,
} from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Funciones Helper (handleResponse, apiFetch) ----
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

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  
  const config: RequestInit = { ...options, headers, credentials: 'include' };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse<T>(response);
}

// --- Endpoints de Autenticación ---
export const loginUser = async (nickname: string, password: string): Promise<AuthToken> => {
  const body = new URLSearchParams({ username: nickname, password });
  const response = await fetch(`${API_BASE_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    credentials: 'include'
  });
  return handleResponse<AuthToken>(response);
};
export const getCurrentUser = (): Promise<Usuario> => apiFetch('/users/me/'); 
export const registerUser = (data: UsuarioCreate): Promise<Usuario> => apiFetch('/register/', { method: 'POST', body: JSON.stringify(data) });


// --- Endpoints de Usuarios (ADMINS) ---
export const getAllUsuarios = (): Promise<Usuario[]> => apiFetch('/users/');
export const getUsuarioById = (userId: number): Promise<Usuario> => apiFetch(`/users/${userId}`);
export const updateUsuario = (userId: number, data: UsuarioUpdate): Promise<Usuario> => apiFetch(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUsuario = (userId: number): Promise<void> => apiFetch(`/users/${userId}`, { method: 'PATCH' });
export const updateUsuarioRol = (userId: number, newRol: RolUsuario): Promise<Usuario> => apiFetch(`/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ new_role: newRol }) });
export const setUsuarioActiveStatus = (userId: number, isActive: boolean): Promise<Usuario> => apiFetch(`/users/${userId}/active`, { method: 'PUT', body: JSON.stringify({ is_active: isActive }) });
export const getAllUsuariosForSelection = (): Promise<Usuario[]> => apiFetch('/users/all/list');

// --- Endpoints de Choferes ---
export const getAllChoferes = (page: number = 1, per_page: number = 20, search?: string): Promise<PaginatedResponse<Chofer>> => {
  const params = new URLSearchParams({ page: page.toString(), per_page: per_page.toString() });
  if (search) params.append('search', search);
  return apiFetch(`/choferes/?${params.toString()}`);
};
export const getChoferById = (id: number): Promise<Chofer> => apiFetch(`/choferes/${id}`);
export const createChofer = (data: ChoferCreate): Promise<Chofer> => apiFetch('/choferes/', { method: 'POST', body: JSON.stringify(data) });
export const updateChofer = (id: number, data: ChoferUpdate): Promise<Chofer> => apiFetch(`/choferes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
// --- ESTANDARIZADO: Soft Delete ---
export const deleteChofer = (id: number, motivo_eliminacion : string): Promise<void> => 
  apiFetch(`/choferes/${id}`, { 
    method: 'PATCH',
    body: JSON.stringify({ motivo_eliminacion  }) 
  });
export const searchChoferes = (query: string): Promise<Chofer[]> => {
  if (!query || query.length < 2) return Promise.resolve([]);
  return apiFetch(`/choferes/search/?q=${encodeURIComponent(query)}`);
};


// --- Endpoints de Productores ---
export const getAllProductores = (page: number = 1, per_page: number = 20, search?: string): Promise<PaginatedResponse<Productor>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', per_page.toString());
  if (search) { params.append('search', search); }
  return apiFetch(`/productores/?${params.toString()}`);
};
export const getProductorById = (productorId: number): Promise<Productor> => apiFetch(`/productores/${productorId}`);
export const createProductor = (data: ProductorCreate): Promise<Productor> => apiFetch('/productores/', { method: 'POST', body: JSON.stringify(data) });
export const updateProductor = (productorId: number, data: ProductorUpdate): Promise<Productor> => apiFetch(`/productores/${productorId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProductor = (productorId: number): Promise<void> => apiFetch(`/productores/${productorId}`, { method: 'PATCH' });
export const getProductorList = (searchTerm: string): Promise<Productor[]> => {
  if (!searchTerm || searchTerm.length < 3) {
    return Promise.resolve([]);
  }
  return apiFetch(`/productores/search/?q=${encodeURIComponent(searchTerm)}`);
};


// --- Endpoints de Jefes de Planta ---
export const getAllJefesPlanta = (page: number = 1, per_page: number = 20, search?: string): Promise<PaginatedResponse<JefePlanta>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', per_page.toString());
  if (search) { params.append('search', search); }
  return apiFetch(`/jefes-planta/?${params.toString()}`);
};
export const getJefePlantaById = (jefePlantaId: number): Promise<JefePlanta> => apiFetch(`/jefes-planta/${jefePlantaId}`);
export const createJefePlanta = (data: JefePlantaCreate): Promise<JefePlanta> => apiFetch('/jefes-planta/', { method: 'POST', body: JSON.stringify(data) });
export const updateJefePlanta = (jefePlantaId: number, data: JefePlantaUpdate): Promise<JefePlanta> => apiFetch(`/jefes-planta/${jefePlantaId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteJefePlanta = (jefePlantaId: number): Promise<void> => apiFetch(`/jefes-planta/${jefePlantaId}`, { method: 'PATCH' });
export const getJefesPlantaList = (query: string): Promise<JefePlanta[]> => {
  const params = new URLSearchParams({ q: query });
  return apiFetch(`/jefes-planta/search/?${params.toString()}`);
};

// --- Endpoints de Agrícolas ---
export const getAllAgricolas = (
  page: number = 1,
  per_page: number = 20,
  search?: string
): Promise<PaginatedResponse<Agricola>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', per_page.toString());
    if (search) {
      params.append('search', search);
    }
    const endpoint = `/agricolas/?${params.toString()}`;
    return apiFetch(endpoint, {});
};
export const getAgricolaById = (agricolaId: number): Promise<Agricola> => 
  apiFetch(`/agricolas/${agricolaId}`, {});
export const createAgricola = (data: AgricolaCreate): Promise<Agricola> => apiFetch('/agricolas/', { method: 'POST', body: JSON.stringify(data) });
export const updateAgricola = (agricolaId: number, data: AgricolaUpdate): Promise<Agricola> => apiFetch(`/agricolas/${agricolaId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAgricola = (agricolaId: number): Promise<void> => apiFetch(`/agricolas/${agricolaId}`, { method: 'PATCH' });
export const getAgricolasList = (searchTerm: string): Promise<Agricola[]> => {
  if (!searchTerm || searchTerm.length < 3) {
      return Promise.resolve([]);
  }
  return apiFetch(`/agricolas/search/?q=${encodeURIComponent(searchTerm)}`);
};


// --- Endpoints de Exportadoras ---
export const getAllExportadoras = (page: number = 1, per_page: number = 20, search?: string): Promise<PaginatedResponse<Exportadora>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', per_page.toString());
  if (search) { params.append('search', search); }
  return apiFetch(`/exportadoras/?${params.toString()}`);
};
export const getExportadoraById = (exportadoraId: number): Promise<Exportadora> => apiFetch(`/exportadoras/${exportadoraId}`);
export const createExportadora = (data: ExportadoraCreate): Promise<Exportadora> => apiFetch('/exportadoras/', { method: 'POST', body: JSON.stringify(data) });
export const updateExportadora = (exportadoraId: number, data: ExportadoraUpdate): Promise<Exportadora> => apiFetch(`/exportadoras/${exportadoraId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteExportadora = (exportadoraId: number): Promise<void> => apiFetch(`/exportadoras/${exportadoraId}`, { method: 'PATCH' });
export const getExportadorasList = (): Promise<Exportadora[]> => apiFetch('/exportadoras/list');


// --- Endpoints de Marcas ---
export const getAllMarcas = (page: number = 1, per_page: number = 20, search?: string): Promise<PaginatedResponse<Marca>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', per_page.toString());
  if (search) { params.append('search', search); }
  return apiFetch(`/marcas/?${params.toString()}`);
};
export const getMarcaById = (marcaId: number): Promise<Marca> => apiFetch(`/marcas/${marcaId}`);
export const createMarca = (data: MarcaCreate): Promise<Marca> => apiFetch('/marcas/', { method: 'POST', body: JSON.stringify(data) });
export const updateMarca = (marcaId: number, data: MarcaUpdate): Promise<Marca> => apiFetch(`/marcas/${marcaId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMarca = (marcaId: number): Promise<void> => 
  apiFetch(`/marcas/${marcaId}`, { 
    method: 'PATCH',
  });
export const getMarcaList = (searchTerm: string): Promise<Marca[]> => {
  if (!searchTerm || searchTerm.length < 3) {
      return Promise.resolve([]);
  }
  return apiFetch(`/marcas/search/?q=${encodeURIComponent(searchTerm)}`);
};

export const getAllMarcasList = (): Promise<Marca[]> => {
  return apiFetch(`/marcas/all`); // Llama a un nuevo endpoint
};

// --- Endpoints de Puertos ---
export const getAllPuertos = (page: number = 1, per_page: number = 20, search?: string): Promise<PaginatedResponse<Puerto>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', per_page.toString());
  if (search) { params.append('search', search); }
  return apiFetch(`/puertos/?${params.toString()}`);
};
export const getPuertoById = (puertoId: number): Promise<Puerto> => apiFetch(`/puertos/${puertoId}`);
export const createPuerto = (data: PuertoCreate): Promise<Puerto> => apiFetch('/puertos/', { method: 'POST', body: JSON.stringify(data) });
export const updatePuerto = (puertoId: number, data: PuertoUpdate): Promise<Puerto> => apiFetch(`/puertos/${puertoId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePuerto = (puertoId: number): Promise<void> => apiFetch(`/puertos/${puertoId}`, { method: 'PATCH' });
export const getPuertosList = (): Promise<Puerto[]> => apiFetch('/puertos/list');


// --- Endpoints de Destinos ---
export const getAllDestinos = (page: number = 1, per_page: number = 20, search?: string): Promise<PaginatedResponse<Destino>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', per_page.toString());
  if (search) { params.append('search', search); }
  return apiFetch(`/destinos/?${params.toString()}`);
};
export const getDestinoById = (destinoId: number): Promise<Destino> => apiFetch(`/destinos/${destinoId}`);
export const createDestino = (data: DestinoCreate): Promise<Destino> => apiFetch('/destinos/', { method: 'POST', body: JSON.stringify(data) });
export const updateDestino = (destinoId: number, data: DestinoUpdate): Promise<Destino> => apiFetch(`/destinos/${destinoId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDestino = (destinoId: number): Promise<void> => apiFetch(`/destinos/${destinoId}`, { method: 'PATCH' });
export const getDestinosList = (searchTerm: string): Promise<Destino[]> => {
  if (!searchTerm || searchTerm.length < 3) {
      return Promise.resolve([]);
  }
  return apiFetch(`/destinos/search/?q=${encodeURIComponent(searchTerm)}`);
};

// --- Endpoints de Variantes de Marca ---
export const getAllVariantesMarca = (page: number = 1, per_page: number = 20, search?: string): Promise<PaginatedResponse<VarianteMarca>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', per_page.toString());
  if (search) { params.append('search', search); }
  return apiFetch(`/variantes-marca/?${params.toString()}`);
};
export const getVariantesByMarcaId = (marcaId: number): Promise<VarianteMarca[]> => {
    return apiFetch(`/variantes_marca/${marcaId}/variante`);
};
export const getVarianteMarcaById = (varianteMarcaId: number): Promise<VarianteMarca> => apiFetch(`/variantes_marca/${varianteMarcaId}`);
export const createVarianteMarca = (data: VarianteMarcaCreate): Promise<VarianteMarca> => apiFetch('/variantes_marca/', { method: 'POST', body: JSON.stringify(data) });
export const updateVarianteMarca = (varianteMarcaId: number, data: VarianteMarcaUpdate): Promise<VarianteMarca> => apiFetch(`/variantes_marca/${varianteMarcaId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteVarianteMarca = (varianteMarcaId: number): Promise<void> => apiFetch(`/variantes_marca/${varianteMarcaId}`, { method: 'PATCH' });
export const getVariantesMarcaList = (searchTerm: string): Promise<VarianteMarca[]> => {
  if (!searchTerm || searchTerm.length < 2) {
    return Promise.resolve([]);
  }
  return apiFetch(`/variantes_marca/search/?q=${encodeURIComponent(searchTerm)}`);
};

// --- Endpoints de Cargamentos ---
export const getAllCargamentos = (
  page: number = 1,
  per_page: number = 20,
  search?: string,
  date_filter?: string,
  type?: string
): Promise<PaginatedResponse<Cargamento>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', per_page.toString());
    if (search) { params.append('search', search);}
    if (date_filter) { params.append('date_filter', date_filter);};
    if (type) { params.append('type', type);}

    const endpoint = `/cargamentos/?${params.toString()}`;
    return apiFetch(endpoint, {});
};
export const getCargamentoById = (cargamentoId: number): Promise<Cargamento> => 
  apiFetch(`/cargamentos/${cargamentoId}`, {});
export const deleteCargamento = (cargamentoId: number, motivo_eliminacion: string): Promise<void> => 
  apiFetch(`/cargamentos/${cargamentoId}`, { 
    method: 'PATCH',
    body: JSON.stringify({ motivo_eliminacion: motivo_eliminacion }) 
  });
export const createCargamentoWithDetalles = (data: FullCargamentoPayload): Promise<Cargamento> => 
  apiFetch('/cargamentos/full/', { method: 'POST', body: JSON.stringify(data) });
export const updateCargamentoWithDetalles = (cargamentoId: number, data: FullCargamentoUpdatePayload): Promise<Cargamento> => 
  apiFetch(`/cargamentos/full/${cargamentoId}`, { method: 'PUT', body: JSON.stringify(data) });
export const downloadCargamentoPdf = async (cargamentoId: number, templateName?: string): Promise<Blob> => {
  let endpoint = `/cargamentos/${cargamentoId}/pdf`;
  if (templateName) {
    endpoint += `?template=${templateName}`;
  }
    
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Error al generar el reporte.");
  }
  return response.blob();
};


// --- Endpoints de Cargamento Detalle ---
export const getCargamentoDetalle = (cargamentoId: number): Promise<CargamentoDetalle[]> => apiFetch(`/cargamentos/${cargamentoId}/detalles`);
export const getCargamentoDetalleById = (detalleId: number): Promise<CargamentoDetalle> => apiFetch(`/cargamentos-detalles/${detalleId}`);
export const createCargamentoDetalle = (data: CargamentoDetalleCreate): Promise<CargamentoDetalle> => apiFetch('/cargamentos-detalles/', { method: 'POST', body: JSON.stringify(data) });
export const updateCargamentoDetalle = (detalleId: number, data: CargamentoDetalleUpdate): Promise<CargamentoDetalle> => apiFetch(`/cargamentos-detalles/${detalleId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCargamentoDetalle = (detalleId: number): Promise<void> => apiFetch(`/cargamentos-detalles/${detalleId}`, { method: 'DELETE' });


// --- Endpoints de Inspecciones ---
export const getInspeccionesByCargamentoId = (cargamentoId: number): Promise<PaginatedResponse<Inspeccion>> => {
  const params = new URLSearchParams({
    cargamento_id: cargamentoId.toString(),
    page: '1',
    per_page: '10' // Límite alto para traer todas las inspecciones de este cargamento
  });
  const endpoint = `/inspecciones/?${params.toString()}`;
  return apiFetch(endpoint);
};
export const createInspeccion = (formData: FormData): Promise<Inspeccion> => {
  return apiFetch('/inspecciones/', {
    method: 'POST',
    body: formData,
  });
};
export const updateInspeccion = (id: number, data: InspeccionUpdate): Promise<Inspeccion> => 
  apiFetch(`/inspecciones/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteInspeccion = (inspeccionId: number, motivo_eliminacion: string): Promise<void> => 
  apiFetch(`/inspecciones/${inspeccionId}`, { 
    method: 'PATCH',
    body: JSON.stringify({ motivo_eliminacion: motivo_eliminacion }) 
  });
export const uploadInspectionImageApi = async (formData: FormData): Promise<{filename: string, url: string}[]> => {
  const response = await fetch(`${API_BASE_URL}/inspecciones/upload-image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};
export const deleteInspectionImage = (imagenId: number): Promise<void> => {
  return apiFetch(`/inspecciones/imagenes/${imagenId}`, {
    method: 'DELETE',
  });
};
export const addImagesToInspeccion = (inspeccionId: number, imagenes_urls: string[]): Promise<Inspeccion> => {
  return apiFetch(`/inspecciones/${inspeccionId}/add-images`, {
    method: 'POST',
    body: JSON.stringify({ imagenes_urls }),
  });
};

export const deleteInspectionDocument = (documentoId: number): Promise<void> => {
  return apiFetch(`/documentos/${documentoId}`, {
    method: 'DELETE',
  });
};

export const addDocumentToInspeccion = (inspeccionId: number, formData: FormData): Promise<any> => {
  // Nota: formData debe contener un campo 'file' con el archivo PDF
  return apiFetch(`/inspecciones/${inspeccionId}/documentos`, {
    method: 'POST',
    body: formData,
  });
};

export const downloadFullReportPdf = async (cargamentoId: number): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/cargamentos/${cargamentoId}/full-report-pdf`, {
        credentials: 'include'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al generar el reporte.");
    }
    return response.blob();
};
