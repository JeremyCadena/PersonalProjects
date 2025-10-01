# banana-env/data/modelos/cargamentosModel.py
import datetime
from data.database import Base
from sqlalchemy import CheckConstraint, Column, ForeignKey, Integer, String, TIMESTAMP, text
from sqlalchemy.orm import relationship

from data.modelos.general import CargamentoDiscriminatorEnum, PG_CargamentoDiscriminatorEnum

class Cargamento(Base):
    __tablename__ = "cargamento"
    cargamento_id = Column(Integer, primary_key=True, index=True)
    chofer_id = Column(Integer, ForeignKey("choferes.chofer_id"), nullable=False)
    agricolas_id = Column(Integer, ForeignKey("agricolas.agricola_id"), nullable=False) 
    marca = Column(String(100), nullable=False)
    numero_vapor = Column(String(50), nullable=False)
    puerto = Column(String(100), nullable=True)
    vapor = Column(String(100), nullable=True)
    fecha = Column(TIMESTAMP(timezone=True), nullable=False, default=datetime.datetime.now(datetime.timezone.utc))

    tipo_cargamento = Column(PG_CargamentoDiscriminatorEnum, nullable=False)
    tipo_cargasuelta = Column(String(20), nullable=True) # 'CAMION', 'FURGON'
    rastreo_cargasuelta = Column(String(10), nullable=True)
    codigo_contenedor = Column(String(20), nullable=True)
    rastreo_barra_contenedor = Column(String(10), nullable=True)
    rastreo_sello_contenedor = Column(String(20), nullable=True)

    # Relaciones con otras tablas
    chofer_rel = relationship("Chofer", back_populates="cargamentos", lazy="joined")
    agricola_rel = relationship("Agricola", back_populates="cargamentos", lazy="joined")
    inspecciones = relationship("Inspeccion", back_populates="cargamento", 
                                cascade="all, delete-orphan", lazy="joined")

    __mapper_args__ = {
        "polymorphic_on": tipo_cargamento,
        "polymorphic_identity": "base_cargamento" 
    }

    __table_args__ = (
        CheckConstraint(
            text("tipo_cargasuelta IN ('CAMION', 'FURGON') OR tipo_cargasuelta IS NULL"),
            name='chk_cargasuelta_tipo_format'
        ),
        CheckConstraint(
            text("""
            (tipo_cargamento = 'carga_suelta' AND tipo_cargasuelta IS NOT NULL AND rastreo_cargasuelta IS NOT NULL AND codigo_contenedor IS NULL AND rastreo_barra_contenedor IS NULL AND rastreo_sello_contenedor IS NULL) OR
            (tipo_cargamento = 'contenedor' AND codigo_contenedor IS NOT NULL AND rastreo_barra_contenedor IS NOT NULL AND rastreo_sello_contenedor IS NOT NULL AND tipo_cargasuelta IS NULL AND rastreo_cargasuelta IS NULL)
            """),
            name='chk_cargamento_type_data_consistency'
        )
    )

class CargaSuelta(Cargamento):
    __mapper_args__ = {
        'polymorphic_identity': CargamentoDiscriminatorEnum.CARGA_SUELTA.value
    }

class Contenedor(Cargamento):
    __mapper_args__ = {
        'polymorphic_identity': CargamentoDiscriminatorEnum.CONTENEDOR.value
    }