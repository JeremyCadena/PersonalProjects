from flask import Flask, jsonify
import pyodbc

app = Flask(__name__)

# Configuración de la conexión a la base de datos
conn = pyodbc.connect('Driver={SQL Server};'
                        'Server=;'
                        'Database=DATABASENAME;'
                        'Trusted_Connection=yes;')

# Función genérica para ejecutar procedimientos almacenados y devolver resultados
def execute_stored_procedure(sp_name):
    cursor = conn.cursor()
    cursor.execute(f'EXEC {sp_name}')
    columns = [column[0] for column in cursor.description]  # Obtener los nombres de las columnas
    rows = cursor.fetchall()  # Obtener todas las filas de resultados
    results = []
    for row in rows:
        result = {}
        for i, value in enumerate(row):
            result[columns[i]] = value  # Asignar el valor a la columna correspondiente
        results.append(result)
    conn.commit()
    return results

# Rutas para obtener datos generales del proyecto
@app.route('/api/proyectos', methods=['GET'])
def obtener_datos_proyectos():
    numero_proyectos_activos = execute_stored_procedure('sp_ObtenerProyectosActivos')
    duracion_promedio_proyectos = execute_stored_procedure('sp_ObtenerDuracionPromediaProyectos')
    proyectos_por_cliente = execute_stored_procedure('sp_ObtenerProyectosPorCliente')
    
    return jsonify(numero_proyectos_activos, 
                    duracion_promedio_proyectos, 
                    proyectos_por_cliente)

# Rutas para obtener datos generales de contrato
@app.route('/api/contratos', methods=['GET'])
def obtener_datos_contratos():
    numero_contratos_activos = execute_stored_procedure('sp_ObtenerContratosActivos')
    distribucion_contratos_tipo = execute_stored_procedure('sp_ObtenerDistribucionContratosPorTipo')
    duracion_promedio_contratos = execute_stored_procedure('sp_ObtenerDuracionPromediaContratos')
    contratos_por_proyecto = execute_stored_procedure('sp_ObtenerContratosPorProyecto')
    
    return jsonify(numero_contratos_activos,
                    distribucion_contratos_tipo,
                    duracion_promedio_contratos,
                    contratos_por_proyecto)

# Rutas para obtener datos de recursos humanos
@app.route('/api/recursos_humanos', methods=['GET'])
def obtener_datos_recursos_humanos():
    numero_total_empleados = execute_stored_procedure('sp_ObtenerNumeroTotalEmpleados')
    distribucion_empleados_area = execute_stored_procedure('sp_ObtenerDistribucionEmpleadosPorArea')
    distribucion_empleados_cargo = execute_stored_procedure('sp_ObtenerDistribucionEmpleadosPorCargoOcupacional')
    costo_laboral_total = execute_stored_procedure('sp_ObtenerCostoLaboralTotal')
    
    return jsonify(numero_total_empleados,
                    distribucion_empleados_area,
                    distribucion_empleados_cargo,
                    costo_laboral_total)

# Rutas para obtener datos de asignaciones de personal
@app.route('/api/asignaciones_personal', methods=['GET'])
def obtener_datos_asignaciones_personal():
    asignaciones_personal_proyecto = execute_stored_procedure('sp_ObtenerAsignacionesPersonalPorProyecto')
    distribucion_asignacion_tipo = execute_stored_procedure('sp_ObtenerDistribucionAsignacionesPorTipo')
    
    return jsonify(asignaciones_personal_proyecto,
                    distribucion_asignacion_tipo)

# Rutas para obtener datos de nomina
@app.route('/api/nomina', methods=['GET'])
def obtener_datos_nomina():
    costo_total_nomina = execute_stored_procedure('sp_ObtenerCostosTotalesNomina')
    #costo_nomina_proyecto = execute_stored_procedure('sp_ObtenerCostosNominaPorProyecto')
    costo_nomina_quincena = execute_stored_procedure('sp_ObtenerCostosNominaPorQuincenaMes')
    costo_variaciones = execute_stored_procedure('sp_ObtenerVariacionCostosNomina')
    
    return jsonify(costo_total_nomina,
                    #costo_nomina_proyecto,
                    costo_nomina_quincena,
                    costo_variaciones)

# Rutas para obtener datos de bodega
@app.route('/api/bodega', methods=['GET'])
def obtener_datos_bodega():
    ingreso_insumo_bodega = execute_stored_procedure('sp_ObtenerIngresosInsumoBodegaPorProyecto')
    egreso_insumo_bodega = execute_stored_procedure('sp_ObtenerEgresosInsumoBodegaPorProyecto')
    ingreso_costos_bodega = execute_stored_procedure('sp_ObtenerCostosIngresosBodegaPorProyecto')
    egreso_costos_bodega = execute_stored_procedure('sp_ObtenerCostosEgresosBodegaPorProyecto')
    
    return jsonify(ingreso_insumo_bodega,
                    egreso_insumo_bodega,
                    ingreso_costos_bodega,
                    egreso_costos_bodega)

if __name__ == '__main__':
    app.run(debug=True)
