# banana-env/cruds/cargamentosCRUD.py
import os, io, math, datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload, selectinload 
from fastapi import HTTPException, status
from sqlalchemy import Date, cast, or_, desc, and_
from data.modelos import cargamentosModel, choferesModel, agricolasModel, inspeccionesModel
from data.esquemas import cargamentoSchema
from cruds.choferesCRUD import get_chofer
from cruds.agricolasCRUD import get_agricola
from data.esquemas.general import CargamentoDiscriminator
from xhtml2pdf import pisa
from jinja2 import Environment, FileSystemLoader
from openpyxl import Workbook 
from openpyxl.styles import Font, Alignment 
from core.config import UPLOAD_DIRECTORY

template_loader = FileSystemLoader('templates/pdfs')
template_env = Environment(loader=template_loader)

# Operaciones CRUD para Cargamentos
def get_cargamento(db: Session, cargamento_id: int) -> Optional[cargamentosModel.Cargamento]:
    return db.query(cargamentosModel.Cargamento)\
             .options(
                 joinedload(cargamentosModel.Cargamento.chofer_rel), # Carga el chofer
                 joinedload(cargamentosModel.Cargamento.agricola_rel) # Carga el registro de agrícola
             )\
             .filter(cargamentosModel.Cargamento.cargamento_id == cargamento_id)\
             .first()

def get_cargamento_by_numero_vapor(db: Session, numero_vapor: str) -> Optional[cargamentosModel.Cargamento]:
    return db.query(cargamentosModel.Cargamento)\
             .options(
                 joinedload(cargamentosModel.Cargamento.chofer_rel),
                 joinedload(cargamentosModel.Cargamento.agricola_rel)
             )\
             .filter(cargamentosModel.Cargamento.numero_vapor == numero_vapor)\
             .first()

def get_cargamentos_paginated(
    db: Session, 
    page: int = 1, 
    per_page: int = 40, 
    search: Optional[str] = None,
    date_filter: Optional[datetime.date] = None,
    type_filter: Optional[str] = None
) -> Dict[str, Any]:
    if page < 1: page = 1
    if per_page < 1: per_page = 40

    base_query = db.query(cargamentosModel.Cargamento)
    
    if search:
        search_pattern = f"%{search}%"
        base_query = base_query.join(cargamentosModel.Cargamento.chofer_rel).join(cargamentosModel.Cargamento.agricola_rel)
        base_query = base_query.filter(
            or_(
                cargamentosModel.Cargamento.marca.ilike(search_pattern),
                cargamentosModel.Cargamento.puerto.ilike(search_pattern),
                cargamentosModel.Cargamento.rastreo_cargasuelta.ilike(search_pattern),
                cargamentosModel.Cargamento.rastreo_barra_contenedor.ilike(search_pattern),
                cargamentosModel.Cargamento.rastreo_sello_contenedor.ilike(search_pattern),
                choferesModel.Chofer.nombres.ilike(search_pattern),
                choferesModel.Chofer.apellidos.ilike(search_pattern),
                choferesModel.Chofer.cedula.ilike(search_pattern),
                cargamentosModel.Cargamento.codigo_contenedor.ilike(search_pattern),
                agricolasModel.Agricola.finca.ilike(search_pattern),
                agricolasModel.Agricola.exportadora.ilike(search_pattern)
            )
        )

    if date_filter:
        base_query = base_query.filter(cast(cargamentosModel.Cargamento.fecha, Date) == date_filter)

    if type_filter:
        if type_filter == 'contenedor':
            base_query = base_query.filter(cargamentosModel.Cargamento.tipo_cargamento == CargamentoDiscriminator.CONTENEDOR)
        elif type_filter in ['CAMION', 'FURGON']:
            base_query = base_query.filter(
                cargamentosModel.Cargamento.tipo_cargamento == 'carga_suelta',
                cargamentosModel.Cargamento.tipo_cargasuelta == type_filter
            )

    total_items = base_query.count()
    total_pages = math.ceil(total_items / per_page)
    
    items_query = base_query.options(
        selectinload(cargamentosModel.Cargamento.chofer_rel),
        selectinload(cargamentosModel.Cargamento.agricola_rel)
    ).order_by(desc(cargamentosModel.Cargamento.cargamento_id)).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "total_items": total_items,
        "total_pages": total_pages,
        "current_page": page,
        "items": items_query
    }

