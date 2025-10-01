# banana-env/data/modelos/agricolasModel.py
from data.database import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class Agricola(Base):
    __tablename__ = "agricolas"
    agricola_id = Column(Integer, primary_key=True, index=True)
    magap = Column(String(10), nullable=False)
    codigo = Column(String(10), nullable=False)
    productor = Column(String(200), nullable=False)
    finca = Column(String(100), nullable=False)
    sector = Column(String(200), nullable=True)
    exportadora = Column(String(100), nullable=True, unique=True)
    afiliacion = Column(String(50), nullable=True, unique=True)

    cargamentos = relationship("Cargamento", back_populates="agricola_rel")