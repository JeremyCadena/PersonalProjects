using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace CapaAccesoDatos.DataContext;

public partial class ProyectoDistribuidasContext : DbContext
{
    public ProyectoDistribuidasContext()
    {
    }

    public ProyectoDistribuidasContext(DbContextOptions<ProyectoDistribuidasContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Proyecto> Proyectos { get; set; }

    public virtual DbSet<Tarea> Tareas { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {

    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Proyecto>(entity =>
        {
            entity.HasKey(e => e.Id).IsClustered(false);

            entity.ToTable("PROYECTO");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(40)
                .IsUnicode(false);
            entity.Property(e => e.FechaFin).HasColumnType("datetime");
            entity.Property(e => e.FechaInicio).HasColumnType("datetime");
            entity.Property(e => e.Nombre)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Tarea>(entity =>
        {
            entity.HasKey(e => e.Id).IsClustered(false);

            entity.ToTable("TAREA");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.AsignadoA)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Descripcion)
                .HasMaxLength(60)
                .IsUnicode(false);
            entity.Property(e => e.Estado)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.FechaInicio).HasColumnType("datetime");
            entity.Property(e => e.Nombre)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.ProyectoId).HasColumnName("ProyectoID");
           
            entity.HasOne(d => d.Proyecto).WithMany(p => p.Tareas)
                .HasForeignKey(d => d.ProyectoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TAREA_TIENE_PROYECTO");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
