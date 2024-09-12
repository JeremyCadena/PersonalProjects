using CapaAccesoDatos.DataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapaAccesoDatos.Repositories
{
    public class TareaRepository : IGenericRepository<Tarea>
    {
        private readonly ProyectoDistribuidasContext _dbcontext;

        public TareaRepository(ProyectoDistribuidasContext context)
        {
            _dbcontext = context;
        }

        public async Task<bool> Actualizar(Tarea modelo)
        {
            _dbcontext.Tareas.Update(modelo);
            await _dbcontext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Eliminar(int id)
        {
            Tarea modelo = _dbcontext.Tareas.First(t => t.Id == id);
            _dbcontext.Tareas.Remove(modelo);
            await _dbcontext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Insertar(Tarea modelo)
        {
            _dbcontext.Tareas.Add(modelo);
            await _dbcontext.SaveChangesAsync();
            return true;
        }

        public async Task<Tarea> Obtener(int id)
        {
            return await _dbcontext.Tareas.FindAsync(id);
        }

        public async Task<IQueryable<Tarea>> ObtenerTodos()
        {
            IQueryable<Tarea> queryTareaSQL = _dbcontext.Tareas;
            return queryTareaSQL;
        }
    }
}