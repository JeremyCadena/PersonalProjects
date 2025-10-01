// ARCHIVO: /lib/types.ts

// ENUMs que coinciden con el backend
export enum RolUsuario {
  ADMIN = "ADMIN",
  INSPECTOR = "INSPECTOR",
  VISUALIZADOR = "VISUALIZADOR"
}

export enum TipoInspeccion {
  CANINA = "CANINA",
  INTERNA = "INTERNA",
  EXTERNA = "EXTERNA",
  DE_CARGA = "DE CARGA",
  NOVEDAD = "NOVEDAD"
}

export enum NivelRiesgo {
  BAJO = "BAJO",
  MEDIO = "MEDIO",
  ALTO = "ALTO",
}

export enum TipoVehiculo {
  CAMION = "CAMIÓN",
  FURGON = "FURGÓN",
  CONTENEDOR = "CONTENEDOR"
}

export enum AfiliacionFinca {
  PALMAR = "PALMAR",
  MIDAJA = "MIDAJA",
  DANILUP = "DANILUP",
  EXTERNA = "EXTERNA",
  ACOPIO = "ACOPIO"
}

// --- Autenticación y Usuarios ---
export type AuthToken = {
  access_token: string;
  token_type: string;
};

export type Usuario = {
  user_id: number;
  nickname: string;
  nombres_apellidos: string;
  is_active: boolean;
  role: RolUsuario;
  is_deleted: boolean;
  deleted_at: string | null;
};

export type UsuarioCreate = {
  nickname: string;
  nombres_apellidos: string;
  password: string;
  role?: RolUsuario;
};

export type UsuarioUpdate = {
  nickname?: string;
  nombres_apellidos?: string;
  password?: string;
  role?: RolUsuario;
  is_active?: boolean;
}

// --- Choferes ---
export type Chofer = {
  chofer_id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  placa_cabezal: string;
  telefono: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by_user_id: number | null;
  motivo_eliminacion?:string | null;
};

export type ChoferCreate = Omit<Chofer, 'chofer_id' | 'is_deleted' | 'deleted_at' | 'deleted_by_user_id'>;
export type ChoferUpdate = Partial<ChoferCreate>;

// --- Productores ---
export type Productor = {
  productor_id: number;
  nombre_productor: string;
  is_deleted: boolean;
  deleted_at: string | null;
};

export type ProductorCreate = Omit<Productor, 'productor_id' | 'is_deleted' | 'deleted_at'>;
export type ProductorUpdate = Partial<ProductorCreate>;

// --- Jefes de Planta ---
export type JefePlanta = {
  jefe_planta_id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by_user_id: number | null;
};

export type JefePlantaCreate = Omit<JefePlanta, 'jefe_planta_id' | 'is_deleted' | 'deleted_at' | 'deleted_by_user_id'>;
export type JefePlantaUpdate = Partial<JefePlantaCreate>;

// --- Agrícolas ---
export type Agricola = {
  agricola_id: number;
  magap: string;
  codigo: string;
  finca: string;
  sector: string;
  afiliacion: AfiliacionFinca;

  productor_rel: Productor;

  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by_user_id: number | null;
};

export type AgricolaCreate = Omit<Agricola, 
  'agricola_id' |
  'productor_rel' |
  'is_deleted' |
  'deleted_at' |
  'deleted_by_user_id'
> & {
  productor_id: number;
};
export type AgricolaUpdate = Partial<AgricolaCreate>;

// --- Exportadoras ---
export type Exportadora = {
  exportadora_id: number;
  nombre: string;
  is_deleted: boolean;
  deleted_at: string | null;
};

export type ExportadoraCreate = Omit<Exportadora, 'exportadora_id' | 'is_deleted' | 'deleted_at'>;
export type ExportadoraUpdate = Partial<ExportadoraCreate>;

// --- Marcas ---
export type Marca = {
  marca_id: number;
  nombre: string;
  is_deleted: boolean;
  deleted_at: string | null;
};

export type MarcaCreate = Omit<Marca, 'marca_id' | 'is_deleted' | 'deleted_at'>;
export type MarcaUpdate = Partial<MarcaCreate>;

// --- Puertos ---
export type Puerto = {
  puerto_id: number;
  nombre_puerto: string;
  ciudad_origen: string
  is_deleted: boolean;
  deleted_at: string | null;
};

export type PuertoCreate = Omit<Puerto, 'puerto_id' | 'is_deleted' | 'deleted_at'>;
export type PuertoUpdate = Partial<PuertoCreate>;

