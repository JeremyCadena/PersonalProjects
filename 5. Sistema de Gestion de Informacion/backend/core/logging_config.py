# banana-env/core/logging_config.py
import logging
from logging.handlers import RotatingFileHandler
from core.config import DEBUG, BASE_DIR 

def setup_logging():
    log_dir = BASE_DIR / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file_path = log_dir / "app.log"

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if DEBUG else logging.INFO)

    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(lineno)d - %(message)s'
    )

    if DEBUG or not root_logger.handlers:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)

    file_handler = RotatingFileHandler(
        log_file_path,
        maxBytes=10 * 1024 * 1024, 
        backupCount=5              
    )
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)

    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO if DEBUG else logging.WARNING)
    logging.getLogger("jose").setLevel(logging.WARNING) 
    logging.getLogger("xhtml2pdf").setLevel(logging.WARNING) 
    logging.getLogger("PIL").setLevel(logging.WARNING) 