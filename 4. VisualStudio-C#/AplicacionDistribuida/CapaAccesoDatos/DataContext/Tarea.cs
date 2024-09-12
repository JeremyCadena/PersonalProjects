using System;
using System.Collections.Generic;

namespace CapaAccesoDatos.DataContext;

public partial class Tarea
{
    public int Id { get; set; }

    public int ProyectoId { get; set; }

    public string? Nombre { get; set; }

    public string? Descripcion { get; set; }

    public string? Estado { get; set; }

    public string? AsignadoA { get; set; }

    public DateTime? FechaInicio { get; set; }

    public virtual Proyecto Proyecto { get; set; } = null!;
}