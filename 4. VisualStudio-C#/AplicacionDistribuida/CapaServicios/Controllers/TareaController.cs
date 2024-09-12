using CapaAccesoDatos.DataContext;
using CapaAccesoDatos.Repositories;
using CapaServicios.ViewModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapaServicios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TareaController : ControllerBase
    {
        private readonly ILogger<TareaController> _logger;
        private readonly IGenericRepository<Tarea> _tareaRepo;

        public TareaController(ILogger<TareaController> logger, IGenericRepository<Tarea> tareaRepo)
        {
            _logger = logger;
            _tareaRepo = tareaRepo;
        }

        // GET: api/Tarea
        [HttpGet]
        public async Task<IActionResult> Lista()
        {
            IQueryable<Tarea> queryTareaSQL = await _tareaRepo.ObtenerTodos();

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

        // GET: api/Tarea/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Tarea>> GetById(int id)
        {
            var tarea = await _tareaRepo.Obtener(id);

            if (tarea == null)
            {
                return NotFound(); // Devuelve 404 si no se encuentra el proyecto
            }

            return tarea;
        }
    }
}
