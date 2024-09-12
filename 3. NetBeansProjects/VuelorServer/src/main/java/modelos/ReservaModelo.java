package modelos;

import entidades.Reservas;
import entidades.Usuarios;
import entidades.Vuelos;
import espe.vuelorserver.ConexionDB;
import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;

public class ReservaModelo {

    private EntityManager entityManager() {
        return ConexionDB.getConexion().getEntidadConexion().createEntityManager();
    }

    public void crear(Reservas reservas){
        EntityManager entidad = entityManager();
        
        try {
            entidad.getTransaction().begin();
            entidad.persist(reservas);
            entidad.getTransaction().commit();
            
        } catch (Exception e) {
            entidad.getTransaction().rollback();
        }
    }
}
