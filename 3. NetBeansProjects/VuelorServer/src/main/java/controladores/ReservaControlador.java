package controladores;

import entidades.Reservas;
import entidades.Usuarios;
import entidades.Vuelos;
import java.math.BigDecimal;
import javax.swing.JOptionPane;
import javax.swing.JTextField;
import modelos.ReservaModelo;

public class ReservaControlador {
   private ReservaModelo reservaModelo;
    
    public ReservaControlador() {
        this.reservaModelo = new ReservaModelo();
    }
    
   public void InsertarReserva(JTextField paramIDUser, JTextField paramIDVuelo) {
        try {
            ReservaModelo pd = new ReservaModelo();

            Reservas prod = new Reservas();
            
            int idUsuario = Integer.parseInt(paramIDUser.getText());
            int idVuelo = Integer.parseInt(paramIDVuelo.getText());
            
            Usuarios usuario = new Usuarios();
            usuario.setId(idUsuario);
            Vuelos vuelo = new Vuelos();
            vuelo.setId(idVuelo);
            
            prod.setId(null);
            prod.setIdUsuario(usuario);
            prod.setIdVuelo(vuelo);
            
            pd.crear(prod);
            
            JOptionPane.showMessageDialog(null, "Reserva ingresado correctamente");
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(null, "Error al insertar el producto");
            e.printStackTrace();
        }
    }
}
