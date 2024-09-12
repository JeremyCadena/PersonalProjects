using CapaAccesoDatos.DataContext;

namespace CapaPresentacion.Models.ViewModels
{
    public class VMTarea
    {
        public int Id { get; set; }

        public int ProyectoId { get; set; }

        public string? Nombre { get; set; }

        public string? Descripcion { get; set; }

        public string? Estado { get; set; }

        public string? AsignadoA { get; set; }

        public string? FechaInicio { get; set; }

        public virtual Proyecto Proyecto { get; set; } = null!;
    }
}
