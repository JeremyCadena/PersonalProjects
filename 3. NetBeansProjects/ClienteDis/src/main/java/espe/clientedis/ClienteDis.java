package espe.clientedis;

import java.io.IOException;
import java.io.OutputStream;
import java.net.Socket;
import java.io.*;
import java.util.Scanner;


public class ClienteDis {

    public static void main(String[] args) {
        final String ipServidor = "192.168.137.10";
        final int puerto = 8087;

        try (Socket cliente = new Socket(ipServidor, puerto)) {
            System.out.println("Conectado al servidor. Escribe un mensaje:");

            // Configura el flujo de salida para enviar mensajes al servidor
            OutputStream outputStream = cliente.getOutputStream();
            PrintWriter writer = new PrintWriter(outputStream, true);

            // Configura el flujo de entrada para leer mensajes desde el teclado
            Scanner scanner = new Scanner(System.in);

            while (true) {
                
                System.out.print("Mensaje: ");
                String mensaje = scanner.nextLine();

                // Envía el mensaje al servidor
                writer.println(mensaje);
                System.out.println("Mensaje enviado al servidor");
            }
        } catch (IOException ex) {
            
        }
    }
}