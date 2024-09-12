package espe.servidorsubasta.modelos;

import espe.servidorsubasta.entidades.Usuarios;
import espe.servidorsubasta.resources.ConexionDB;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.util.List;

public class UsuariosModelo {

    private EntityManager entityManager() {

        return ConexionDB.getConexion().getEntidadConexion().createEntityManager();
    }

    public Usuarios autenticarUsuario(String nombreUsuario, String contrasena) {
        EntityManager entityManager = entityManager();

        try {
            // Consulta para verificar si existe un usuario con el nombre y contraseña proporcionados
            Query query = entityManager.createQuery("SELECT u FROM Usuarios u WHERE u.nombre = :nombre AND u.contrasena = :contrasena");
            query.setParameter("nombre", nombreUsuario);
            query.setParameter("contrasena", contrasena);

            List<Usuarios> usuarios = query.getResultList();
            if (!usuarios.isEmpty()) {
                // Si se encuentra un usuario con las credenciales proporcionadas, retornarlo
                return usuarios.get(0);
            }
        } finally {
            entityManager.close();
        }
        // Si no se encuentra ningún usuario, retornar null
        return null;
    }

    public List<Usuarios> mostrar() {
        Query q = entityManager().createQuery("SELECT u FROM Usuarios u");

        return q.getResultList();
    }

    public void crear(Usuarios usuarios) {
        EntityManager entidad = entityManager();

        try {
            entidad.getTransaction().begin();
            entidad.persist(usuarios);
            entidad.getTransaction().commit();

        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }

    public void editar(Usuarios usuarios) {
        EntityManager entidad = entityManager();

        try {
            entidad.getTransaction().begin();
            entidad.merge(usuarios);
            entidad.getTransaction().commit();

        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }

    public void eliminar(Usuarios usuarios) {
        EntityManager entidad = entityManager();

        try {
            entidad.getTransaction().begin();
            entidad.remove(entidad.merge(usuarios));
            entidad.getTransaction().commit();

        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }
}
