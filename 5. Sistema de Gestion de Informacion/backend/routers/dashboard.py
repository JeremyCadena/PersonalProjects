# banana-env/routers/dashboard.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import datetime
from data.database import get_db
from data.security import get_current_active_user
from dashboard import dashboard 

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_active_user)],
    responses={404: {"description": "Recurso no encontrado"}},
)

def _parse_date_params(start_date_str: Optional[str], end_date_str: Optional[str]) -> tuple[Optional[datetime.datetime], Optional[datetime.datetime]]:
    parsed_start_date = None
    parsed_end_date = None
    if start_date_str:
        try:
            parsed_start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').replace(
                hour=0, minute=0, second=0, microsecond=0, tzinfo=datetime.timezone.utc
            )
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de fecha de inicio inválido. Use YYYY-MM-DD.")
    if end_date_str:
        try:
            parsed_end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').replace(
                hour=23, minute=59, second=59, microsecond=999999, tzinfo=datetime.timezone.utc
            )
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de fecha de fin inválido. Use YYYY-MM-DD.")
    return parsed_start_date, parsed_end_date

@router.get("/kpis-summary", response_model=Dict[str, Any])
async def get_dashboard_kpis_summary(
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    parsed_start_date, parsed_end_date = _parse_date_params(start_date, end_date)
    kpis = dashboard.get_kpis_summary(db, start_date=parsed_start_date, end_date=parsed_end_date)
    return kpis

@router.get("/cargamentos-daily-trend", response_model=List[Dict[str, Any]])
async def get_dashboard_cargamentos_daily_trend(
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    parsed_start_date, parsed_end_date = _parse_date_params(start_date, end_date)
    trend_data = dashboard.get_cargamentos_daily_trend(db, start_date=parsed_start_date, end_date=parsed_end_date)
    return trend_data

@router.get("/contenedores-daily-trend", response_model=List[Dict[str, Any]])
async def get_dashboard_contenedores_daily_trend(
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    parsed_start_date, parsed_end_date = _parse_date_params(start_date, end_date)
    trend_data = dashboard.get_contenedores_daily_trend(db, start_date=parsed_start_date, end_date=parsed_end_date)
    return trend_data

@router.get("/cargasuelta-daily-trend", response_model=List[Dict[str, Any]])
async def get_dashboard_cargasuelta_daily_trend(
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    parsed_start_date, parsed_end_date = _parse_date_params(start_date, end_date)
    trend_data = dashboard.get_cargasuelta_daily_trend(db, start_date=parsed_start_date, end_date=parsed_end_date)
    return trend_data

@router.get("/marcas-daily-trend", response_model=List[Dict[str, Any]])
async def get_dashboard_marcas_daily_trend(
    db: Session = Depends(get_db),
    limit: int = Query(5, gt=0),
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    parsed_start_date, parsed_end_date = _parse_date_params(start_date, end_date)
    trend_data = dashboard.get_top_marcas_daily_trend(db, limit=limit, start_date=parsed_start_date, end_date=parsed_end_date)
    return trend_data

@router.get("/top-exportadoras", response_model=List[Dict[str, Any]])
async def get_dashboard_top_exportadoras(
    db: Session = Depends(get_db),
    limit: int = Query(5, gt=0),
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    parsed_start_date, parsed_end_date = _parse_date_params(start_date, end_date)
    top_exportadoras = dashboard.get_top_exportadoras(db, limit=limit, start_date=parsed_start_date, end_date=parsed_end_date)
    return top_exportadoras

@router.get("/top-puertos", response_model=List[Dict[str, Any]])
async def get_dashboard_top_puertos(
    db: Session = Depends(get_db),
    limit: int = Query(6, gt=0),
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    parsed_start_date, parsed_end_date = _parse_date_params(start_date, end_date)
    top_puertos = dashboard.get_top_puertos(db, limit=limit, start_date=parsed_start_date, end_date=parsed_end_date)
    return top_puertos

@router.get("/top-choferes", response_model=List[Dict[str, Any]])
async def get_dashboard_top_choferes(
    db: Session = Depends(get_db),
    limit: int = Query(5, gt=0),
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    parsed_start_date, parsed_end_date = _parse_date_params(start_date, end_date)
    top_choferes = dashboard.get_top_choferes(db, limit=limit, start_date=parsed_start_date, end_date=parsed_end_date)
    return top_choferes

@router.get("/top-fincas", response_model=List[dict])
async def get_dashboard_top_fincas(
    db: Session = Depends(get_db),
    limit: int = Query(5, gt=0),
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    parsed_start_date, parsed_end_date = _parse_date_params(start_date, end_date)
    return dashboard.get_top_fincas(db, limit=limit, start_date=parsed_start_date, end_date=parsed_end_date)

@router.get(
    "/top-fincas-choferes",
    response_model=List[Dict[str, Any]] 
)
async def get_dashboard_top_fincas_and_choferes(
    db: Session = Depends(get_db),
    fincas_limit: int = Query(5, gt=0, description="Número de fincas top a mostrar"),
    choferes_limit: int = Query(3, gt=0, description="Número de choferes top a mostrar por cada finca"),
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    parsed_start_date, parsed_end_date = _parse_date_params(start_date, end_date)
    
    return dashboard.get_top_fincas_and_choferes(
        db,
        fincas_limit=fincas_limit,
        choferes_limit=choferes_limit,
        start_date=parsed_start_date,
        end_date=parsed_end_date
    )

@router.get("/top-inspectores", response_model=List[dict])
async def get_dashboard_top_inspectores(
    db: Session = Depends(get_db),
    limit: int = Query(5, gt=0),
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)")
):
    parsed_start_date, parsed_end_date = _parse_date_params(start_date, end_date)
    return dashboard.get_top_inspectores(db, limit=limit, start_date=parsed_start_date, end_date=parsed_end_date)