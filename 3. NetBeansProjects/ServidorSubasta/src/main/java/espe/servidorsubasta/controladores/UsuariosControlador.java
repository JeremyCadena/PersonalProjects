package espe.servidorsubasta.controladores;

import espe.servidorsubasta.entidades.Usuarios;
import espe.servidorsubasta.modelos.UsuariosModelo;

public class UsuariosControlador {
    
    public Usuarios autenticarUsuario(String nombreUsuario, String contrasena) {
        UsuariosModelo us = new UsuariosModelo();
        
        return us.autenticarUsuario(nombreUsuario, contrasena);
    }
    
    public void InsertarUsuario(String paramNombre, String paramEmail, String paramClave) {
        try {
            UsuariosModelo us = new UsuariosModelo();

            Usuarios user = new Usuarios();

            user.setIdUsuario(null);
            user.setNombre(paramNombre);
            user.setEmail(paramEmail);
            user.setContrasena(paramClave);
            user.setRol("pujador");
            
            us.crear(user);
            
            System.out.println("Usuario Ingresado correctamente a la base");
        } catch (Exception ex) {
            System.out.println("Error al ingresar usuario");
            ex.printStackTrace();
        }
    }
    
    
     public void EditarUsuario(String paramCode, String paramNombre, String paramEmail, String paramClave) {
        try {
            UsuariosModelo us = new UsuariosModelo();

            Usuarios user = new Usuarios();

            user.setIdUsuario(Integer.valueOf(paramCode));
            user.setNombre(paramNombre);
            user.setEmail(paramEmail);
            user.setContrasena(paramClave);
            
            us.editar(user);
            
            System.out.println("Usuario modificado correctamente");
        } catch (Exception ex) {
            System.out.println("Modificación de usuario fallida");
            ex.printStackTrace();
        }
    }
    
     public void EliminarUsuario(String paramCode) {
        try {
            UsuariosModelo us = new UsuariosModelo();

            Usuarios user = new Usuarios();

            user.setIdUsuario(Integer.valueOf(paramCode));
                        
            us.eliminar(user);
            
            System.out.println("Usuario eliminado correctamente");
        } catch (Exception ex) {
            System.out.println("Erro al eliminar usuario");
            ex.printStackTrace();
        }
    }
}
