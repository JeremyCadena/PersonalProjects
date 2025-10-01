# banana-env/core/config.py
import os
from dotenv import load_dotenv
import logging
from pathlib import Path

# Cargar variables de entorno del archivo .env
load_dotenv()

# --- Configuración de la Base de Datos ---
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("La variable de entorno DATABASE_URL no está configurada. Asegúrate de tener un archivo .env válido.")

# --- Configuración de Seguridad (JWT) ---
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    logging.warning("SECRET_KEY no está configurada.")
    SECRET_KEY = "password001"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# --- Configuración de Subida de Archivos ---
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIRECTORY = BASE_DIR / os.getenv("UPLOAD_DIRECTORY", "C:/opt/SGPCS/Inspecciones")
THUMBNAIL_SIZE = (128, 128) 
UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

# --- Configuración de Paginación por defecto ---
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# --- Configuración de Entorno ---
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
DEBUG = ENVIRONMENT == "development"