// --- Destinos ---
export type Destino = {
  destino_id: number;
  nombre: string;
  riesgo_historico: number;
  country_code: string;
  is_deleted: boolean;
  deleted_at: string | null;
};

export type DestinoCreate = Omit<Destino, 'destino_id' | 'is_deleted' | 'deleted_at'>;
export type DestinoUpdate = Partial<DestinoCreate>;

// --- Variantes de Marca ---
export type VarianteMarca = {
  variacion_id: number;
  nombre: string;
  marca_id: number;
  destino_id: number;

  marca: Marca
  destino: Destino

  is_deleted: boolean;
  deleted_at: string | null;
};

export type VarianteMarcaCreate = Omit<VarianteMarca, 
'variacion_id' | 'is_deleted' | 'deleted_at' | 'marca' | 'destino'>;
export type VarianteMarcaUpdate = Partial<VarianteMarcaCreate>;

// --- Cargamentos ---
export type Cargamento = {
  cargamento_id: number;
  agricola_id: number;
  chofer_id: number;
  exportadora_id: number;
  puerto_id: number;
  fecha: string;
  tipo_vehiculo: TipoVehiculo;
  rastreo_satelital: string | null;
  codigo_contenedor: string | null;
  rastreo_satelital_contenedor: string | null;
  sello_contenedor: string | null;

  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by_user_id: number | null;
  
  agricola_rel: Agricola;
  chofer_rel: Chofer;
  exportadora_rel: Exportadora;
  puerto_rel: Puerto;

  detalles?: CargamentoDetalle[];
  motivo_eliminacion?:string | null;

  inspecciones_count: number;
};

export type CargamentoCreate = Omit<Cargamento, 
  'cargamento_id' | 'agricola_rel' | 'chofer_rel' | 'exportadora_rel' | 'puerto_rel' |
  'is_deleted' | 'deleted_at' | 'inspecciones_count' |
  'deleted_by_user_id'
> & {
};
export type CargamentoUpdate = Partial<CargamentoCreate>;


// --- Cargamento Detalle ---
export type CargamentoDetalle = {
  detalle_id: number;
  cargamento_id: number;
  variacion_id: number; // ahora puede ser null si se usa marca_id
  vapor: string | null;
  numero_vapor: string | null;

  // Relaciones
  variante_marca_rel?: VarianteMarca;
};

export type CargamentoDetalleCreate = {
  variacion_id: number;
  vapor: string | null;
  numero_vapor: string | null;
};

export type CargamentoDetalleUpdate = Partial<CargamentoDetalleCreate>;

export type FullCargamentoPayload = {
  cargamento: CargamentoCreate;
  detalles: CargamentoDetalleCreate[];
}

export type FullCargamentoUpdatePayload = {
  cargamento: CargamentoUpdate; 
  detalles: CargamentoDetalleUpdate[];
};

// --- Inspecciones ---
export type ImagenInspeccion = {
  imagen_id: number;
  url: string;
  inspeccion_id: number;
};

export type ImagenInspeccionCreate = Omit<ImagenInspeccion, 'imagen_id'>;
export type ImagenInspeccionUpdate = Partial<ImagenInspeccionCreate>;

export type DocumentoInspeccion = {
  documento_id: number;
  url: string;
  inspeccion_id: number;
};



export type Inspeccion = {
  inspeccion_id: number;
  fecha: string; // Las fechas en JSON siempre son strings (formato ISO)
  observacion: string | null;
  tipo_inspeccion: TipoInspeccion;
  nivel_riesgo: NivelRiesgo;
  user_id: number;
  cargamento_id: number;
  jefe_planta_id: number | null;
  
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by_user_id: number | null;

  inspector_rel: Usuario;
  jefe_planta_rel: JefePlanta | null;
  imagenes: ImagenInspeccion[];
  documentos: DocumentoInspeccion[];
};

export type InspeccionCreate = {
  cargamento_id: number;
  fecha: string;
  observacion?: string;
  tipo_inspeccion: TipoInspeccion;
  nivel_riesgo: NivelRiesgo;
  user_id: number;
  jefe_planta_id: number | null;
  
  imagenes_urls: string[];
  documento_url?: string;
};

export type InspeccionUpdate = {
  fecha?: string;
  observacion?: string;
  tipo_inspeccion?: TipoInspeccion;
  nivel_riesgo?: NivelRiesgo;
  jefe_planta_id?: number | null;
};


// --- Búsqueda Paginada ---
export interface PaginatedResponse<T> {
  total_items: number;
  total_pages: number;
  current_page: number;
  items: T[];
}