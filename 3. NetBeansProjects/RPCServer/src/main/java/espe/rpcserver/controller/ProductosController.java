package espe.rpcserver.controller;

import espe.rpcserver.models.ProductoModel;
import espe.rpcserver.models.entity.Productos;
import java.math.BigDecimal;
import java.util.List;
import javax.swing.JOptionPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.table.DefaultTableModel;

public class ProductosController {

     public void mostrar(JTable tbProductos) {

        DefaultTableModel modelo = new DefaultTableModel();

        modelo.addColumn("ID");
        modelo.addColumn("Nombre");
        modelo.addColumn("Precio");

        tbProductos.setModel(modelo);
        ProductoModel objModelo = new ProductoModel();
        List<Productos> productos = objModelo.mostrar();

        Object[] datos = new Object[3];

        for (Productos p : productos) {
            datos[0] = p.getId();
            datos[1] = p.getNombre();
            datos[2] = p.getPrecio();

            modelo.addRow(datos);
        }

        tbProductos.setModel(modelo);
    }

    public void InsertarProducto(JTextField paramNombre, JTextField paramPrecio) {
        try {
            ProductoModel pd = new ProductoModel();

            Productos prod = new Productos();

            prod.setId(null);
            prod.setNombre(paramNombre.getText());
            BigDecimal precio = new BigDecimal(paramPrecio.getText());
            prod.setPrecio(precio);
            
            pd.crear(prod);
            
            JOptionPane.showMessageDialog(null, "Producto ingresado correctamente");
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(null, "Error al insertar el producto");
            e.printStackTrace();
        }
    }
    
    public void SeleccionarProducto(JTable paramTablaProductos, JTextField paramID, JTextField paramNombre, JTextField paramPrecio){
        try {
            int fila = paramTablaProductos.getSelectedRow();
            
            if (fila >= 0) {
                
                paramID.setText(paramTablaProductos.getValueAt(fila, 0).toString());
                paramNombre.setText(paramTablaProductos.getValueAt(fila, 1).toString());
                paramPrecio.setText(paramTablaProductos.getValueAt(fila, 2).toString());
            }
                    
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, "Fallo en la seleccion del producto");
        }
    }

     public void EditarProducto(JTextField paramCode, JTextField paramNombre, JTextField paramPrecio) {
        try {
            ProductoModel pd = new ProductoModel();

            Productos prod = new Productos();

            prod.setId(Integer.valueOf(paramCode.getText()));
            prod.setNombre(paramNombre.getText());
            BigDecimal precio = new BigDecimal(paramPrecio.getText());
            prod.setPrecio(precio);
            
            pd.editar(prod);
            
            JOptionPane.showMessageDialog(null, "Producto modificado correctamente");
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(null, "Error al editar el producto");
            e.printStackTrace();
        }
    }
    
     public void EliminarProducto(JTextField paramCode) {
        try {
            ProductoModel pd = new ProductoModel();

            Productos prod = new Productos();

            prod.setId(Integer.valueOf(paramCode.getText()));
                        
            pd.eliminar(prod);
            
            JOptionPane.showMessageDialog(null, "Producto eliminado correctamente");
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(null, "Error al eliminar el producto");
            e.printStackTrace();
        }
    }
        
     public void limpiarCampos(JTextField paramID, JTextField paramNombre, JTextField paramPrecio){
        paramID.setText("");
        paramNombre.setText("");
        paramPrecio.setText("");
    }  
}