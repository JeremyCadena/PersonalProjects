# banana-env/data/modelos/usuariosModel.py
from data.database import Base
from sqlalchemy import Column, Integer, String, Boolean
from data.modelos.general import PG_UserRoleEnum, UserRoleEnum
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    nombres_apellidos = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(PG_UserRoleEnum, nullable=False, default=UserRoleEnum.VISUALIZADOR.value)

    inspecciones = relationship("Inspeccion", back_populates="inspector_rel")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"