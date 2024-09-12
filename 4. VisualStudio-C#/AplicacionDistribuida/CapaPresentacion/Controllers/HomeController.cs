using CapaLogicaNegocio.Aplicacion;
using CapaAccesoDatos.DataContext;
using CapaPresentacion.Models;
using CapaPresentacion.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Globalization;

namespace CapaPresentacion.Controllers
{
    public class HomeController : Controller
    {
        private readonly IProyectoApp _proyectoApp;

        public HomeController(IProyectoApp proyectoApp)
        {
            _proyectoApp = proyectoApp;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> Lista()
        {
            IQueryable<Proyecto> queryProyectoSQL = await _proyectoApp.ObtenerTodos();

            List<VMProyecto> lista = queryProyectoSQL
                .Select(p => new VMProyecto()
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    FechaInicio = p.FechaInicio.Value.ToString("dd/MM/yyyy"),
                    FechaFin = p.FechaFin.Value.ToString("dd/MM/yyyy")
                }).ToList();

            return StatusCode(StatusCodes.Status200OK, lista);
        }

        [HttpPost]
        public async Task<IActionResult> Insertar([FromBody] VMProyecto modelo)
        {
            Proyecto NuevoProyecto = new Proyecto()
            {
                Nombre = modelo.Nombre,
                Descripcion = modelo.Descripcion,
                FechaInicio = DateTime.ParseExact(modelo.FechaInicio, "dd/MM/yyyy", CultureInfo.CreateSpecificCulture("es-ECU")),
                FechaFin = DateTime.ParseExact(modelo.FechaFin, "dd/MM/yyyy", CultureInfo.CreateSpecificCulture("es-ECU"))
            };

            bool respuesta = await _proyectoApp.Insertar(NuevoProyecto);

            return StatusCode(StatusCodes.Status200OK, new {valor = respuesta});
        }

        [HttpPut]
        public async Task<IActionResult> Actualizar([FromBody] VMProyecto modelo)
        {
            Proyecto NuevoProyecto = new Proyecto()
            {
                Id = modelo.Id,
                Nombre = modelo.Nombre,
                Descripcion = modelo.Descripcion,
                FechaInicio = DateTime.ParseExact(modelo.FechaInicio, "dd/MM/yyyy", CultureInfo.CreateSpecificCulture("es-ECU")),
                FechaFin = DateTime.ParseExact(modelo.FechaFin, "dd/MM/yyyy", CultureInfo.CreateSpecificCulture("es-ECU"))
            };

            bool respuesta = await _proyectoApp.Actualizar(NuevoProyecto);

            return StatusCode(StatusCodes.Status200OK, new { valor = respuesta });
        }

        [HttpDelete]
        public async Task<IActionResult> Eliminar(int id)
        {
            bool respuesta = await _proyectoApp.Eliminar(id);

            return StatusCode(StatusCodes.Status200OK, new { valor = respuesta });
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpGet]
        public async Task<IActionResult> AgregarTarea(int proyectoId)
        {
            // Puedes realizar alguna lógica para cargar los detalles del proyecto si es necesario.

            // Pasa el proyectoId a la vista.
            ViewData["ProyectoId"] = proyectoId;

            return View();
        }
    }
}
