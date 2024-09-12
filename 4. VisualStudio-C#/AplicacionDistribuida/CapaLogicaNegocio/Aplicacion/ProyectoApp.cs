using CapaAccesoDatos.DataContext;
using CapaAccesoDatos.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace CapaLogicaNegocio.Aplicacion
{
    public class ProyectoApp : IProyectoApp
    {
        private readonly IGenericRepository<Proyecto> _proyectoRepo;

        public ProyectoApp(IGenericRepository<Proyecto> proyectoRepo)
        {
            _proyectoRepo = proyectoRepo;
        }

        public async Task<bool> Actualizar(Proyecto modelo)
        {
            return await _proyectoRepo.Actualizar(modelo);
        }

        public async Task<bool> Eliminar(int id)
        {
            return await _proyectoRepo.Eliminar(id);
        }

        public async Task<bool> Insertar(Proyecto modelo)
        {
            return await _proyectoRepo.Insertar(modelo);
        }

        public async Task<Proyecto> Obtener(int id)
        {
            return await _proyectoRepo.Obtener(id);
        }

        public async Task<IQueryable<Proyecto>> ObtenerTodos()
        {
            return await _proyectoRepo.ObtenerTodos();
        }
    }
}