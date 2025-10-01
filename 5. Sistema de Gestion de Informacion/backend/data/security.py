# banana-env/data/security.py
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from data.modelos import usuariosModel
from data.esquemas import usuarioSchema
from data.database import get_db
from core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token") 

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No se pudieron validar las credenciales. Por favor, inicie sesión de nuevo.",
    headers={"WWW-Authenticate": "Bearer"},
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(db: Session, email: str, password: str) -> Optional[usuariosModel.User]:
    user = db.query(usuariosModel.User).filter(usuariosModel.User.email == email).first()
    if not user:
        return False 
    if not verify_password(password, user.hashed_password):
        return False 
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> usuariosModel.User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role_str: str = payload.get("role")
        
        if email is None or role_str is None:
            raise CREDENTIALS_EXCEPTION 
        
        token_data = usuarioSchema.TokenData(email=email, role=usuarioSchema.UserRole(role_str))
        
    except JWTError:
        raise CREDENTIALS_EXCEPTION 
    except ValueError: 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rol de usuario inválido en el token.")

    user = db.query(usuariosModel.User).filter(usuariosModel.User.email == token_data.email).first() 
    if user is None:
        raise CREDENTIALS_EXCEPTION 
    
    if user.role != token_data.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Su rol ha cambiado. Por favor, inicie sesión de nuevo para actualizar sus permisos."
        )
    return user

async def get_current_active_user(current_user: usuariosModel.User = Depends(get_current_user)) -> usuariosModel.User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuario inactivo.")
    return current_user

def has_role(required_roles: List[usuarioSchema.UserRole]):
    def role_checker(current_user: usuariosModel.User = Depends(get_current_active_user)) -> usuariosModel.User:
        if current_user.role not in required_roles:
            roles_str = ", ".join([r.value for r in required_roles])
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tiene permisos suficientes. Se requiere uno de los siguientes roles: {roles_str}."
            )
        return current_user
    return role_checker