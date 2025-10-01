# banana-env/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Response 
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
from data.esquemas import usuarioSchema
from cruds import usuariosCRUD
from data.database import get_db
from data.security import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from core.config import ENVIRONMENT 

router = APIRouter(
    tags=["Autenticación"]
)

# Registro de Usuario
@router.post("/register/", response_model=usuarioSchema.User, status_code=status.HTTP_201_CREATED)
def register_user(user_data: usuarioSchema.UserCreate, db: Session = Depends(get_db)):
    new_user = usuariosCRUD.create_user(db=db, user_data=user_data)
    return new_user

@router.post("/token")
async def login_for_access_token(
    response: Response, 
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de inicio de sesión inválidas.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta de usuario está inactiva.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )

    response.set_cookie(
        key="access_token_cookie",
        value=access_token,
        expires=datetime.now(timezone.utc) + access_token_expires, 
        httponly=True,
        secure=ENVIRONMENT == "production",
        samesite="lax",
        path="/"
    )

    return {"access_token": access_token, "token_type": "bearer"}