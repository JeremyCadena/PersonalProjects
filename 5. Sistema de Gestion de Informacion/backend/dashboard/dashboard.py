# banana-env/dashboard/dashboard.py
from sqlalchemy.orm import Session
from sqlalchemy import case, func, and_, desc, cast, Date, distinct 
from typing import Dict, Any, List, Optional
import datetime
from data.modelos import cargamentosModel, inspeccionesModel, choferesModel, agricolasModel, usuariosModel
from data.esquemas.general import CargamentoDiscriminator

# Función auxiliar para aplicar filtros de fecha a las consultas
def _apply_date_filter(query, model_class, start_date: Optional[datetime.datetime], end_date: Optional[datetime.datetime]):
    if start_date and end_date:
        query = query.filter(and_(model_class.fecha >= start_date, model_class.fecha <= end_date))
    elif start_date:
        query = query.filter(model_class.fecha >= start_date)
    elif end_date:
        query = query.filter(model_class.fecha <= end_date)
    return query

def get_kpis_summary(db: Session, start_date: Optional[datetime.datetime] = None, end_date: Optional[datetime.datetime] = None) -> Dict[str, Any]:
    cargamentos_query = db.query(cargamentosModel.Cargamento)
    cargamentos_query = _apply_date_filter(cargamentos_query, cargamentosModel.Cargamento, start_date, end_date)
    
    total_cargamentos = cargamentos_query.count()
    total_contenedores = cargamentos_query.filter(cargamentosModel.Cargamento.tipo_cargamento == CargamentoDiscriminator.CONTENEDOR).count()
    total_carga_suelta = cargamentos_query.filter(cargamentosModel.Cargamento.tipo_cargamento == CargamentoDiscriminator.CARGA_SUELTA).count()

    inspecciones_query = db.query(inspeccionesModel.Inspeccion)
    inspecciones_query = _apply_date_filter(inspecciones_query, inspeccionesModel.Inspeccion, start_date, end_date)
    total_inspecciones = inspecciones_query.count()

    cargamentos_inspeccionados_query = db.query(func.count(distinct(inspeccionesModel.Inspeccion.cargamento_id)))
    cargamentos_inspeccionados_query = _apply_date_filter(cargamentos_inspeccionados_query, inspeccionesModel.Inspeccion, start_date, end_date)
    cargamentos_inspeccionados = cargamentos_inspeccionados_query.scalar()
    
    porcentaje_inspecciones = (cargamentos_inspeccionados / total_cargamentos * 100) if total_cargamentos > 0 else 0

    inspecciones_por_tipo = inspecciones_query.group_by(inspeccionesModel.Inspeccion.tipo_inspeccion).with_entities(
        inspeccionesModel.Inspeccion.tipo_inspeccion,
        func.count(inspeccionesModel.Inspeccion.inspeccion_id)
    ).all()
    
    return {
        "total_cargamentos": total_cargamentos,
        "total_contenedores": total_contenedores,
        "total_carga_suelta": total_carga_suelta,
        "total_inspecciones": total_inspecciones,
        "inspecciones_por_tipo": {str(tipo): count for tipo, count in inspecciones_por_tipo},
        "porcentaje_inspecciones": round(porcentaje_inspecciones, 2),
        "cargamentos_inspeccionados": cargamentos_inspeccionados
    }

def get_cargamentos_daily_trend(db: Session, start_date: Optional[datetime.datetime] = None, end_date: Optional[datetime.datetime] = None) -> List[Dict[str, Any]]:
    query = db.query(
        cast(cargamentosModel.Cargamento.fecha, Date).label('date'),
        func.count(cargamentosModel.Cargamento.cargamento_id).label('count')
    )
    query = _apply_date_filter(query, cargamentosModel.Cargamento, start_date, end_date)
    
    trend_data = query.group_by(cast(cargamentosModel.Cargamento.fecha, Date))\
                      .order_by(cast(cargamentosModel.Cargamento.fecha, Date))\
                      .all()
    
    return [{"date": date.isoformat(), "count": count} for date, count in trend_data]

def get_contenedores_daily_trend(db: Session, start_date: Optional[datetime.datetime] = None, end_date: Optional[datetime.datetime] = None) -> List[Dict[str, Any]]:
    query = db.query(
        cast(cargamentosModel.Cargamento.fecha, Date).label('date'),
        func.count(cargamentosModel.Cargamento.cargamento_id).label('count')
    ).filter(
        cargamentosModel.Cargamento.tipo_cargamento == CargamentoDiscriminator.CONTENEDOR
    )
    query = _apply_date_filter(query, cargamentosModel.Cargamento, start_date, end_date)
    
    trend_data = query.group_by(cast(cargamentosModel.Cargamento.fecha, Date))\
                      .order_by(cast(cargamentosModel.Cargamento.fecha, Date))\
                      .all()
    
    return [{"date": date.isoformat(), "count": count} for date, count in trend_data]

