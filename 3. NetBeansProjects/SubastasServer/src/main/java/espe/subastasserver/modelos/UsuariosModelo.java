package espe.subastasserver.modelos;

import espe.subastasserver.entidades.Usuarios;
import espe.subastasserver.utils.ConexionDB;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;

public class UsuariosModelo {
     private EntityManager entityManager(){
        
        return ConexionDB.getConexion().getEntidadConexion().createEntityManager();
    }
    
    public List<Usuarios> mostrar(){
        Query q = entityManager().createQuery("SELECT u FROM Usuarios u");
        
        return q.getResultList();
    }
    
    public void crear(Usuarios usuarios){
        EntityManager entidad = entityManager();
        
        try {
            entidad.getTransaction().begin();
            entidad.persist(usuarios);
            entidad.getTransaction().commit();
            
        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }
    
    public void editar(Usuarios usuarios){
        EntityManager entidad = entityManager();
        
        try {
            entidad.getTransaction().begin();
            entidad.merge(usuarios);
            entidad.getTransaction().commit();
            
        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }
    
    public void eliminar(Usuarios usuarios){
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

