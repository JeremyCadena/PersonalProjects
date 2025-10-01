# banana-env/main.py
from core.config import UPLOAD_DIRECTORY
from core.logging_config import setup_logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import agricolas, auth, cargamentos, choferes, dashboard, inspecciones, users
from middlewares.auth_cookie_middleware import AuthCookieMiddleware

setup_logging()

app = FastAPI(
    title="API Departamento de Seguridad Física",
    description="API de Gestión de Información para la Protección de la Cadena de Suministros. "
                "Permite la Administración de Información Fundamental para la Seguridad de la Cadena de Suministros.",
    version="1.0.0", 
    docs_url="/docs",
)

app.mount("/static", StaticFiles(directory=UPLOAD_DIRECTORY.parent), name="static")

# --- Configuración CORS ---
origins = [
    "http://localhost:3000", # Desarrollo local de frontend
    "http://127.0.0.1:3000", 
    # Añadir otros orígenes de frontend 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Permitir cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuthCookieMiddleware)

# --- Inclusión de Routers de la API ---
app.include_router(auth.router)
app.include_router(agricolas.router) 
app.include_router(cargamentos.router)
app.include_router(choferes.router)
app.include_router(inspecciones.router)
app.include_router(dashboard.router) 
app.include_router(users.router) 