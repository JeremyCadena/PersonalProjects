using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CapaAccesoDatos.DataContext;
using CapaAccesoDatos.Repositories;
using CapaServicios.ViewModel;

namespace CapaServicios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProyectoController : ControllerBase
    {
        private readonly ILogger<ProyectoController> _logger;
        private readonly IGenericRepository<Proyecto> _proyectoRepository;

        public ProyectoController(ILogger<ProyectoController> logger, IGenericRepository<Proyecto> proyectoRepository)
        {
            _logger = logger;
            _proyectoRepository = proyectoRepository;
        }

        // GET: api/Proyecto
        [HttpGet]
        public async Task<IActionResult> Lista()
        {
            IQueryable<Proyecto> queryProyectoSQL = await _proyectoRepository.ObtenerTodos();

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

        // GET: api/Proyecto/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Proyecto>> GetById(int id)
        {
            var proyecto = await _proyectoRepository.Obtener(id);

            if (proyecto == null)
            {
                return NotFound(); // Devuelve 404 si no se encuentra el proyecto
            }

            return proyecto;
        }
    }
}
