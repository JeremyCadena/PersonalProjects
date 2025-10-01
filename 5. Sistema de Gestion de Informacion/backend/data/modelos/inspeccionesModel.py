# banana-env/data/modelos/inspeccionesModel.py
import datetime
from data.database import Base
from sqlalchemy import Column, ForeignKey, Integer, String, Text, Date
from sqlalchemy.orm import relationship
from data.modelos.general import PG_TipoInspeccionEnum, PG_NivelRiesgoEnum

class Inspeccion(Base):
    __tablename__ = "inspeccion"
    inspeccion_id = Column(Integer, primary_key=True, index=True)
    cargamento_id = Column(Integer, ForeignKey("cargamento.cargamento_id"), nullable=False) # FK al Cargamento
    fecha = Column(Date, nullable=False, default=datetime.date.today)
    observacion = Column(Text, nullable=True)
    tipo_inspeccion = Column(PG_TipoInspeccionEnum, nullable=False)
    nivel_riesgo = Column(PG_NivelRiesgoEnum, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False) # FK al usuario que inspecciona
    jefe_planta_nombre = Column(String(255), nullable=True) 

    # Relaciones con otras tablas
    inspector_rel = relationship("User", back_populates="inspecciones", lazy="joined")
    cargamento = relationship("Cargamento", back_populates="inspecciones")
    imagenes = relationship(
        "ImagenesInspeccion",
        back_populates="inspeccion",
        cascade="all, delete-orphan",
        lazy="joined" 
    )


class ImagenesInspeccion(Base):
    __tablename__ = "imagenesinspeccion"
    imagen_id = Column(Integer, primary_key=True, index=True)
    inspeccion_id = Column(Integer, ForeignKey("inspeccion.inspeccion_id"), nullable=False)
    url = Column(String(500), nullable=False)

    inspeccion = relationship("Inspeccion", back_populates="imagenes")