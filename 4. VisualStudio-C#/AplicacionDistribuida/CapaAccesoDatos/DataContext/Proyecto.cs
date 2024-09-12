using System;
using System.Collections.Generic;

namespace CapaAccesoDatos.DataContext;

public partial class Proyecto
{
    public int Id { get; set; }

    public string? Nombre { get; set; }

    public string? Descripcion { get; set; }

    public DateTime? FechaInicio { get; set; }

    public DateTime? FechaFin { get; set; }

    public virtual ICollection<Tarea> Tareas { get; set; } = new List<Tarea>();
}