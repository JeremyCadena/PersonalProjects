using CapaAccesoDatos.DataContext;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapaAccesoDatos.Repositories
{
    public class ProyectoRepository : IGenericRepository<Proyecto>
    {
        private readonly ProyectoDistribuidasContext _dbcontext;

        public ProyectoRepository(ProyectoDistribuidasContext context)
        {
            _dbcontext = context;
        }

        public async Task<bool> Actualizar(Proyecto modelo)
        {
            _dbcontext.Proyectos.Update(modelo);
            await _dbcontext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Eliminar(int id)
        {
            Proyecto modelo = _dbcontext.Proyectos.First(p => p.Id == id);
            _dbcontext.Proyectos.Remove(modelo);
            await _dbcontext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Insertar(Proyecto modelo)
        {
            _dbcontext.Proyectos.Add(modelo);
            await _dbcontext.SaveChangesAsync();
            return true;
        }

        public async Task<Proyecto> Obtener(int id)
        {
            return await _dbcontext.Proyectos.FindAsync(id);

        }

        public async Task<IQueryable<Proyecto>> ObtenerTodos()
        {
            IQueryable<Proyecto> queryProyectoSQL = _dbcontext.Proyectos;
            return queryProyectoSQL;
        }
    }
}