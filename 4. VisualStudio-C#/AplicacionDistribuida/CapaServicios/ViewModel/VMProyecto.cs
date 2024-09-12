using CapaAccesoDatos.DataContext;

namespace CapaServicios.ViewModel
{
    public class VMProyecto
    {
        public int Id { get; set; }

        public string? Nombre { get; set; }

        public string? Descripcion { get; set; }

        public string? FechaInicio { get; set; }

        public string? FechaFin { get; set; }

        public virtual ICollection<Tarea> Tareas { get; set; } = new List<Tarea>();
    }
}