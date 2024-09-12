using CapaAccesoDatos.Repositories;
using CapaAccesoDatos.DataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapaLogicaNegocio.Aplicacion
{
    public class TareaApp : ITareaApp
    {
        private readonly IGenericRepository<Tarea> _tareaRepo;

        public TareaApp(IGenericRepository<Tarea> tareaRepo)
        {
            _tareaRepo = tareaRepo;
        }

        public async Task<bool> Actualizar(Tarea modelo)
        {
            return await _tareaRepo.Actualizar(modelo);
        }

        public async Task<bool> Eliminar(int id)
        {
            return await _tareaRepo.Eliminar(id);
        }

        public async Task<bool> Insertar(Tarea modelo)
        {
            return await _tareaRepo.Insertar(modelo);
        }

        public async Task<Tarea> Obtener(int id)
        {
            return await _tareaRepo.Obtener(id);
        }

        public async Task<IQueryable<Tarea>> ObtenerTodos()
        {
            return await _tareaRepo.ObtenerTodos();
        }
    }
}