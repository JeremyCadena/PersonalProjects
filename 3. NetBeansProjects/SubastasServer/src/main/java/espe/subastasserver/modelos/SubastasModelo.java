package espe.subastasserver.modelos;

import espe.subastasserver.entidades.Subastas;
import espe.subastasserver.utils.ConexionDB;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;

public class SubastasModelo {
     private EntityManager entityManager(){
        
        return ConexionDB.getConexion().getEntidadConexion().createEntityManager();
    }
    
    public List<Subastas> mostrar(){
        Query q = entityManager().createQuery("SELECT s FROM Subastas s");
        
        return q.getResultList();
    }
    
    public void crear(Subastas subastas){
        EntityManager entidad = entityManager();
        
        try {
            entidad.getTransaction().begin();
            entidad.persist(subastas);
            entidad.getTransaction().commit();
            
        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }
    
    public void editar(Subastas subastas){
        EntityManager entidad = entityManager();
        
        try {
            entidad.getTransaction().begin();
            entidad.merge(subastas);
            entidad.getTransaction().commit();
            
        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }
    
    public void eliminar(Subastas subastas){
        EntityManager entidad = entityManager();
        
        try {
            entidad.getTransaction().begin();
            entidad.remove(entidad.merge(subastas));
            entidad.getTransaction().commit();
            
        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }
}
