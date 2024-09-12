package controladores;

import entidades.Vuelos;
import java.util.List;
import javax.swing.JOptionPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.table.DefaultTableModel;
import modelos.VueloModelo;

public class VueloControlador {

    public void mostrar(JTable tbVuelos) {
        DefaultTableModel modelo = new DefaultTableModel();
        modelo.addColumn("ID");
        modelo.addColumn("Aerolinea");
        modelo.addColumn("Origen");
        modelo.addColumn("Destino");
        modelo.addColumn("Fecha");

        tbVuelos.setModel(modelo);
        VueloModelo objModelo = new VueloModelo();
        List<Vuelos> vuelos = objModelo.mostrar();

        for (Vuelos vuelo : vuelos) {
            Object[] datos = new Object[5];
            datos[0] = vuelo.getId();
            datos[1] = vuelo.getAerolinea();
            datos[2] = vuelo.getOrigen();
            datos[3] = vuelo.getDestino();
            datos[4] = vuelo.getFecha();

            modelo.addRow(datos);
        }

        tbVuelos.setModel(modelo);
    }

    public void SeleccionarVuelo(JTable paramTablaVuelos, JTextField paramID, JTextField paramAerolinea, JTextField paramOrigen, JTextField paramDestino, JTextField paramFecha) {
        try {
            int fila = paramTablaVuelos.getSelectedRow();

            if (fila >= 0) {

                paramID.setText(paramTablaVuelos.getValueAt(fila, 0).toString());
                paramAerolinea.setText(paramTablaVuelos.getValueAt(fila, 1).toString());
                paramOrigen.setText(paramTablaVuelos.getValueAt(fila, 2).toString());
                paramDestino.setText(paramTablaVuelos.getValueAt(fila, 3).toString());
                paramFecha.setText(paramTablaVuelos.getValueAt(fila, 4).toString());
            }

        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, "Fallo en la seleccion del vuelo");
        }
    }
}
