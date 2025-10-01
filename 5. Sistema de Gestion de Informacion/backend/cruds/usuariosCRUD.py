# banana-env/cruds/usuariosCRUD.py
from typing import List, Optional
from data.modelos import usuariosModel
from data.esquemas import usuarioSchema
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from data.security import get_password_hash 

# Operaciones CRUD para Usuarios
def get_user(db: Session, user_id: int) -> Optional[usuariosModel.User]:
    return db.query(usuariosModel.User).filter(usuariosModel.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[usuariosModel.User]:
    return db.query(usuariosModel.User).filter(usuariosModel.User.email == email).first()

def get_user_by_nombres_apellidos(db: Session, nombres_apellidos: str) -> Optional[usuariosModel.User]:
    return db.query(usuariosModel.User).filter(usuariosModel.User.nombres_apellidos == nombres_apellidos).first()

def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[usuariosModel.User]:
    return db.query(usuariosModel.User).offset(skip).limit(limit).all()

def get_all_users_for_selection(db: Session) -> List[usuariosModel.User]:
    return db.query(usuariosModel.User).filter(usuariosModel.User.is_active == True).order_by(usuariosModel.User.nombres_apellidos).all()

def create_user(db: Session, user_data: usuarioSchema.UserCreate) -> usuariosModel.User:
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El email '{user_data.email}' ya está registrado."
        )
    
    if get_user_by_nombres_apellidos(db, user_data.nombres_apellidos):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El nombres_apellidos '{user_data.nombres_apellidos}' ya está en uso."
        )

    hashed_password = get_password_hash(user_data.password)
    
    db_user = usuariosModel.User(
        email=user_data.email,
        nombres_apellidos=user_data.nombres_apellidos,
        hashed_password=hashed_password,
        role=user_data.role 
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(
    db: Session, 
    user_id: int, 
    user_update: usuarioSchema.UserUpdateRequest
) -> usuariosModel.User:
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado para actualizar.")

    if user_update.email != db_user.email:
        existing_user_email = get_user_by_email(db, user_update.email)
        if existing_user_email and existing_user_email.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El email '{user_update.email}' ya está registrado para otro usuario."
            )

    if user_update.nombres_apellidos != db_user.nombres_apellidos:
        existing_user_nombres_apellidos = get_user_by_nombres_apellidos(db, user_update.nombres_apellidos)
        if existing_user_nombres_apellidos and existing_user_nombres_apellidos.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El nombres_apellidos '{user_update.nombres_apellidos}' ya está en uso por otro usuario."
            )

    if user_update.password: 
        db_user.hashed_password = get_password_hash(user_update.password)
    
    update_data = user_update.model_dump(exclude={"password"}, exclude_unset=True, exclude_none=True)

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.add(db_user) 
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_role(db: Session, user_id: int, new_role: usuarioSchema.UserRole) -> usuariosModel.User:
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado para actualizar el rol.")

    db_user.role = new_role 
    db.commit()
    db.refresh(db_user)
    return db_user

def set_user_active_status(db: Session, user_id: int, is_active: bool) -> usuariosModel.User:
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado para cambiar el estado de actividad.")

    db_user.is_active = is_active
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> usuariosModel.User:
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado para eliminar.")

    db.delete(db_user)
    db.commit()
    return db_user