package espe.berkeleycliente;
        
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;
import java.net.UnknownHostException;

public class BerkeleyCliente {
    public static void main(String[] args) {
        try {
            // Configuración del cliente
            String HOST = "localhost";
            int PORT = 8086;

            // Crear un socket TCP/IP
            Socket clientSocket = new Socket(HOST, PORT);

            // Recibir la hora actual del servidor
            BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            long serverTime = Long.parseLong(in.readLine());

            System.out.println("Hora en el servidor: " + serverTime);

            // Ajustar el reloj del cliente con la hora del servidor
            long clientTime = System.currentTimeMillis();
            long timeDifference = serverTime - clientTime;
            System.out.println("Diferencia de tiempo: " + timeDifference + " ms");

            // Cerrar la conexión con el servidor
            clientSocket.close();
        } catch (UnknownHostException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}