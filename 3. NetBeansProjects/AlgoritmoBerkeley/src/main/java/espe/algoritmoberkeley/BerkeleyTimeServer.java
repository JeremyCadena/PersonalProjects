import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.io.PrintWriter;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class BerkeleyTimeServer {
    public static void main(String[] args) {
        try {
            // Configuración del servidor
            int PORT = 8000;

            // Crear un socket TCP/IP
            ServerSocket serverSocket = new ServerSocket(PORT);
            System.out.println("Servidor iniciado en el puerto: " + PORT);

            // Crear un pool de hilos para manejar múltiples clientes
            ExecutorService threadPool = Executors.newFixedThreadPool(10);

            while (true) {
                // Esperar una conexión
                Socket clientSocket = serverSocket.accept();
                System.out.println("Cliente conectado desde: " + clientSocket.getInetAddress().getHostAddress());

                // Crear un hilo para atender al cliente
                threadPool.execute(new ClientHandler(clientSocket));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

class ClientHandler implements Runnable {
    private final Socket clientSocket;

    public ClientHandler(Socket socket) {
        this.clientSocket = socket;
    }

    @Override
    public void run() {
        try {
            // Obtener la hora actual del servidor
            long currentTime = System.currentTimeMillis();

            // Enviar la hora actual al cliente
            PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
            out.println(currentTime);

            // Cerrar la conexión con el cliente
            clientSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}