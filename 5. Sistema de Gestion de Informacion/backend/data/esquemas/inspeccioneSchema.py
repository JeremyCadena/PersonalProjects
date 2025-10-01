# banana-env/data/esquemas/inspeccioneSchema.py
import datetime
from typing import List, Optional
from data.esquemas.general import TipoInspeccion, NivelRiesgo
from data.esquemas.usuarioSchema import User 
from pydantic import BaseModel, ConfigDict, Field

# --- Esquemas para Inspecciones ---
class ImagenesInspeccionBase(BaseModel):
    url: str = Field(max_length=500)

class ImagenesInspeccionCreate(ImagenesInspeccionBase):
    inspeccion_id: int 

class ImagenesInspeccionResponse(ImagenesInspeccionBase):
    imagen_id: int
    inspeccion_id: int
    model_config = ConfigDict(from_attributes=True)

class InspeccionBase(BaseModel):
    cargamento_id: int
    fecha: Optional[datetime.date] = None
    observacion: Optional[str] = None
    tipo_inspeccion: TipoInspeccion
    nivel_riesgo: NivelRiesgo

    user_id: int 
    jefe_planta_nombre: Optional[str] = Field(None, max_length=255) 

class InspeccionCreate(InspeccionBase):
    imagenes: Optional[List[ImagenesInspeccionBase]] = None 

class InspeccionResponse(InspeccionBase):
    inspeccion_id: int
    imagenes: List[ImagenesInspeccionResponse] = []
    inspector_rel: Optional[User] = None 

    model_config = ConfigDict(from_attributes=True)

class InspeccionUpdate(BaseModel):
    cargamento_id: Optional[int] = None
    observacion: Optional[str] = Field(None, max_length=500)
    tipo_inspeccion: Optional[TipoInspeccion] = None
    nivel_riesgo: Optional[NivelRiesgo] = None
    user_id: Optional[int] = None
    jefe_planta_nombre: Optional[str] = Field(None, max_length=255)
