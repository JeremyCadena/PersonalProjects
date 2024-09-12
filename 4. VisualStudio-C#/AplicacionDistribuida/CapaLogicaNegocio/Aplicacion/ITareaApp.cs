using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CapaAccesoDatos.DataContext;

namespace CapaLogicaNegocio.Aplicacion
{
    public interface ITareaApp
    {
        Task<bool> Insertar(Tarea modelo);
        Task<bool> Actualizar(Tarea modelo);
        Task<bool> Eliminar(int id);
        Task<Tarea> Obtener(int id);
        Task<IQueryable<Tarea>> ObtenerTodos();
    }
}
