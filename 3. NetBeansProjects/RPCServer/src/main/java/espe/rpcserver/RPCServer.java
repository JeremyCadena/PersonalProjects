package espe.rpcserver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

public class RPCServer {

    public static void main(String[] args) {
        try {
            ServerSocket serverSocket = new ServerSocket(8087);
            System.out.println("Servidor en espera de conexiones...");


            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("Cliente conectado desde " + clientSocket.getInetAddress());

                // Inicia un hilo para manejar la comunicación con el cliente
                new Thread(() -> handleClient(clientSocket)).start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void handleClient(Socket clientSocket) {
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            PrintWriter writer = new PrintWriter(clientSocket.getOutputStream(), true);

                        // Leer y procesar los mensajes del cliente
            String message;
            while ((message = reader.readLine()) != null) {
                System.out.println("Mensaje recibido del cliente: " + message);
                // Procesar el mensaje y enviar actualizaciones a los clientes correspondientes
            }

            clientSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    
}
