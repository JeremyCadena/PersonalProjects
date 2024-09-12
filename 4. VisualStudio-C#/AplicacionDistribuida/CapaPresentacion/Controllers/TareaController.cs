using CapaAccesoDatos.DataContext;
using CapaPresentacion.Models;
using CapaPresentacion.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using CapaLogicaNegocio.Aplicacion;
using System.Globalization;

namespace CapaPresentacion.Controllers
{
    public class TareaController : Controller
    {
        private readonly ITareaApp _tareaApp;

        public TareaController(ITareaApp tareaApp)
        {
            _tareaApp = tareaApp;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> Lista()
        {
            IQueryable<Tarea> queryTareaSQL = await _tareaApp.ObtenerTodos();

            List<VMTarea> lista = queryTareaSQL
                .Select(t => new VMTarea()
                {
                    Id = t.Id,
                    ProyectoId = t.ProyectoId,
                    Nombre = t.Nombre,
                    Descripcion = t.Descripcion,
                    Estado = t.Estado,
                    AsignadoA = t.AsignadoA,
                    FechaInicio = t.FechaInicio.Value.ToString("dd/MM/yyyy"),
                }).ToList(); 

            return StatusCode(StatusCodes.Status200OK, lista);
        }


        [HttpPost]
        public async Task<IActionResult> Insertar([FromBody] VMTarea modelo)
        {
            Tarea nuevaTarea = new Tarea()
            {
                ProyectoId = modelo.ProyectoId,
                Nombre = modelo.Nombre,
                Descripcion = modelo.Descripcion,
                Estado = modelo.Estado,
                AsignadoA = modelo.AsignadoA,
                FechaInicio = DateTime.ParseExact(modelo.FechaInicio, "dd/MM/yyyy", CultureInfo.CreateSpecificCulture("es-ECU")),
            };

            bool respuesta = await _tareaApp.Insertar(nuevaTarea);

            return StatusCode(StatusCodes.Status200OK, new { valor = respuesta });
        }

        [HttpPut]
        public async Task<IActionResult> Actualizar([FromBody] VMTarea modelo)
        {
            Tarea tareaActualizada = new Tarea()
            {
                Id = modelo.Id,
                ProyectoId = modelo.ProyectoId,
                Nombre = modelo.Nombre,
                Descripcion = modelo.Descripcion,
                Estado = modelo.Estado,
                AsignadoA = modelo.AsignadoA,
                FechaInicio = DateTime.ParseExact(modelo.FechaInicio, "dd/MM/yyyy", CultureInfo.CreateSpecificCulture("es-ECU")),
            };

            bool respuesta = await _tareaApp.Actualizar(tareaActualizada);

            return StatusCode(StatusCodes.Status200OK, new { valor = respuesta });
        }

        [HttpDelete]
        public async Task<IActionResult> Eliminar(int id)
        {
            bool respuesta = await _tareaApp.Eliminar(id);

            return StatusCode(StatusCodes.Status200OK, new { valor = respuesta });
        }
    }
}