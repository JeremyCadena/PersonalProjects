package espe.subastasserver.utils;

import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class ConexionDB {
    private static final ConexionDB conexion = new ConexionDB();
    private final EntityManagerFactory entidadConexion;
    
    private ConexionDB(){
        entidadConexion = Persistence.createEntityManagerFactory("conexionSubasta");
    } 

    public static ConexionDB getConexion() {
        return conexion;
    }

    public EntityManagerFactory getEntidadConexion() {
        return entidadConexion;
    }  
}