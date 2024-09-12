package espe.rpcclient;

import espe.rpcclient.gui.VistaProductos;
import org.apache.xmlrpc.client.XmlRpcClient;
import org.apache.xmlrpc.client.XmlRpcClientConfigImpl;

import java.net.URL;

public class RPCClient {

    public static void main(String[] args) {
        try {
            // Configurar la URL del servidor RPC
            String serverUrl = "http://localhost:8086";

            // Configurar el cliente XML-RPC
            XmlRpcClientConfigImpl config = new XmlRpcClientConfigImpl();
            config.setServerURL(new URL(serverUrl));

            // Crear el cliente XML-RPC
            XmlRpcClient client = new XmlRpcClient();
            client.setConfig(config);

            // Crear la instancia de la interfaz de usuario del cliente
            VistaProductos objProductos = new VistaProductos();

            // Mostrar la interfaz de usuario del cliente
            objProductos.setVisible(true);
        } catch (Exception e) {
            System.err.println("Error en el cliente RPC: " + e.getMessage());
        }
    }
}