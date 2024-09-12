package espe.subastasserver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.Collections;
import org.java_websocket.WebSocket;
import org.java_websocket.drafts.Draft;
import org.java_websocket.drafts.Draft_6455;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

public class SubastasServer extends WebSocketServer {

    public SubastasServer(int puerto) throws UnknownHostException {
        super(new InetSocketAddress(puerto));
    }

    public SubastasServer(InetSocketAddress address) {
        super(address);
    }

    public SubastasServer(int puerto, Draft_6455 draft) {
        super(new InetSocketAddress(puerto), Collections.<Draft>singletonList(draft));
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        conn.send("Bienvenido al servidor!");
        broadcast("Nueva conexion: " + handshake.getResourceDescriptor());
        System.out.println(conn.getRemoteSocketAddress().getAddress().getHostAddress() + "ha entrado al servidor");
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        broadcast(conn + "ha salido del servidor!");
        System.out.println(conn + "ha salido del servidor!");
    }

    @Override
    public void onMessage(WebSocket conn, String mensaje) {
        broadcast(mensaje);
        System.out.println(conn + ": " + mensaje);
    }

    public static void main(String[] args) throws InterruptedException, IOException {
        int puerto = 8080;
        try {
            puerto = Integer.parseInt(args[0]);
        } catch (Exception ex) {
        }
        SubastasServer s = new SubastasServer(puerto);
        s.start();
        System.out.println("El servidor de subastas esta en el puerto: " + s.getPort());

        BufferedReader sysin = new BufferedReader(new InputStreamReader(System.in));
        while (true) {
            String in = sysin.readLine();
            s.broadcast(in);
            if (in.equals("exit")) {
                s.stop(1000);
                break;
            }
        }
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        ex.printStackTrace();
        if (conn != null) {

        }
    }

    @Override
    public void onStart() {
        System.out.println("Servidor activado!");
        setConnectionLostTimeout(0);
        setConnectionLostTimeout(100);
    }
}