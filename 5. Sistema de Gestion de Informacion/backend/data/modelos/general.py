# banana-env/data/modelos/general.py
from sqlalchemy.dialects.postgresql import ENUM as PGEnum
import enum

# --- Definiciones de ENUMs ---
class TipoInspeccionEnum(str, enum.Enum):
    CANINA = "CANINA"
    INTERNA = "INTERNA"
    EXTERNA = "EXTERNA"
    DE_CARGA = "DE CARGA"

class NivelRiesgoEnum(str, enum.Enum):
    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"

class UserRoleEnum(str, enum.Enum):
    ADMINISTRADOR = "administrador"
    INSPECTOR = "inspector"
    VISUALIZADOR = "visualizador"

class CargamentoDiscriminatorEnum(str, enum.Enum):
    CARGA_SUELTA = "carga_suelta"
    CONTENEDOR = "contenedor"

PG_UserRoleEnum = PGEnum(*[e.value for e in UserRoleEnum], name='user_role', create_type=False)
PG_TipoInspeccionEnum = PGEnum(*[e.value for e in TipoInspeccionEnum], name='tipo_inspeccion_enum', create_type=False)
PG_CargamentoDiscriminatorEnum = PGEnum(*[e.value for e in CargamentoDiscriminatorEnum], name='cargamento_discriminator_enum', create_type=False)
PG_NivelRiesgoEnum = PGEnum(*[e.value for e in NivelRiesgoEnum], name='nivel_riesgo_enum', create_type=False)