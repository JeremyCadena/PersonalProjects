# banana-env/cruds/inspeccionesCRUD.py
from typing import List, Optional
from data.modelos import inspeccionesModel, cargamentosModel, usuariosModel
from data.esquemas import inspeccioneSchema
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

# Operaciones CRUD para Inspecciones
def get_inspeccion(db: Session, inspeccion_id: int) -> Optional[inspeccionesModel.Inspeccion]:
    return db.query(inspeccionesModel.Inspeccion)\
             .options(joinedload(inspeccionesModel.Inspeccion.imagenes))\
             .filter(inspeccionesModel.Inspeccion.inspeccion_id == inspeccion_id)\
             .first()

def get_inspecciones_by_cargamento(
    db: Session, cargamento_id: int, skip: int = 0, limit: int = 100
) -> List[inspeccionesModel.Inspeccion]:
    return db.query(inspeccionesModel.Inspeccion)\
             .options(joinedload(inspeccionesModel.Inspeccion.imagenes))\
             .filter(inspeccionesModel.Inspeccion.cargamento_id == cargamento_id)\
             .offset(skip)\
             .limit(limit)\
             .all()

def get_all_inspecciones (db: Session, skip: int = 0, limit: int = 100) -> List[inspeccionesModel.Inspeccion]:
    return db.query(inspeccionesModel.Inspeccion)\
             .options(joinedload(inspeccionesModel.Inspeccion.imagenes))\
             .offset(skip)\
             .limit(limit)\
             .all()

def create_inspeccion(db: Session, inspeccion_data: inspeccioneSchema.InspeccionCreate) -> inspeccionesModel.Inspeccion:
    cargamento_exists = db.query(cargamentosModel.Cargamento)\
                          .filter(cargamentosModel.Cargamento.cargamento_id == inspeccion_data.cargamento_id)\
                          .first()
    if not cargamento_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cargamento con ID {inspeccion_data.cargamento_id} no encontrado para asociar la inspección."
        )
    
    inspector_exists = db.query(usuariosModel.User).filter(usuariosModel.User.id == inspeccion_data.user_id).first()
    if not inspector_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario (inspector) con ID {inspeccion_data.user_id} no encontrado."
        )
        
    db_inspeccion_data = inspeccion_data.model_dump(exclude={"imagenes"}) 
    db_inspeccion = inspeccionesModel.Inspeccion(**db_inspeccion_data)

    db.add(db_inspeccion)
    db.commit()
    db.refresh(db_inspeccion)

    if inspeccion_data.imagenes: 
        for img_data in inspeccion_data.imagenes:
            db_imagen = inspeccionesModel.ImagenesInspeccion( 
                inspeccion_id=db_inspeccion.inspeccion_id, 
                url=img_data.url 
            )
            db.add(db_imagen) 
        db.commit() 

    db.refresh(db_inspeccion) 
    return db_inspeccion

def update_inspeccion(
    db: Session,
    inspeccion_id: int,
    inspeccion_update: inspeccioneSchema.InspeccionBase
) -> inspeccionesModel.Inspeccion:
    db_inspeccion = get_inspeccion(db, inspeccion_id)
    if not db_inspeccion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspección no encontrada para actualizar.")
    
    if inspeccion_update.user_id:
        user_exists = db.query(usuariosModel.User).filter(usuariosModel.User.id == inspeccion_update.user_id).first()
        if not user_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Usuario inspector con ID {inspeccion_update.user_id} no encontrado.")

    if inspeccion_update.cargamento_id is not None and inspeccion_update.cargamento_id != db_inspeccion.cargamento_id:
        new_cargamento_exists = db.query(cargamentosModel.Cargamento)\
                                  .filter(cargamentosModel.Cargamento.cargamento_id == inspeccion_update.cargamento_id)\
                                  .first()
        if not new_cargamento_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cargamento con ID {inspeccion_update.cargamento_id} no encontrado para reasignar la inspección."
            )

    update_data = inspeccion_update.model_dump(exclude_unset=True, exclude_none=True)
    for key, value in update_data.items():
        setattr(db_inspeccion, key, value)
    
    update_data.pop('imagenes', None) 

    for key, value in update_data.items():
        setattr(db_inspeccion, key, value)

    db.add(db_inspeccion)
    db.commit()
    db.refresh(db_inspeccion)
    return db_inspeccion

def delete_inspeccion(db: Session, inspeccion_id: int) -> inspeccionesModel.Inspeccion:
    db_inspeccion = get_inspeccion(db, inspeccion_id)
    if not db_inspeccion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspección no encontrada para eliminar.")

    db.delete(db_inspeccion)
    db.commit()
    return db_inspeccion 

# Operaciones CRUD para ImagenesInspeccion
def get_imagen_inspeccion(db: Session, imagen_id: int) -> Optional[inspeccionesModel.ImagenesInspeccion]:
    return db.query(inspeccionesModel.ImagenesInspeccion)\
             .filter(inspeccionesModel.ImagenesInspeccion.imagen_id == imagen_id)\
             .first()

def get_imagenes_by_inspeccion(
    db: Session, inspeccion_id: int, skip: int = 0, limit: int = 100
) -> List[inspeccionesModel.ImagenesInspeccion]:
    return db.query(inspeccionesModel.ImagenesInspeccion)\
             .filter(inspeccionesModel.ImagenesInspeccion.inspeccion_id == inspeccion_id)\
             .offset(skip)\
             .limit(limit)\
             .all()

def create_imagen_inspeccion(db: Session, imagen_data: inspeccioneSchema.ImagenesInspeccionCreate) -> inspeccionesModel.ImagenesInspeccion:
    inspeccion_exists = db.query(inspeccionesModel.Inspeccion)\
                          .filter(inspeccionesModel.Inspeccion.inspeccion_id == imagen_data.inspeccion_id)\
                          .first()
    if not inspeccion_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspección con ID {imagen_data.inspeccion_id} no encontrada para asociar la imagen."
        )

    db_imagen = inspeccionesModel.ImagenesInspeccion(**imagen_data.model_dump(exclude_none=True, exclude_unset=True))
    db.add(db_imagen)
    db.commit()
    db.refresh(db_imagen)
    return db_imagen

def update_imagen_inspeccion(
    db: Session, imagen_id: int, imagen_update: inspeccioneSchema.ImagenesInspeccionBase
) -> inspeccionesModel.ImagenesInspeccion:
    db_imagen = get_imagen_inspeccion(db, imagen_id)
    if not db_imagen:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen de inspección no encontrada para actualizar.")

    if imagen_update.url is not None:
        db_imagen.url = imagen_update.url

    db.add(db_imagen)
    db.commit()
    db.refresh(db_imagen)
    return db_imagen

def delete_imagen_inspeccion(db: Session, imagen_id: int) -> inspeccionesModel.ImagenesInspeccion:
    db_imagen = get_imagen_inspeccion(db, imagen_id)
    if not db_imagen:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen de inspección no encontrada para eliminar.")

    db.delete(db_imagen)
    db.commit()
    return db_imagen