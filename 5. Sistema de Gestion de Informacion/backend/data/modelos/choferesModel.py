# banana-env/data/modelos/choferesModel.py
from data.database import Base
from sqlalchemy import CheckConstraint, Column, Integer, String, text
from sqlalchemy.orm import relationship


class Chofer(Base):
    __tablename__ = "choferes"
    chofer_id = Column(Integer, primary_key=True, index=True)
    cedula = Column(String(10), unique=True, nullable=False)
    nombres = Column(String(255), nullable=False)
    apellidos = Column(String(255), nullable=False)
    placa_cabezal = Column(String(10), unique=True, nullable=False)
    telefono = Column(String(10), nullable=False)

    __table_args__ = (
        CheckConstraint(text("cedula ~ '[0-9]{10}$'"), name='chk_cedula_format'),
        CheckConstraint(text("telefono ~ '[0-9]{10}$'"), name='chk_telefono_format'),
    )

    # Relación con Cargamento
    cargamentos = relationship("Cargamento", back_populates="chofer_rel")