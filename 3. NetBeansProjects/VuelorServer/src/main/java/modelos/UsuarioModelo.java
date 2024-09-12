package modelos;

import entidades.Usuarios;
import espe.vuelorserver.ConexionDB;
import javax.persistence.EntityManager;
import javax.persistence.Query;

public class UsuarioModelo {
    private EntityManager entityManager(){
        
        return ConexionDB.getConexion().getEntidadConexion().createEntityManager();
    }
    
    public boolean autenticarUsuario(String nombreUsuario, String contrasena) {
        EntityManager entityManager = entityManager();
        
        try {
            // Consulta para verificar si existe un usuario con el nombre y contraseña proporcionados
            Query query = entityManager.createQuery("SELECT u FROM Usuarios u WHERE u.nombre = :nombre AND u.contrasena = :contrasena");
            query.setParameter("nombre", nombreUsuario);
            query.setParameter("contrasena", contrasena);
            
            // Si se encuentra un usuario con las credenciales proporcionadas, la autenticación es exitosa
            return !query.getResultList().isEmpty();
        } finally {
            entityManager.close();
        }
    }
    
    public int obtenerIdUsuario(String nombreUsuario) {
        EntityManager entityManager = entityManager();
        try {
            Query query = entityManager.createQuery("SELECT u.id FROM Usuarios u WHERE u.nombre = :nombre");
            query.setParameter("nombre", nombreUsuario);
            return (int) query.getSingleResult();
        } finally {
            entityManager.close();
        }
    }

    public String obtenerNombreUsuario(int idUsuario) {
        EntityManager entityManager = entityManager();
        try {
            Usuarios usuario = entityManager.find(Usuarios.class, idUsuario);
            return usuario.getNombre();
        } finally {
            entityManager.close();
        }
    }
}
