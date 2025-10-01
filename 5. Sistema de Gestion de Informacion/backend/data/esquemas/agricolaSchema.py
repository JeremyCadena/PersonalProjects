# banana-env/data/esquemas/agricolaSchema.py
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

# --- Esquemas: Agricola ---
class AgricolaBase(BaseModel):
    magap: str = Field(max_length=10)
    codigo: str = Field(max_length=10)
    productor: str = Field(max_length=200)
    finca: str = Field(max_length=100)
    sector: Optional[str] = Field(None, max_length=200)
    exportadora: Optional[str] = Field(None, max_length=100)
    afiliacion: Optional[str] = Field(None, max_length=500)

class AgricolaCreate(AgricolaBase):
    pass

class AgricolaResponse(AgricolaBase):
    agricola_id: int

    model_config = ConfigDict(from_attributes=True)

class AgricolaUpdate(BaseModel):
    magap: Optional[str] = Field(None, max_length=10)
    codigo: Optional[str] = Field(None, max_length=10)
    productor: Optional[str] = Field(None, max_length=200)
    finca: Optional[str] = Field(None, max_length=100)
    sector: Optional[str] = Field(None, max_length=200)
    exportadora: Optional[str] = Field(None, max_length=100)
    afiliacion: Optional[str] = Field(None, max_length=500)