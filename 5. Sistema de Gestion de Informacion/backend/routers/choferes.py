# banana-env/routers/choferes.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from data.esquemas import chofereSchema, general
from cruds import choferesCRUD
from data.database import get_db
from data.security import get_current_active_user, has_role 
from core.config import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE

router = APIRouter(
    prefix="/choferes",
    tags=["Choferes"],
    dependencies=[Depends(get_current_active_user)],
    responses={404: {"description": "Recurso no encontrado"}},
)

# Operaciones CRUD de Choferes
@router.post(
    "/",
    response_model=chofereSchema.Chofer,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def create_new_chofer(chofer_data: chofereSchema.ChoferCreate, db: Session = Depends(get_db)):
    new_chofer = choferesCRUD.create_chofer(db=db, chofer=chofer_data)
    return new_chofer

@router.get(
    "/",
    response_model=general.PaginatedResponse[chofereSchema.Chofer],
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def read_all_choferes_paginated(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Número de la página a obtener."),
    per_page: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description=f"Número de registros por página (máximo {MAX_PAGE_SIZE})."), 
    search: Optional[str] = Query(None, description="Término de búsqueda para filtrar choferes.")
):
    paginated_choferes = choferesCRUD.get_choferes_paginated(db, page=page, per_page=per_page, search=search)
    return paginated_choferes

@router.get(
    "/search/",
    response_model=List[chofereSchema.Chofer],
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def search_choferes_endpoint(
    q: str = Query(..., min_length=2, description="Término de búsqueda"),
    db: Session = Depends(get_db)
):
    return choferesCRUD.search_choferes(db=db, search_term=q)


@router.get(
    "/{chofer_id}",
    response_model=chofereSchema.Chofer,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def read_single_chofer(chofer_id: int, db: Session = Depends(get_db)):
    db_chofer = choferesCRUD.get_chofer(db, chofer_id=chofer_id)
    if db_chofer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chofer no encontrado.")
    return db_chofer

@router.put(
    "/{chofer_id}",
    response_model=chofereSchema.Chofer,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def update_existing_chofer(
    chofer_id: int,
    chofer_data: chofereSchema.ChoferUpdate,
    db: Session = Depends(get_db)
):
    updated_chofer = choferesCRUD.update_chofer(db, chofer_id, chofer_data)
    return updated_chofer


@router.delete(
    "/{chofer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR]))]
)
def delete_existing_chofer(chofer_id: int, db: Session = Depends(get_db)):
    return choferesCRUD.delete_chofer(db, chofer_id) 