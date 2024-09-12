package modelos;

import entidades.Vuelos;
import espe.vuelorserver.ConexionDB;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;

public class VueloModelo {
    private EntityManager entityManager(){
        
        return ConexionDB.getConexion().getEntidadConexion().createEntityManager();
    }
    
    public List<Vuelos> mostrar(){
        Query q = entityManager().createQuery("SELECT v FROM Vuelos v");
        
        return q.getResultList();
    }
}
