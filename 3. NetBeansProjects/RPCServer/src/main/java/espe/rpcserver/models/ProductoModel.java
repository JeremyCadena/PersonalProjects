package espe.rpcserver.models;

import espe.rpcserver.models.entity.Productos;
import espe.rpcserver.utils.ConexionDB;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;

public class ProductoModel {
    private EntityManager entityManager(){
        
        return ConexionDB.getConexion().getEntidadConexion().createEntityManager();
    }
    
    public List<Productos> mostrar(){
        Query q = entityManager().createQuery("SELECT p FROM Productos p");
        
        return q.getResultList();
    }
    
    public void crear(Productos productos){
        EntityManager entidad = entityManager();
        
        try {
            entidad.getTransaction().begin();
            entidad.persist(productos);
            entidad.getTransaction().commit();
            
        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }
    
    public void editar(Productos productos){
        EntityManager entidad = entityManager();
        
        try {
            entidad.getTransaction().begin();
            entidad.merge(productos);
            entidad.getTransaction().commit();
            
        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }
    
    public void eliminar(Productos productos){
        EntityManager entidad = entityManager();
        
        try {
            entidad.getTransaction().begin();
            entidad.remove(entidad.merge(productos));
            entidad.getTransaction().commit();
            
        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }
}