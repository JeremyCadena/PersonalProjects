# banana-env/routers/users.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from data.esquemas import usuarioSchema
from data.modelos import usuariosModel, general
from cruds import usuariosCRUD
from data.database import get_db 
from data.security import get_current_active_user, has_role 

router = APIRouter(
    prefix="/users",
    tags=["Usuarios"],
    dependencies=[Depends(get_current_active_user)],
    responses={404: {"description": "Recurso no encontrado"}},
)


# Operaciones CRUD de Usuarios (Exclusivas del Administrador)
@router.post(
    "/",
    response_model=usuarioSchema.User,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(has_role([usuarioSchema.UserRole.ADMINISTRADOR]))]
)
def create_new_user(user_data: usuarioSchema.UserCreate, db: Session = Depends(get_db)):
    new_user = usuariosCRUD.create_user(db=db, user_data=user_data)
    return new_user

@router.get(
    "/",
    response_model=List[usuarioSchema.User],
    dependencies=[Depends(has_role([usuarioSchema.UserRole.ADMINISTRADOR]))]
)
def read_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    all_users = usuariosCRUD.get_all_users(db, skip=skip, limit=limit)
    return all_users

@router.get(
    "/{user_id}",
    response_model=usuarioSchema.User,
    dependencies=[Depends(has_role([usuarioSchema.UserRole.ADMINISTRADOR]))]
)
def read_single_user(user_id: int, db: Session = Depends(get_db)):
    db_user = usuariosCRUD.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    return db_user

@router.put(
    "/{user_id}",
    response_model=usuarioSchema.User,
    dependencies=[Depends(has_role([usuarioSchema.UserRole.ADMINISTRADOR]))]
)
def update_existing_user(
    user_id: int,
    user_data: usuarioSchema.UserUpdateRequest,
    db: Session = Depends(get_db)
):
    updated_user = usuariosCRUD.update_user(db, user_id, user_data)
    return updated_user

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_role([usuarioSchema.UserRole.ADMINISTRADOR]))]
)
def delete_existing_user(user_id: int, db: Session = Depends(get_db)):
    usuariosCRUD.delete_user(db=db, user_id=user_id)
    return {"message": "Usuario eliminado exitosamente."}

# Rutas de Usuario (para Administrador)
@router.put(
    "/{user_id}/role",
    response_model=usuarioSchema.User,
    dependencies=[Depends(has_role([usuarioSchema.UserRole.ADMINISTRADOR]))]
)
def update_user_role_route(
    user_id: int,
    payload: usuarioSchema.UserRoleUpdatePayload,
    db: Session = Depends(get_db)
):
    updated_user = usuariosCRUD.update_user_role(db, user_id=user_id, new_role=payload.new_role)
    return updated_user

@router.put(
    "/{user_id}/active",
    response_model=usuarioSchema.User,
    dependencies=[Depends(has_role([usuarioSchema.UserRole.ADMINISTRADOR]))]
)
def set_user_active_status_route(
    user_id: int,
    payload: usuarioSchema.UserActiveStatusUpdatePayload,
    db: Session = Depends(get_db)
):
    updated_user = usuariosCRUD.set_user_active_status(db, user_id=user_id, is_active=payload.is_active)
    return updated_user

@router.get(
    "/me/",
    response_model=usuarioSchema.User
)
async def read_current_user_info(current_user: usuariosModel.User = Depends(get_current_active_user)):
    return current_user

@router.get(
    "/all/list",
    response_model=List[usuarioSchema.User],
    dependencies=[Depends(has_role([general.UserRoleEnum.ADMINISTRADOR, general.UserRoleEnum.INSPECTOR]))]
)
def read_all_users_for_selection(db: Session = Depends(get_db)):
    return usuariosCRUD.get_all_users_for_selection(db=db)