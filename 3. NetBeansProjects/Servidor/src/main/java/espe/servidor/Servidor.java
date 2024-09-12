package espe.servidor;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;

public class Servidor {

    public static void main(String[] args) {
        final int puerto = 8087;

        try (ServerSocket servidor = new ServerSocket(puerto)) {
            System.out.println("Servidor escuchando en el puerto " + puerto);

            while (true) {
                // Espera que un cliente se conecte
                Socket clienteSocket = servidor.accept();
                System.out.println("Cliente conectado desde: " + clienteSocket.getInetAddress());

                // Manejar la conexión con el cliente en un hilo separado
                Thread clientThread = new Thread(new ClienteHandler(clienteSocket));
                clientThread.start();
            }

        } catch (IOException ex) {
            System.err.println("Error en el servidor: " + ex.getMessage());
        }
    }

    static class ClienteHandler implements Runnable {
        private final Socket clienteSocket;

        public ClienteHandler(Socket clienteSocket) {
            this.clienteSocket = clienteSocket;
        }

        @Override
        public void run() {
            try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(clienteSocket.getInputStream()))) {
                // Leer los datos enviados por el cliente
                String mensajeCliente;
                while ((mensajeCliente = bufferedReader.readLine()) != null) {
                    System.out.println("Mensaje del cliente (" + clienteSocket.getInetAddress() + "): " + mensajeCliente);
                }
            } catch (IOException ex) {
                System.err.println("Error al manejar la conexión con el cliente: " + ex.getMessage());
            } finally {
                try {
                    clienteSocket.close();
                } catch (IOException ex) {
                    System.err.println("Error al cerrar el socket del cliente: " + ex.getMessage());
                }
            }
        }
    }
}
