# banana-env/data/esquemas/cargamentoSchema.py
import datetime
from typing import Annotated, Literal, Optional, Union
from data.esquemas.agricolaSchema import AgricolaResponse
from data.esquemas.chofereSchema import ChoferResponse
from data.esquemas.general import CargamentoDiscriminator
from pydantic import BaseModel, ConfigDict, Discriminator, Field, field_validator

# --- Esquemas para Cargamento ---
class CargamentoBase(BaseModel):
    chofer_id: int
    agricolas_id: int 
    marca: str = Field(max_length=100)
    numero_vapor: Optional[str] = Field(None, max_length=50) 
    puerto: Optional[str] = Field(None, max_length=100)
    vapor: Optional[str] = Field(None, max_length=100)
    fecha: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))

    @field_validator('marca', 'numero_vapor', 'puerto', 'vapor')  
    @classmethod
    def strip_whitespace(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

class CargaSueltaSchema(CargamentoBase):
    tipo_cargamento: Literal[CargamentoDiscriminator.CARGA_SUELTA] = CargamentoDiscriminator.CARGA_SUELTA
    tipo_cargasuelta: Literal['CAMION', 'FURGON']
    rastreo_cargasuelta: str = Field(max_length=10)

class ContenedorSchema(CargamentoBase):
    tipo_cargamento: Literal[CargamentoDiscriminator.CONTENEDOR] = CargamentoDiscriminator.CONTENEDOR
    codigo_contenedor: str = Field(max_length=20)
    rastreo_barra_contenedor: str = Field(max_length=10)
    rastreo_sello_contenedor: str = Field(max_length=20)

CargamentoCreate = Annotated[
    Union[CargaSueltaSchema, ContenedorSchema],
    Discriminator('tipo_cargamento')
]

class CargamentoResponse(CargamentoBase):
    cargamento_id: int
    tipo_cargamento: CargamentoDiscriminator
    agricola_rel: Optional[AgricolaResponse] = None 
    chofer_rel: Optional[ChoferResponse] = None 

    # Propiedades específicas de CargaSuelta
    tipo_cargasuelta: Optional[Literal['CAMION', 'FURGON']] = None
    rastreo_cargasuelta: Optional[str] = None

    # Propiedades específicas de Contenedor
    codigo_contenedor: Optional[str] = None
    rastreo_barra_contenedor: Optional[str] = None
    rastreo_sello_contenedor: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator('marca', 'numero_vapor', 'puerto', 'vapor', 
                   'rastreo_cargasuelta', 'rastreo_barra_contenedor', 
                   'rastreo_sello_contenedor', 'codigo_contenedor')
    @classmethod
    def strip_whitespace(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

# Esquemas de actualización para cargamento
class CargaSueltaUpdate(BaseModel):
    chofer_id: Optional[int] = None
    agricolas_id: Optional[int] = None
    marca: Optional[str] = Field(None, max_length=100)
    numero_vapor: Optional[str] = Field(None, max_length=50)
    puerto: Optional[str] = Field(None, max_length=100)
    vapor: Optional[str] = Field(None, max_length=100)
    fecha: Optional[datetime.datetime] = None 
    
    tipo_cargamento: Literal[CargamentoDiscriminator.CARGA_SUELTA] = CargamentoDiscriminator.CARGA_SUELTA
    tipo_cargasuelta: Optional[Literal['CAMION', 'FURGON']] = None
    rastreo_cargasuelta: Optional[str] = Field(None, max_length=10)

class ContenedorUpdate(BaseModel):
    chofer_id: Optional[int] = None
    agricolas_id: Optional[int] = None
    marca: Optional[str] = Field(None, max_length=100)
    numero_vapor: Optional[str] = Field(None, max_length=50)
    puerto: Optional[str] = Field(None, max_length=100)
    vapor: Optional[str] = Field(None, max_length=100)
    fecha: Optional[datetime.datetime] = None 

    tipo_cargamento: Literal[CargamentoDiscriminator.CONTENEDOR] = CargamentoDiscriminator.CONTENEDOR
    codigo_contenedor: Optional[str] = Field(None, max_length=20)
    rastreo_barra_contenedor: Optional[str] = Field(None, max_length=10)
    rastreo_sello_contenedor: Optional[str] = Field(None, max_length=20)

CargamentoUpdate = Annotated[
    Union[CargaSueltaUpdate, ContenedorUpdate],
    Discriminator('tipo_cargamento')
]