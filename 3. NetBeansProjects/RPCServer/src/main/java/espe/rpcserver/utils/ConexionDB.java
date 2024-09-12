package espe.rpcserver.utils;

import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class ConexionDB {
    private static ConexionDB conexion = new ConexionDB();
    private EntityManagerFactory entidadConexion;
    
    private ConexionDB(){
        entidadConexion = Persistence.createEntityManagerFactory("conexionCRUD");
    } 

    public static ConexionDB getConexion() {
        return conexion;
    }

    public EntityManagerFactory getEntidadConexion() {
        return entidadConexion;
    }
    
    
}