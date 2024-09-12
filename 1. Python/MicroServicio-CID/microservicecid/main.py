from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from cryptography.fernet import Fernet
import mysql.connector

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de la conexión a la base de datos
database_config = {
    "host": "localhost",
    "user": "root",
    "password": "Jejocad1218",
    "database": "practica_patrones",
}

conn = mysql.connector.connect(**database_config)
cursor = conn.cursor(dictionary=True)

# Genera una clave única para cifrar y descifrar datos
clave_secreta = Fernet.generate_key()
fernet = Fernet(clave_secreta)

@app.get("/")
def inicio():
    return {"message": "API en funcionamiento"}

@app.get("/clientes/", response_model=list[dict])
async def obtener_clientes():
    cursor.execute("SELECT * FROM clientes")
    clientes = cursor.fetchall()

    # Cifra solo los valores específicos del cliente
    clientes_cifrados = [
        {
            key: fernet.encrypt(str(value).encode()).decode() if key != "ID" else value
            for key, value in cliente.items()
        }
        for cliente in clientes
    ]

    return clientes_cifrados

@app.get("/clientes/{cliente_id}", response_model=dict)
async def obtener_cliente(cliente_id: int):
    cursor.execute("SELECT * FROM clientes WHERE ID = %s", (cliente_id,))
    cliente = cursor.fetchone()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Descifra solo los valores específicos del cliente
    cliente_descifrado = {
        key: fernet.decrypt(str(value).encode()).decode() if key != "ID" else value
        for key, value in cliente.items()
    }

    return cliente_descifrado

# Ruta para agregar un nuevo cliente mediante POST
@app.post("/clientes/", response_model=dict)
async def agregar_cliente(cliente: dict):
    # Descifra los valores del cliente antes de agregarlos a la base de datos
    cliente_descifrado = {
        key: fernet.decrypt(str(value).encode()).decode() if key != "ID" else value
        for key, value in cliente.items()
    }

    # Inserta el nuevo cliente en la base de datos
    cursor.execute(
        "INSERT INTO clientes (Nombre, Apellido, Direccion, Ciudad, Email, Telefono, Ocupacion) "
        "VALUES (%(Nombre)s, %(Apellido)s, %(Direccion)s, %(Ciudad)s, %(Email)s, %(Telefono)s, %(Ocupacion)s)",
        cliente_descifrado,
    )
    conn.commit()

    # Devuelve el cliente recién agregado
    return cliente_descifrado

# Ruta para actualizar un cliente por ID mediante PUT
@app.put("/clientes/{cliente_id}", response_model=dict)
async def actualizar_cliente(cliente_id: int, cliente_actualizado: dict):
    # Descifra los valores del cliente antes de actualizarlos en la base de datos
    cliente_descifrado = {
        key: fernet.decrypt(str(value).encode()).decode() if key != "ID" else value
        for key, value in cliente_actualizado.items()
    }

    # Actualiza el cliente en la base de datos
    cursor.execute(
        "UPDATE clientes SET Nombre = %(Nombre)s, Apellido = %(Apellido)s, Direccion = %(Direccion)s, "
        "Ciudad = %(Ciudad)s, Email = %(Email)s, Telefono = %(Telefono)s, Ocupacion = %(Ocupacion)s "
        "WHERE ID = %(ID)s",
        {"ID": cliente_id, **cliente_descifrado},
    )
    conn.commit()

    # Devuelve el cliente actualizado
    return cliente_descifrado

# Ruta para eliminar un cliente por ID mediante DELETE
@app.delete("/clientes/{cliente_id}", response_model=dict)
async def eliminar_cliente(cliente_id: int):
    # Obtiene el cliente antes de eliminarlo
    cursor.execute("SELECT * FROM clientes WHERE ID = %s", (cliente_id,))
    cliente = cursor.fetchone()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Elimina el cliente de la base de datos
    cursor.execute("DELETE FROM clientes WHERE ID = %s", (cliente_id,))
    conn.commit()

    # Devuelve el cliente eliminado
    return cliente