def get_cargasuelta_daily_trend(db: Session, start_date: Optional[datetime.datetime] = None, end_date: Optional[datetime.datetime] = None) -> List[Dict[str, Any]]:
    query = db.query(
        cast(cargamentosModel.Cargamento.fecha, Date).label('date'),
        func.count(cargamentosModel.Cargamento.cargamento_id).label('count')
    ).filter(
        cargamentosModel.Cargamento.tipo_cargamento == CargamentoDiscriminator.CARGA_SUELTA
    )
    query = _apply_date_filter(query, cargamentosModel.Cargamento, start_date, end_date)
    
    trend_data = query.group_by(cast(cargamentosModel.Cargamento.fecha, Date))\
                      .order_by(cast(cargamentosModel.Cargamento.fecha, Date))\
                      .all()
    
    return [{"date": date.isoformat(), "count": count} for date, count in trend_data]

def get_top_marcas_daily_trend(db: Session, limit: int = 5, start_date: Optional[datetime.datetime] = None, end_date: Optional[datetime.datetime] = None) -> List[Dict[str, Any]]:
    # Primero obtenemos las top marcas
    marcas_query = db.query(cargamentosModel.Cargamento.marca)
    marcas_query = _apply_date_filter(marcas_query, cargamentosModel.Cargamento, start_date, end_date)
    top_marcas_names = marcas_query.group_by(cargamentosModel.Cargamento.marca)\
                                   .order_by(func.count(cargamentosModel.Cargamento.cargamento_id).desc())\
                                   .limit(limit)\
                                   .all()
    top_marcas_list = [marca[0] for marca in top_marcas_names if marca[0] is not None]

    # Construimos la consulta principal
    query = db.query(
        cast(cargamentosModel.Cargamento.fecha, Date).label('date')
    )

    # Agregamos los conteos para cada una de las top marcas
    for marca in top_marcas_list:
        query = query.add_columns(
            func.count(
                case(
                    (cargamentosModel.Cargamento.marca == marca, cargamentosModel.Cargamento.cargamento_id),
                    else_=None
                )
            ).label(f'count_{marca}')
        )

    # Agregamos un conteo para las marcas que no están en el top
    query = query.add_columns(
        func.count(
            case(
                (cargamentosModel.Cargamento.marca.notin_(top_marcas_list), cargamentosModel.Cargamento.cargamento_id),
                else_=None
            )
        ).label('OTROS')
    )

    # Aplicamos el filtro de fecha y agrupamos por fecha
    query = _apply_date_filter(query, cargamentosModel.Cargamento, start_date, end_date)
    trend_data = query.group_by(cast(cargamentosModel.Cargamento.fecha, Date))\
                      .order_by(cast(cargamentosModel.Cargamento.fecha, Date))\
                      .all()

    # Formateamos los resultados para el front-end
    formatted_data = []
    for row in trend_data:
        row_dict = {'date': row.date.strftime('%b %d').upper()}
        for marca in top_marcas_list:
            row_dict[f'count_{marca}'] = getattr(row, f'count_{marca}', 0)
        row_dict['OTROS'] = getattr(row, 'OTROS', 0)
        formatted_data.append(row_dict)

    return formatted_data

def get_top_exportadoras(db: Session, limit: int = 5, start_date: Optional[datetime.datetime] = None, end_date: Optional[datetime.datetime] = None) -> List[Dict[str, Any]]:
    query = db.query(
        agricolasModel.Agricola.exportadora, 
        func.count(cargamentosModel.Cargamento.cargamento_id).label('count')
    ).join(cargamentosModel.Cargamento.agricola_rel)

    query = _apply_date_filter(query, cargamentosModel.Cargamento, start_date, end_date)
    
    top_exportadoras = query.group_by(agricolasModel.Agricola.exportadora)\
                            .order_by(func.count(cargamentosModel.Cargamento.cargamento_id).desc())\
                            .limit(limit)\
                            .all()
    
    return [{"exportadora": exp, "count": count} for exp, count in top_exportadoras]

def get_top_puertos(db: Session, limit: int = 6, start_date: Optional[datetime.datetime] = None, end_date: Optional[datetime.datetime] = None) -> List[Dict[str, Any]]:
    query = db.query(
        cargamentosModel.Cargamento.puerto,
        func.count(cargamentosModel.Cargamento.cargamento_id).label('count')
    )
    query = _apply_date_filter(query, cargamentosModel.Cargamento, start_date, end_date)

    top_puertos = query.group_by(cargamentosModel.Cargamento.puerto)\
                       .filter(cargamentosModel.Cargamento.puerto.isnot(None))\
                       .order_by(func.count(cargamentosModel.Cargamento.cargamento_id).desc())\
                       .limit(limit)\
                       .all()
    
    return [{"puerto": puerto, "count": count} for puerto, count in top_puertos]

