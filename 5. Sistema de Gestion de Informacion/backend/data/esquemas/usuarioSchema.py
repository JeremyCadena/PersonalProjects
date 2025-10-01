# banana-env/data/esquemas/usuarioSchema.py
from data.esquemas.general import UserRole
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

# --- Esquemas de Autenticación y Usuarios ---
class UserBase(BaseModel):
    email: EmailStr
    nombres_apellidos: str

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.VISUALIZADOR

class UserUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    nombres_apellidos: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    role: UserRole 

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None 

class UserRoleUpdatePayload(BaseModel):
    new_role: UserRole

class UserActiveStatusUpdatePayload(BaseModel):
    is_active: bool