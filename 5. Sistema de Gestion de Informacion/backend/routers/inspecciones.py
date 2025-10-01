# banana-env/routers/inspecciones.py
import uuid, io, logging, datetime 
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from data.esquemas import inspeccioneSchema, general
from cruds import inspeccionesCRUD
from data.database import get_db
from data.security import get_current_active_user, has_role
from PIL import Image
from pathlib import Path
from core.config import UPLOAD_DIRECTORY, THUMBNAIL_SIZE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE 

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/inspecciones",
    tags=["Inspecciones"],
    dependencies=[Depends(get_current_active_user)],
    responses={404: {"description": "Recurso no encontrado"}},
)

# Operaciones CRUD de Inspecciones
@router.post(
    "/",
    response_model=inspeccioneSchema.InspeccionResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def create_new_inspeccion(inspeccion_data: inspeccioneSchema.InspeccionCreate, db: Session = Depends(get_db)):
    new_inspeccion = inspeccionesCRUD.create_inspeccion(db=db, inspeccion_data=inspeccion_data)
    return new_inspeccion

@router.get(
    "/",
    response_model=List[inspeccioneSchema.InspeccionResponse],
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def read_all_inspecciones(
    cargamento_id: Optional[int] = Query(None, description="Filtrar inspecciones por ID de cargamento."),
    skip: int = Query(0, ge=0, description="Número de elementos a omitir."),
    limit: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description=f"Número de elementos a devolver por página (máximo {MAX_PAGE_SIZE})."), 
    db: Session = Depends(get_db)
):
    if cargamento_id:
        all_inspecciones = inspeccionesCRUD.get_inspecciones_by_cargamento(
            db, cargamento_id=cargamento_id, skip=skip, limit=limit
        )
    else:
        all_inspecciones = inspeccionesCRUD.get_all_inspecciones(db, skip=skip, limit=limit)
        
    return all_inspecciones

@router.get(
    "/{inspeccion_id}",
    response_model=inspeccioneSchema.InspeccionResponse, 
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def read_single_inspeccion(inspeccion_id: int, db: Session = Depends(get_db)):
    db_inspeccion = inspeccionesCRUD.get_inspeccion(db, inspeccion_id=inspeccion_id)
    if db_inspeccion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspección no encontrada.")
    return db_inspeccion

@router.put(
    "/{inspeccion_id}",
    response_model=inspeccioneSchema.InspeccionResponse, 
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def update_existing_inspeccion(
    inspeccion_id: int,
    inspeccion_update: inspeccioneSchema.InspeccionBase, 
    db: Session = Depends(get_db)
):
    updated_inspeccion = inspeccionesCRUD.update_inspeccion(db, inspeccion_id, inspeccion_update)
    return updated_inspeccion

@router.delete(
    "/{inspeccion_id}",
    status_code=status.HTTP_204_NO_CONTENT, 
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR]))]
)
def delete_existing_inspeccion(inspeccion_id: int, db: Session = Depends(get_db)):
    inspeccionesCRUD.delete_inspeccion(db=db, inspeccion_id=inspeccion_id)
    return {"message": "Inspección eliminada exitosamente."}

