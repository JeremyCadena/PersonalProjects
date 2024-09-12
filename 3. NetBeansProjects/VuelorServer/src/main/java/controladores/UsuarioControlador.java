package controladores;

import modelos.UsuarioModelo;

public class UsuarioControlador {

    private final UsuarioModelo modelo;

    public UsuarioControlador() {
        this.modelo = new UsuarioModelo();
    }

    public boolean autenticarUsuario(String nombreUsuario, String contrasena) {
        return modelo.autenticarUsuario(nombreUsuario, contrasena);
    }
    
     public int obtenerIdUsuario(String nombreUsuario) {
        return modelo.obtenerIdUsuario(nombreUsuario);
    }
    
    // Función para obtener el nombre del usuario
    public String obtenerNombreUsuario(int idUsuario) {
        return modelo.obtenerNombreUsuario(idUsuario);
    }
}
