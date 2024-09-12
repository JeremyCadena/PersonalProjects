using Microsoft.EntityFrameworkCore;
using CapaAccesoDatos.DataContext;
using CapaAccesoDatos.Repositories;
using CapaLogicaNegocio.Aplicacion;



var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<ProyectoDistribuidasContext>(opciones =>
{
    opciones.UseSqlServer(builder.Configuration.GetConnectionString("cadenaSQL"));
});

builder.Services.AddScoped<IGenericRepository<Proyecto>, ProyectoRepository>();
builder.Services.AddScoped<IGenericRepository<Tarea>, TareaRepository>();
builder.Services.AddScoped<IProyectoApp, ProyectoApp>();
builder.Services.AddScoped<ITareaApp, TareaApp>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
