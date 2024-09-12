# Microservicio de API con Cifrado de Datos

Este repositorio contiene un microservicio de API desarrollado con FastAPI y MySQL que implementa cifrado de datos para garantizar la confidencialidad de la información almacenada en la base de datos.

## Requisitos

Asegúrate de tener instalado Python en tu máquina. Puedes descargarlo desde [python.org](https://www.python.org/downloads/).

## Configuración del Entorno Virtual

Crea y activa un entorno virtual para instalar las dependencias del proyecto:

## Instalación de dependencias

pip instal fastapi uvicorn mysql-connector-python

## Configuración de la Base de Datos

Configura la conexión a la base de datos en el archivo main.py en la sección de database_config. Asegúrate de tener una base de datos MySQL existente con la tabla de clientes según el esquema proporcionado dentro de la carpeta BasedeDatos.

## Ejecución de la API 

Ejecuta el siguiente comando para iniciar la API:
uvicorn main:app --reload
La API estará disponible en http://127.0.0.1:8000

# Uso de la API
## Obtener Todos los Clientes
Realiza una solicitud GET a http://127.0.0.1:8000/clientes/ para obtener todos los clientes. Los datos se devolverán cifrados.

## Obtener un Cliente por ID
Realiza una solicitud GET a http://127.0.0.1:8000/clientes/{cliente_id} para obtener un cliente específico por su ID. Los datos se devolverán cifrados.