# banana-env/routers/cargamentos.py
import datetime, io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from data.esquemas import cargamentoSchema, general
from cruds import cargamentosCRUD
from data.database import get_db
from data.security import get_current_active_user, has_role
from core.config import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, UPLOAD_DIRECTORY

router = APIRouter(
    prefix="/cargamentos",
    tags=["Cargamentos"],
    dependencies=[Depends(get_current_active_user)],
)

@router.post(
    "/",
    response_model=cargamentoSchema.CargamentoResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def create_new_cargamento(cargamento_data: cargamentoSchema.CargamentoCreate, db: Session = Depends(get_db)):
    new_cargamento = cargamentosCRUD.create_cargamento(db=db, cargamento_data=cargamento_data)
    return new_cargamento

@router.get(
    "/",
    response_model=general.PaginatedResponse[cargamentoSchema.CargamentoResponse],
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def read_all_cargamentos_paginated(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Número de la página a obtener."),
    per_page: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description=f"Número de registros por página (máximo {MAX_PAGE_SIZE})."), # Usar constantes
    search: Optional[str] = Query(None, description="Término de búsqueda para filtrar cargamentos."),
    date_filter: Optional[datetime.date] = Query(None, description="Filtrar por fecha exacta (YYYY-MM-DD)"),
    type_filter: Optional[str] = Query(None, description="Filtrar por tipo (CONTENEDOR, CAMION, FURGON)")
):
    paginated_cargamentos = cargamentosCRUD.get_cargamentos_paginated(
        db, page=page, per_page=per_page, search=search, date_filter=date_filter, type_filter=type_filter)
    return paginated_cargamentos

@router.get(
    "/{cargamento_id}",
    response_model=cargamentoSchema.CargamentoResponse,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def read_single_cargamento(cargamento_id: int, db: Session = Depends(get_db)):
    db_cargamento = cargamentosCRUD.get_cargamento(db, cargamento_id=cargamento_id)
    if db_cargamento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cargamento no encontrado.")
    return db_cargamento

@router.put(
    "/{cargamento_id}",
    response_model=cargamentoSchema.CargamentoResponse,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, general.UserRole.INSPECTOR]))]
)
def update_existing_cargamento(
    cargamento_id: int,
    cargamento_data: cargamentoSchema.CargamentoUpdate,
    db: Session = Depends(get_db)
):
    updated_cargamento = cargamentosCRUD.update_cargamento(db, cargamento_id, cargamento_data)
    return updated_cargamento

@router.delete(
    "/{cargamento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR]))]
)
def delete_existing_cargamento(cargamento_id: int, db: Session = Depends(get_db)):
    cargamentosCRUD.delete_cargamento(db=db, cargamento_id=cargamento_id)
    return None

