package espe.servidorsubasta.resources;

import espe.servidorsubasta.controladores.UsuariosControlador;
import espe.servidorsubasta.entidades.Usuarios;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth")
public class AuthResource {

    private final UsuariosControlador usuariosControlador;

    public AuthResource() {
        this.usuariosControlador = new UsuariosControlador();
    }

    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response login(Usuarios usuarios) {
        String nombreUsuario = usuarios.getNombre();
        String contrasena = usuarios.getContrasena();

        if (usuariosControlador.autenticarUsuario(nombreUsuario, contrasena)) {
            return Response.ok().build();
        } else {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
    }
}
