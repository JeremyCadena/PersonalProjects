# banana-env/cruds/choferesCRUD.py
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session 
from sqlalchemy import or_
import math
from data.modelos import choferesModel 
from data.esquemas import chofereSchema

# Operaciones CRUD para Choferes
def get_chofer(db: Session, chofer_id: int) -> Optional[choferesModel.Chofer]:
    return db.query(choferesModel.Chofer).filter(choferesModel.Chofer.chofer_id == chofer_id).first()

def get_chofer_by_cedula(db: Session, cedula: str) -> Optional[choferesModel.Chofer]:
    return db.query(choferesModel.Chofer).filter(choferesModel.Chofer.cedula == cedula).first()

def get_chofer_by_placa_cabezal(db: Session, placa_cabezal: str) -> Optional[choferesModel.Chofer]:
    return db.query(choferesModel.Chofer).filter(choferesModel.Chofer.placa_cabezal == placa_cabezal).first()

def get_choferes_paginated(
    db: Session, 
    page: int = 1, 
    per_page: int = 20, 
    search: Optional[str] = None
) -> Dict[str, Any]:
    if page < 1: page = 1
    if per_page < 1: per_page = 20

    query = db.query(choferesModel.Chofer)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                choferesModel.Chofer.cedula.ilike(search_pattern),
                choferesModel.Chofer.nombres.ilike(search_pattern),
                choferesModel.Chofer.apellidos.ilike(search_pattern),
                choferesModel.Chofer.placa_cabezal.ilike(search_pattern),
                choferesModel.Chofer.telefono.ilike(search_pattern)
            )
        )

    total_items = query.count()
    total_pages = math.ceil(total_items / per_page)
    items_query = query.order_by(choferesModel.Chofer.nombres).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "total_items": total_items,
        "total_pages": total_pages,
        "current_page": page,
        "items": items_query
    }

def create_chofer(db: Session, chofer: chofereSchema.ChoferCreate) -> choferesModel.Chofer:
    if get_chofer_by_cedula(db, chofer.cedula):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La cédula '{chofer.cedula}' ya está registrada para otro chofer."
        )
    if get_chofer_by_placa_cabezal(db, chofer.placa_cabezal):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"La placa de cabezal '{chofer.placa_cabezal}' ya está registrada."
        )

    db_chofer = choferesModel.Chofer(**chofer.model_dump())
    db.add(db_chofer)
    db.commit()
    db.refresh(db_chofer)
    return db_chofer

def update_chofer(
    db: Session,
    chofer_id: int,
    chofer_update: chofereSchema.ChoferUpdate
) -> choferesModel.Chofer:
    db_chofer = get_chofer(db, chofer_id)
    if not db_chofer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chofer no encontrado para actualizar.")

    if chofer_update.cedula is not None and chofer_update.cedula != db_chofer.cedula:
        existing_chofer_cedula = get_chofer_by_cedula(db, chofer_update.cedula)
        if existing_chofer_cedula and existing_chofer_cedula.chofer_id != chofer_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"La cédula '{chofer_update.cedula}' ya está registrada para otro chofer."
            )

    if chofer_update.placa_cabezal is not None and chofer_update.placa_cabezal != db_chofer.placa_cabezal:
        existing_chofer_placa = get_chofer_by_placa_cabezal(db, chofer_update.placa_cabezal)
        if existing_chofer_placa and existing_chofer_placa.chofer_id != chofer_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"La placa de cabezal '{chofer_update.placa_cabezal}' ya está registrada para otro chofer."
            )
            
    update_data = chofer_update.model_dump(exclude_unset=True) 

    for key, value in update_data.items():
        setattr(db_chofer, key, value)

    db.add(db_chofer)
    db.commit()
    db.refresh(db_chofer)
    return db_chofer

def delete_chofer(db: Session, chofer_id: int):
    db_chofer = get_chofer(db, chofer_id)
    if not db_chofer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chofer no encontrado para eliminar.")
    
    db.delete(db_chofer)
    db.commit()
    return {"message": "Chofer eliminado exitosamente."}

def search_choferes(db: Session, search_term: str) -> List[choferesModel.Chofer]:
    search_pattern = f"%{search_term}%"
    return db.query(choferesModel.Chofer).filter(
        or_(
            choferesModel.Chofer.nombres.ilike(search_pattern),
            choferesModel.Chofer.apellidos.ilike(search_pattern),
        )
    ).all()