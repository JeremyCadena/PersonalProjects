# banana-env/data/esquemas/chofereSchema.py
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

# --- Esquemas para Choferes ---
class ChoferBase(BaseModel):
    cedula: str = Field(pattern=r'^[0-9]{10}$', max_length=10)
    nombres: str = Field(max_length=255)
    apellidos: str = Field(max_length=255)
    placa_cabezal: str = Field(max_length=10)
    telefono: str = Field(pattern=r'^[0-9]{10}$', max_length=10)

class ChoferCreate(ChoferBase):
    pass 

class ChoferUpdate(BaseModel):
    cedula: Optional[str] = Field(None, pattern=r'^[0-9]{10}$', max_length=10)
    nombres: Optional[str] = Field(None, max_length=255)
    apellidos: Optional[str] = Field(None, max_length=255)
    placa_cabezal: Optional[str] = Field(None, max_length=10)
    telefono: Optional[str] = Field(None, pattern=r'^[0-9]{10}$', max_length=10)

class Chofer(ChoferBase):
    chofer_id: int

    model_config = ConfigDict(from_attributes=True)

class ChoferResponse(ChoferBase):
    chofer_id: int
    model_config = ConfigDict(from_attributes=True)