def get_top_choferes(db: Session, limit: int = 5, start_date: Optional[datetime.datetime] = None, end_date: Optional[datetime.datetime] = None) -> List[Dict[str, Any]]:
    query = db.query(
        choferesModel.Chofer.nombres,
        choferesModel.Chofer.apellidos,
        choferesModel.Chofer.cedula,
        func.count(cargamentosModel.Cargamento.cargamento_id).label('count')
    ).join(cargamentosModel.Cargamento.chofer_rel)

    query = _apply_date_filter(query, cargamentosModel.Cargamento, start_date, end_date)

    top_choferes = query.group_by(
        choferesModel.Chofer.nombres,
        choferesModel.Chofer.apellidos,
        choferesModel.Chofer.cedula
    ).order_by(func.count(cargamentosModel.Cargamento.cargamento_id).desc())\
     .limit(limit)\
     .all()
    
    return [{"nombres": n, "apellidos": a, "cedula": c, "count": count} for n, a, c, count in top_choferes]

def get_top_fincas(db: Session, limit: int = 5, start_date: Optional[datetime.datetime] = None, end_date: Optional[datetime.datetime] = None) -> List[Dict[str, Any]]:
    query = db.query(
        agricolasModel.Agricola.finca,
        func.count(cargamentosModel.Cargamento.cargamento_id).label('count')
    ).join(cargamentosModel.Cargamento, cargamentosModel.Cargamento.agricolas_id == agricolasModel.Agricola.agricola_id)

    query = _apply_date_filter(query, cargamentosModel.Cargamento, start_date, end_date)
    
    top_fincas = query.group_by(agricolasModel.Agricola.finca)\
                      .order_by(desc('count'))\
                      .limit(limit)\
                      .all()
    
    return [{"finca": f, "count": c} for f, c in top_fincas if f]

def get_top_fincas_and_choferes(
    db: Session, 
    fincas_limit: int = 10, 
    choferes_limit: int = 3,
    start_date: Optional[datetime.datetime] = None, 
    end_date: Optional[datetime.datetime] = None
) -> List[Dict[str, Any]]:
    
    # 1. Obtener las fincas con más cargamentos
    top_fincas_query = db.query(
        agricolasModel.Agricola.agricola_id,
        agricolasModel.Agricola.finca,
        func.count(cargamentosModel.Cargamento.cargamento_id).label('total_cargamentos')
    ).join(
        cargamentosModel.Cargamento, 
        cargamentosModel.Cargamento.agricolas_id == agricolasModel.Agricola.agricola_id
    )

    top_fincas_query = _apply_date_filter(top_fincas_query, cargamentosModel.Cargamento, start_date, end_date)

    top_fincas_results = top_fincas_query.group_by(
        agricolasModel.Agricola.agricola_id,
        agricolasModel.Agricola.finca
    ).order_by(
        desc('total_cargamentos')
    ).limit(fincas_limit).all()

    # 2. Iterar sobre las fincas y obtener el top de choferes para cada una
    final_data = []
    for finca_id, finca_nombre, total_cargamentos_finca in top_fincas_results:
        
        choferes_query = db.query(
            choferesModel.Chofer.nombres,
            choferesModel.Chofer.apellidos,
            func.count(cargamentosModel.Cargamento.cargamento_id).label('total_cargamentos_chofer')
        ).join(
            cargamentosModel.Cargamento, 
            cargamentosModel.Cargamento.chofer_id == choferesModel.Chofer.chofer_id
        ).filter(
            cargamentosModel.Cargamento.agricolas_id == finca_id
        )
        
        choferes_query = _apply_date_filter(choferes_query, cargamentosModel.Cargamento, start_date, end_date)
        
        top_choferes_de_finca = choferes_query.group_by(
            choferesModel.Chofer.nombres,
            choferesModel.Chofer.apellidos,
        ).order_by(
            desc('total_cargamentos_chofer')
        ).limit(choferes_limit).all()

        # Formatear el resultado para esta finca
        choferes_data = [
            {
                "nombres": n, 
                "apellidos": a, 
                "count": total
            } 
            for n, a, total in top_choferes_de_finca
        ]
        
        final_data.append({
            "finca": finca_nombre,
            "total_cargamentos_finca": total_cargamentos_finca,
            "top_choferes": choferes_data
        })
        
    return final_data

def get_top_inspectores(db: Session, limit: int = 5, start_date: Optional[datetime.datetime] = None, end_date: Optional[datetime.datetime] = None) -> List[Dict[str, Any]]:
    query = db.query(
        usuariosModel.User.nombres_apellidos,
        func.count(inspeccionesModel.Inspeccion.inspeccion_id).label('count')
    ).join(inspeccionesModel.Inspeccion, inspeccionesModel.Inspeccion.user_id == usuariosModel.User.id)

    query = _apply_date_filter(query, inspeccionesModel.Inspeccion, start_date, end_date)
    
    top_inspectores = query.group_by(usuariosModel.User.nombres_apellidos)\
                           .order_by(desc('count'))\
                           .limit(limit)\
                           .all()

    return [{"inspector": inspector, "count": count} for inspector, count in top_inspectores]