def create_cargamento(db: Session, cargamento_data: cargamentoSchema.CargamentoCreate) -> cargamentosModel.Cargamento:
    chofer = get_chofer(db, cargamento_data.chofer_id)
    if not chofer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chofer no encontrado.")
    
    agricola = get_agricola(db, cargamento_data.agricolas_id)
    if not agricola:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro agrícola (Finca/Exportadora) no encontrado.")

    db_cargamento_data = cargamento_data.model_dump(exclude_unset=True)
    db_cargamento = cargamentosModel.Cargamento(**db_cargamento_data)

    db.add(db_cargamento)
    db.commit()
    db.refresh(db_cargamento)
    db.refresh(db_cargamento, attribute_names=['chofer_rel', 'agricola_rel'])
    return db_cargamento

def update_cargamento(
    db: Session,
    cargamento_id: int,
    cargamento_update: cargamentoSchema.CargamentoUpdate
) -> cargamentosModel.Cargamento:
    db_cargamento = get_cargamento(db, cargamento_id)
    if not db_cargamento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cargamento no encontrado para actualizar.")

    if cargamento_update.chofer_id is not None and cargamento_update.chofer_id != db_cargamento.chofer_id:
        chofer = get_chofer(db, cargamento_update.chofer_id)
        if not chofer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nuevo Chofer no encontrado.")

    if cargamento_update.agricolas_id is not None and cargamento_update.agricolas_id != db_cargamento.agricolas_id:
        agricola = get_agricola(db, cargamento_update.agricolas_id)
        if not agricola:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nuevo Registro agrícola (Finca/Exportadora) no encontrado.")

    update_data = cargamento_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_cargamento, key, value)

    db.add(db_cargamento)
    db.commit()
    db.refresh(db_cargamento)
    db.refresh(db_cargamento, attribute_names=['chofer_rel', 'agricola_rel'])
    return db_cargamento

def delete_cargamento(db: Session, cargamento_id: int):
    db_cargamento = get_cargamento(db, cargamento_id)
    if not db_cargamento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cargamento no encontrado para eliminar.")
    db.delete(db_cargamento)
    db.commit()
    return {"message": "Cargamento eliminado exitosamente."}

async def generate_cargamento_report_pdf(cargamento: cargamentosModel.Cargamento) -> bytes:
    if not cargamento:
        raise ValueError("El objeto cargamento no puede ser None.")

    chofer_info = cargamento.chofer_rel
    agricola_info = cargamento.agricola_rel

    template = template_env.get_template('cargamento_report.html')

    html_content = template.render(
        cargamento=cargamento,
        chofer_info=chofer_info,
        agricola_info=agricola_info,
        CargamentoDiscriminator=CargamentoDiscriminator
    )
    
    output_buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(
        html_content,           
        dest=output_buffer      
    )
    
    if pisa_status.err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al generar el PDF.")
        
    return output_buffer.getvalue()

# Obtener el cargamento con todas las inspecciones y sus imágenes
def get_cargamento_with_full_details(db: Session, cargamento_id: int):
    return db.query(cargamentosModel.Cargamento)\
        .options(
            joinedload(cargamentosModel.Cargamento.chofer_rel),
            joinedload(cargamentosModel.Cargamento.agricola_rel),
            joinedload(cargamentosModel.Cargamento.inspecciones).joinedload(inspeccionesModel.Inspeccion.imagenes),
            joinedload(cargamentosModel.Cargamento.inspecciones).joinedload(inspeccionesModel.Inspeccion.inspector_rel),
        )\
        .filter(cargamentosModel.Cargamento.cargamento_id == cargamento_id)\
        .first()

def _get_local_image_path(url: str) -> str:
    # Elimina el prefijo /static/ si existe
    if url.startswith('/static/Inspecciones/'):
        url = url[len('/static/Inspecciones/'):]
    # Construye la ruta absoluta
    return str(UPLOAD_DIRECTORY / url)

