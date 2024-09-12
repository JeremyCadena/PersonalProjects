package espe.relojcliente;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

public class RelojCliente {

    public static void main(String[] args) throws IOException {
        String hostName = "localhost"; 
        int puerto = 8086; 

        try (
                Socket echoSocket = new Socket(hostName, puerto);
                PrintWriter out = new PrintWriter(echoSocket.getOutputStream(), true);
                BufferedReader in = new BufferedReader(new InputStreamReader(echoSocket.getInputStream()));) {

            System.out.println("Cliente Iniciado");

            while (true) {
                out.println("Solicitud de tiempo");
                long TiempoCero = System.currentTimeMillis();
                long Tiempo_Servidor = Long.parseLong(in.readLine());
                long TiempoUno = System.currentTimeMillis();

                long Tiempo_final = (Tiempo_Servidor + ((TiempoUno - TiempoCero) / 2));
                DateFormat formatter = new SimpleDateFormat("HH:mm:ss:SSS");

                System.out.println("Tiempo del cliente: " + formatter.format(new Date(TiempoUno)));
                System.out.println("Tiempo del servidor: " + formatter.format(new Date(Tiempo_Servidor)));
                System.out.println("Tiempo del cliente luego del ajuste: " + formatter.format(new Date(Tiempo_final)));

                // Espera un tiempo antes de enviar la siguiente solicitud
                Thread.sleep(5000);
            }

        } catch (Exception ex) {
            System.out.println("Tiempo agotado");
        }
    }
}
