package espe.servidorsubasta.resources;

import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;


public class ConexionDB {
    private static final ConexionDB conexion = new ConexionDB();
    private final EntityManagerFactory entidadConexion;
    
    private ConexionDB(){
        entidadConexion = Persistence.createEntityManagerFactory("jdbc/_subasta");
    } 

    public static ConexionDB getConexion() {
        return conexion;
    }

    public EntityManagerFactory getEntidadConexion() {
        return entidadConexion;
    }  
}
