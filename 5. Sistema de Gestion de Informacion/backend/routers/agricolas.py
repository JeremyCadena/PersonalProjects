# banana-env/routers/agricolas.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from data.esquemas import agricolaSchema, general
from cruds import agricolasCRUD
from data.database import get_db
from data.security import get_current_active_user, has_role
from core.config import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE

router = APIRouter(
    prefix="/agricolas",
    tags=["Agrícolas"],
    dependencies=[Depends(get_current_active_user)],
    responses={404: {"description": "Recurso no encontrado"}},
)

@router.post(
    "/",
    response_model=agricolaSchema.AgricolaResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR]))]
)
def create_new_agricola(
    agricola_data: agricolaSchema.AgricolaCreate,
    db: Session = Depends(get_db)
):
    new_agricola = agricolasCRUD.create_agricola(db, agricola_data)
    return new_agricola

@router.get(
    "/",
    response_model=general.PaginatedResponse[agricolaSchema.AgricolaResponse],
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR]))]
)
def read_all_agricolas_paginated(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Número de la página a obtener."),
    per_page: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description=f"Número de registros por página (máximo {MAX_PAGE_SIZE})."), # Usar constantes
    search: Optional[str] = Query(None, description="Término de búsqueda para filtrar registros agrícolas."),
):
    paginated_agricolas = agricolasCRUD.get_agricolas_paginated(db, page=page, per_page=per_page, search=search)
    return paginated_agricolas


@router.get(
    "/search/",
    response_model=List[agricolaSchema.AgricolaResponse],
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR]))]
)
def search_agricolas_endpoint(
    q: str = Query(..., min_length=2, description="Término de búsqueda"),
    db: Session = Depends(get_db)
):
    return agricolasCRUD.search_agricolas(db=db, search_term=q)

@router.get(
    "/{agricola_id}",
    response_model=agricolaSchema.AgricolaResponse,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR]))]
)
def read_single_agricola(agricola_id: int, db: Session = Depends(get_db)):
    db_agricola = agricolasCRUD.get_agricola(db, agricola_id=agricola_id)
    if db_agricola is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro agrícola no encontrado.")
    return db_agricola

@router.put(
    "/{agricola_id}",
    response_model=agricolaSchema.AgricolaResponse,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR]))]
)
def update_existing_agricola(
    agricola_id: int,
    agricola_data: agricolaSchema.AgricolaUpdate,
    db: Session = Depends(get_db)
):
    updated_agricola = agricolasCRUD.update_agricola(db, agricola_id, agricola_data)
    return updated_agricola

@router.delete(
    "/{agricola_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR]))]
)
def delete_existing_agricola(agricola_id: int, db: Session = Depends(get_db)):
    agricolasCRUD.delete_agricola(db, agricola_id)
    return None