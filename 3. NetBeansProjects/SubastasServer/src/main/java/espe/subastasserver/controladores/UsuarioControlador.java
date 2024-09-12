package espe.subastasserver.controladores;

import espe.subastasserver.entidades.Usuarios;
import espe.subastasserver.modelos.UsuariosModelo;

public class UsuarioControlador {
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
    
    
     public void EditarProducto(String paramCode, String paramNombre, String paramEmail, String paramClave) {
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
    
     public void EliminarProducto(String paramCode) {
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
