# banana-env/cruds/agricolasCRUD.py
from sqlalchemy import or_, and_ 
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
import math
from data.modelos import agricolasModel 
from data.esquemas import agricolaSchema 

def get_agricola(db: Session, agricola_id: int) -> Optional[agricolasModel.Agricola]:
    return db.query(agricolasModel.Agricola).filter(agricolasModel.Agricola.agricola_id == agricola_id).first()

def get_agricola_by_finca_and_exportadora(db: Session, finca_name: str, exportadora_name: str) -> Optional[agricolasModel.Agricola]:
    return db.query(agricolasModel.Agricola).filter(
        and_(
            agricolasModel.Agricola.finca == finca_name,
            agricolasModel.Agricola.exportadora == exportadora_name
        )
    ).first()

def get_agricolas_paginated(
    db: Session, 
    page: int = 1, 
    per_page: int = 20, 
    search: Optional[str] = None
) -> Dict[str, Any]:
    if page < 1: page = 1
    if per_page < 1: per_page = 20

    query = db.query(agricolasModel.Agricola)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                agricolasModel.Agricola.magap.ilike(search_pattern),
                agricolasModel.Agricola.codigo.ilike(search_pattern),
                agricolasModel.Agricola.productor.ilike(search_pattern),
                agricolasModel.Agricola.finca.ilike(search_pattern),
                agricolasModel.Agricola.sector.ilike(search_pattern),
                agricolasModel.Agricola.exportadora.ilike(search_pattern),
            )
        )

    total_items = query.count()
    total_pages = math.ceil(total_items / per_page)
    items_query = query.order_by(agricolasModel.Agricola.finca).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "total_items": total_items,
        "total_pages": total_pages,
        "current_page": page,
        "items": items_query
    }

def create_agricola(db: Session, agricola_data: agricolaSchema.AgricolaCreate) -> agricolasModel.Agricola:
    if agricola_data.finca and agricola_data.exportadora:
        existing_agricola = get_agricola_by_finca_and_exportadora(db, agricola_data.finca, agricola_data.exportadora)
        if existing_agricola:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"La combinación de finca '{agricola_data.finca}' y exportadora '{agricola_data.exportadora}' ya está registrada."
            )
    
    db_agricola = agricolasModel.Agricola(**agricola_data.model_dump())
    db.add(db_agricola)
    db.commit()
    db.refresh(db_agricola)
    return db_agricola

def update_agricola(db: Session, agricola_id: int, agricola_update: agricolaSchema.AgricolaUpdate) -> agricolasModel.Agricola:
    db_agricola = get_agricola(db, agricola_id)
    if not db_agricola:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro agrícola no encontrado.")

    finca_to_check = agricola_update.finca if agricola_update.finca is not None else db_agricola.finca
    exportadora_to_check = agricola_update.exportadora if agricola_update.exportadora is not None else db_agricola.exportadora

    if finca_to_check is not None and exportadora_to_check is not None:
        existing_agricola_combo = get_agricola_by_finca_and_exportadora(db, finca_to_check, exportadora_to_check)
        
        if existing_agricola_combo and existing_agricola_combo.agricola_id != agricola_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"La combinación de finca '{finca_to_check}' y exportadora '{exportadora_to_check}' ya está registrada en otro registro."
            )
    
    update_data = agricola_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_agricola, key, value)

    db.add(db_agricola)
    db.commit()
    db.refresh(db_agricola)
    return db_agricola

def delete_agricola(db: Session, agricola_id: int):
    db_agricola = get_agricola(db, agricola_id)
    if not db_agricola:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro agrícola no encontrado para eliminar.")
    db.delete(db_agricola)
    db.commit()
    return {"message": "Registro agrícola eliminado exitosamente."}

def search_agricolas(db: Session, search_term: str) -> List[agricolasModel.Agricola]:
    search_pattern = f"%{search_term}%"
    return db.query(agricolasModel.Agricola).filter(
        or_(
            agricolasModel.Agricola.finca.ilike(search_pattern),
            agricolasModel.Agricola.exportadora.ilike(search_pattern)
        )
    ).all()