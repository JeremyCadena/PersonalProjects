# banana-env/data/esquemas/general.py
from enum import Enum as PyEnum
from pydantic import BaseModel, Field
from typing import List, TypeVar, Generic

# --- Definición de ENUMs Pydantic ---
class UserRole(str, PyEnum):
    ADMINISTRADOR = "administrador"
    INSPECTOR = "inspector"
    VISUALIZADOR = "visualizador"

class TipoInspeccion(str, PyEnum):
    CANINA = "CANINA"
    INTERNA = "INTERNA"
    EXTERNA = "EXTERNA"
    DE_CARGA = "DE CARGA"

class NivelRiesgo(str, PyEnum):
    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"

class CargamentoDiscriminator(str, PyEnum):
    CARGA_SUELTA = "carga_suelta"
    CONTENEDOR = "contenedor"

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    total_items: int = Field(..., description="Número total de registros que coinciden con la consulta.")
    total_pages: int = Field(..., description="Número total de páginas disponibles.")
    current_page: int = Field(..., description="La página actual que se está devolviendo.")
    items: List[T] = Field(..., description="La lista de registros para la página actual.")