using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CapaAccesoDatos.DataContext;


namespace CapaLogicaNegocio.Aplicacion
{
    public interface IProyectoApp
    {
        Task<bool> Insertar(Proyecto modelo);
        Task<bool> Actualizar(Proyecto modelo);
        Task<bool> Eliminar(int id);
        Task<Proyecto> Obtener(int id);
        Task<IQueryable<Proyecto>> ObtenerTodos();
    }
}