@router.post(
    "/upload-image",
    response_model=List[Dict[str, Any]], 
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
async def upload_inspection_image(
    files: List[UploadFile] = File(...), 
    db: Session = Depends(get_db) 
):
    uploaded_results = []
    logger.info(f"Received {len(files)} files for upload.")

    base_upload_path = Path(UPLOAD_DIRECTORY)

    for file in files:
        logger.info(f"Processing file: {file.filename}, Content-Type: {file.content_type}")
        
        if not file.content_type or not file.content_type.startswith('image/'): 
            logger.warning(f"Este archivo {file.filename} No es una imagen. Content-Type: {file.content_type}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"El archivo '{file.filename}' no es una imagen válida. Tipo recibido: {file.content_type}")
        
        file_extension = Path(file.filename).suffix.lower() 
        unique_id = uuid.uuid4().hex 
        
        today = datetime.date.today()
        date_path = today.strftime("%Y/%m/%d")
        
        full_upload_path = base_upload_path / date_path
        full_upload_path.mkdir(parents=True, exist_ok=True) 

        original_filename = f"{unique_id}_original{file_extension}"
        thumbnail_filename = f"{unique_id}_thumb{file_extension}"

        original_file_location = full_upload_path / original_filename
        thumbnail_file_location = full_upload_path / thumbnail_filename

        try:
            image_bytes = await file.read()
            if not image_bytes:
                logger.warning(f"El archivo {file.filename} esta vacio.")
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"El archivo '{file.filename}' está vacío.")

            image_stream = io.BytesIO(image_bytes)
            img = Image.open(image_stream)

            img.save(original_file_location)
            logger.info(f"Imagen original guardada en {original_file_location}")

            img.thumbnail(THUMBNAIL_SIZE) 
            img.save(thumbnail_file_location)
            logger.info(f"Thumbnail saved to {thumbnail_file_location}")

            relative_url_path = original_file_location.relative_to(base_upload_path.parent).as_posix()
            
            public_url = f"/static/{relative_url_path}"
            
            uploaded_results.append({"filename": file.filename, "url": public_url}) 

        except Exception as e:
            logger.exception(f"Error al procesar o guardar el archivo '{file.filename}': {e}") 
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno del servidor al procesar la imagen '{file.filename}': {e}")
            
    return uploaded_results

@router.post(
    "/{inspeccion_id}/imagenes/", 
    response_model=inspeccioneSchema.ImagenesInspeccionResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def create_image_for_inspeccion(
    inspeccion_id: int,
    imagen_data: inspeccioneSchema.ImagenesInspeccionBase, 
    db: Session = Depends(get_db)
):
    full_imagen_data = inspeccioneSchema.ImagenesInspeccionCreate(
        inspeccion_id=inspeccion_id,
        url=imagen_data.url
    )
    new_image = inspeccionesCRUD.create_imagen_inspeccion(db=db, imagen_data=full_imagen_data)
    return new_image

@router.get(
    "/{inspeccion_id}/imagenes/",
    response_model=List[inspeccioneSchema.ImagenesInspeccionResponse],
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR, 
                                    general.UserRole.VISUALIZADOR]))]
)
def read_images_for_inspeccion(
    inspeccion_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    db_inspeccion = inspeccionesCRUD.get_inspeccion(db, inspeccion_id)
    if not db_inspeccion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspección no encontrada.")

    all_images = inspeccionesCRUD.get_imagenes_by_inspeccion(db, inspeccion_id=inspeccion_id, 
                                                             skip=skip, limit=limit)
    return all_images

@router.get(
    "/imagenes/{imagen_id}", 
    response_model=inspeccioneSchema.ImagenesInspeccionResponse, 
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def read_single_image(imagen_id: int, db: Session = Depends(get_db)):
    db_imagen = inspeccionesCRUD.get_imagen_inspeccion(db, imagen_id=imagen_id)
    if db_imagen is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada.")
    return db_imagen

@router.put(
    "/imagenes/{imagen_id}",
    response_model=inspeccioneSchema.ImagenesInspeccionResponse,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def update_existing_image(
    imagen_id: int,
    imagen_update: inspeccioneSchema.ImagenesInspeccionBase,
    db: Session = Depends(get_db)
):
    updated_image = inspeccionesCRUD.update_imagen_inspeccion(db, imagen_id, imagen_update)
    return updated_image

@router.delete(
    "/imagenes/{imagen_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR]))]
)
def delete_existing_image(imagen_id: int, db: Session = Depends(get_db)):
    inspeccionesCRUD.delete_imagen_inspeccion(db=db, imagen_id=imagen_id)
    return {"message": "Imagen eliminada exitosamente."}