async def generate_full_report_pdf(cargamento: cargamentosModel.Cargamento) -> bytes:
    if not cargamento:
        raise ValueError("El objeto cargamento no puede ser None.")

    # Modifica las rutas de las imágenes a rutas locales
    for inspeccion in cargamento.inspecciones:
        if inspeccion.imagenes:
            for img in inspeccion.imagenes:
                img.url = _get_local_image_path(img.url)

    template = template_env.get_template('inspecciones_report.html')
    html_content = template.render(cargamento=cargamento)

    output_buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(
        html_content,
        dest=output_buffer,
        link_callback=lambda uri, rel: uri  # Ya es ruta absoluta
    )

    if pisa_status.err:
        raise HTTPException(status_code=500, detail="Error al generar el PDF.")

    return output_buffer.getvalue()

async def export_all_cargamentos_to_excel(
    db: Session,
    start_date: Optional[datetime.datetime] = None, 
    end_date: Optional[datetime.datetime] = None    
) -> bytes:
    query = db.query(cargamentosModel.Cargamento)\
                        .options(
                            joinedload(cargamentosModel.Cargamento.chofer_rel),
                            joinedload(cargamentosModel.Cargamento.agricola_rel)
                        )

    if start_date and end_date:
        query = query.filter(
            and_(
                cargamentosModel.Cargamento.fecha >= start_date,
                cargamentosModel.Cargamento.fecha <= end_date
            )
        )
    elif start_date:
        query = query.filter(cargamentosModel.Cargamento.fecha >= start_date)
    elif end_date:
        query = query.filter(cargamentosModel.Cargamento.fecha <= end_date)

    all_cargamentos = query.order_by((cargamentosModel.Cargamento.fecha)).all()

    wb = Workbook()
    ws = wb.active
    ws.title = "Cargamentos"

    headers = [
        "FECHA", "TRANSPORTE", "MARCA DE CAJA", "NÚMERO DE VAPOR", "PUERTO", "VAPOR",
        "DISPOSITIVO DE RASTREO",
        "CODIGO DE CONTENEDOR", "BARRA CONTENEDOR", "SELLO CONTENEDOR",
        "CÉDULA", "CHOFER", "PLACA VEHICULAR", "TELEFONO",
        "CÓDIGO DE AGRICOLA", "NOMBRE FINCA", "EXPORTADORA"
    ]
    ws.append(headers)

    bold_font = Font(bold=True)
    for cell in ws[1]: 
        cell.font = bold_font
        cell.alignment = Alignment(horizontal='center')

    for cargamento in all_cargamentos:
        
        row_data = [
            cargamento.fecha,
            cargamento.tipo_cargasuelta if cargamento.tipo_cargamento == cargamentosModel.CargamentoDiscriminatorEnum.CARGA_SUELTA else 'CONTENEDOR',
            cargamento.marca,
            cargamento.numero_vapor,
            cargamento.puerto or '',
            cargamento.vapor or '',
            
            cargamento.rastreo_cargasuelta or '' if cargamento.tipo_cargamento == cargamentosModel.CargamentoDiscriminatorEnum.CARGA_SUELTA else '',

            cargamento.codigo_contenedor or '' if cargamento.tipo_cargamento == cargamentosModel.CargamentoDiscriminatorEnum.CONTENEDOR else '',
            cargamento.rastreo_barra_contenedor or '' if cargamento.tipo_cargamento == cargamentosModel.CargamentoDiscriminatorEnum.CONTENEDOR else '',
            cargamento.rastreo_sello_contenedor or '' if cargamento.tipo_cargamento == cargamentosModel.CargamentoDiscriminatorEnum.CONTENEDOR else '',

            cargamento.chofer_rel.cedula if cargamento.chofer_rel else '',
            cargamento.chofer_rel.nombres + cargamento.chofer_rel.apellidos if cargamento.chofer_rel else '',
            cargamento.chofer_rel.placa_cabezal if cargamento.chofer_rel else '',
            cargamento.chofer_rel.telefono if cargamento.chofer_rel else '',

            cargamento.agricola_rel.codigo if cargamento.agricola_rel else '',
            cargamento.agricola_rel.finca if cargamento.agricola_rel else '',
            cargamento.agricola_rel.exportadora or '' if cargamento.agricola_rel else ''
        ]
        ws.append(row_data)

    for col in ws.columns:
        max_length = 0
        column = col[0] 
        for cell in col:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = (max_length + 2)
        ws.column_dimensions[column.column_letter].width = adjusted_width

    excel_buffer = io.BytesIO()
    wb.save(excel_buffer)
    excel_buffer.seek(0) 

    return excel_buffer.getvalue()