# GENERACION DE DOCUMENTOS
@router.get(
    "/{cargamento_id}/pdf",
    response_class=StreamingResponse,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, 
                                    general.UserRole.INSPECTOR, general.UserRole.VISUALIZADOR]))]
)
async def generate_cargamento_pdf(cargamento_id: int, db: Session = Depends(get_db)):
    cargamento = cargamentosCRUD.get_cargamento(db, cargamento_id=cargamento_id)
    if not cargamento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cargamento no encontrado.")

    nombre_finca = cargamento.agricola_rel.finca if cargamento.agricola_rel and cargamento.agricola_rel.finca else "FincaDesconocida"
    
    numero_rastreo_id = ""
    if cargamento.tipo_cargamento == cargamentosCRUD.cargamentosModel.CargamentoDiscriminatorEnum.CARGA_SUELTA:
        numero_rastreo_id = cargamento.rastreo_cargasuelta or "RastreoCS"
    elif cargamento.tipo_cargamento == cargamentosCRUD.cargamentosModel.CargamentoDiscriminatorEnum.CONTENEDOR:
        numero_rastreo_id = cargamento.rastreo_barra_contenedor or "CodigoCont"

    nombre_archivo_base = f"{nombre_finca}_CAND{numero_rastreo_id}".replace(" ", "_").replace("/", "-").replace("\\", "_")
    filename = f"{nombre_archivo_base}.pdf"

    pdf_buffer = await cargamentosCRUD.generate_cargamento_report_pdf(cargamento)

    return StreamingResponse(
        io.BytesIO(pdf_buffer),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get(
    "/{cargamento_id}/full-report-pdf",
    response_class=StreamingResponse,
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, 
                                     general.UserRole.INSPECTOR, general.UserRole.VISUALIZADOR]))]
)
async def generate_full_cargamento_pdf(
    cargamento_id: int, 
    request: Request, 
    db: Session = Depends(get_db)
):
    cargamento = cargamentosCRUD.get_cargamento_with_full_details(db, cargamento_id=cargamento_id)
    if not cargamento:
        raise HTTPException(status_code=404, detail="Cargamento no encontrado.")

    nombre_finca = cargamento.agricola_rel.finca if cargamento.agricola_rel and cargamento.agricola_rel.finca else "FincaDesconocida"
    numero_rastreo_id = ""
    if cargamento.tipo_cargamento == cargamentosCRUD.cargamentosModel.CargamentoDiscriminatorEnum.CARGA_SUELTA:
        numero_rastreo_id = cargamento.rastreo_cargasuelta or "RastreoCS"
    elif cargamento.tipo_cargamento == cargamentosCRUD.cargamentosModel.CargamentoDiscriminatorEnum.CONTENEDOR:
        numero_rastreo_id = cargamento.rastreo_barra_contenedor or "CodigoCont"
    
    vehiculo_detalle = ""
    if cargamento.tipo_cargamento == cargamentosCRUD.cargamentosModel.CargamentoDiscriminatorEnum.CARGA_SUELTA:
        vehiculo_detalle = cargamento.chofer_rel.placa_cabezal or "RastreoCS"
    elif cargamento.tipo_cargamento == cargamentosCRUD.cargamentosModel.CargamentoDiscriminatorEnum.CONTENEDOR:
        vehiculo_detalle = cargamento.codigo_contenedor or "CodigoCont"

    # Se pasa el objeto de cargamento con todos los datos ya cargados
    pdf_buffer = await cargamentosCRUD.generate_full_report_pdf(cargamento)

    nombre_archivo_base = f"{nombre_finca}_CAND{numero_rastreo_id}_{vehiculo_detalle}".replace(" ", "_").replace("/", "-").replace("\\", "_")
    filename = f"{nombre_archivo_base}.pdf"
    
    return StreamingResponse(
        io.BytesIO(pdf_buffer),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get(
    "/export/excel", 
    response_class=StreamingResponse,
    responses={
        200: {
            "content": {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {}},
            "description": "Archivo Excel con los cargamentos.",
        }
    },
    dependencies=[Depends(has_role([general.UserRole.ADMINISTRADOR, 
                                    general.UserRole.INSPECTOR, general.UserRole.VISUALIZADOR]))]
)
async def export_cargamentos_to_excel_endpoint(
    fecha_inicio: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD) para el filtro de exportación."),
    fecha_fin: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD) para el filtro de exportación."),
    db: Session = Depends(get_db)
):
    start_date_obj = None
    if fecha_inicio:
        try:
            start_date_obj = datetime.datetime.strptime(fecha_inicio, '%Y-%m-%d').replace(
                hour=0, minute=0, second=0, microsecond=0, tzinfo=datetime.timezone.utc
            )
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de fecha de inicio inválido. Use YYYY-MM-DD.")
    
    end_date_obj = None
    if fecha_fin:
        try:
            end_date_obj = datetime.datetime.strptime(fecha_fin, '%Y-%m-%d').replace(
                hour=23, minute=59, second=59, microsecond=999999, tzinfo=datetime.timezone.utc
            )
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de fecha de fin inválido. Use YYYY-MM-DD.")

    excel_buffer = await cargamentosCRUD.export_all_cargamentos_to_excel(
        db,
        start_date=start_date_obj,
        end_date=end_date_obj
    )

    nombre_archivo_base = "LISTADO DE CARGAMENTOS"
    if start_date_obj and end_date_obj:
        nombre_archivo_base += f"_{start_date_obj.strftime('%Y%m%d')}_a_{end_date_obj.strftime('%Y%m%d')}"
    elif start_date_obj:
        nombre_archivo_base += f"_desde_{start_date_obj.strftime('%Y%m%d')}"
    elif end_date_obj:
        nombre_archivo_base += f"_hasta_{end_date_obj.strftime('%Y%m%d')}"
    
    filename = f"{nombre_archivo_base}.xlsx"

    return StreamingResponse(
        io.BytesIO(excel_buffer),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )