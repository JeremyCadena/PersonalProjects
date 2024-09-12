package espe.relojservidor;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

public class RelojServidor {

    public static void main(String[] args) throws IOException {
        int puerto = 8086; 
        try (
                ServerSocket server = new ServerSocket(puerto);
                Socket clienteSocket = server.accept();
                PrintWriter out = new PrintWriter(clienteSocket.getOutputStream(), true);
                BufferedReader in = new BufferedReader(new InputStreamReader(clienteSocket.getInputStream()));) {

            String inputLine;
            System.out.println("Servidor Iniciado");
            while (true) {
                inputLine = in.readLine();
                if (inputLine.equalsIgnoreCase("Exit")) {
                    System.out.println("Cerrando");
                    out.println("Servidor cerrando");
                    break;
                }
                out.println(System.currentTimeMillis());
            }
        } catch (Exception ex) {
            System.out.println("Tiempo agotado");
        }
    }
}