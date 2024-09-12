package entidades;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name = "vuelos")
@NamedQueries({
    @NamedQuery(name = "Vuelos.findAll", query = "SELECT v FROM Vuelos v"),
    @NamedQuery(name = "Vuelos.findById", query = "SELECT v FROM Vuelos v WHERE v.id = :id"),
    @NamedQuery(name = "Vuelos.findByAerolinea", query = "SELECT v FROM Vuelos v WHERE v.aerolinea = :aerolinea"),
    @NamedQuery(name = "Vuelos.findByOrigen", query = "SELECT v FROM Vuelos v WHERE v.origen = :origen"),
    @NamedQuery(name = "Vuelos.findByDestino", query = "SELECT v FROM Vuelos v WHERE v.destino = :destino"),
    @NamedQuery(name = "Vuelos.findByFecha", query = "SELECT v FROM Vuelos v WHERE v.fecha = :fecha"),
    @NamedQuery(name = "Vuelos.findByAsientosDisponibles", query = "SELECT v FROM Vuelos v WHERE v.asientosDisponibles = :asientosDisponibles")})
public class Vuelos implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;
    @Column(name = "aerolinea")
    private String aerolinea;
    @Column(name = "origen")
    private String origen;
    @Column(name = "destino")
    private String destino;
    @Column(name = "fecha")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fecha;
    @Column(name = "asientos_disponibles")
    private Integer asientosDisponibles;
    @OneToMany(mappedBy = "idVuelo", fetch = FetchType.LAZY)
    private List<Reservas> reservasList;

    public Vuelos() {
    }

    public Vuelos(Integer id) {
        this.id = id;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getAerolinea() {
        return aerolinea;
    }

    public void setAerolinea(String aerolinea) {
        this.aerolinea = aerolinea;
    }

    public String getOrigen() {
        return origen;
    }

    public void setOrigen(String origen) {
        this.origen = origen;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public Integer getAsientosDisponibles() {
        return asientosDisponibles;
    }

    public void setAsientosDisponibles(Integer asientosDisponibles) {
        this.asientosDisponibles = asientosDisponibles;
    }

    public List<Reservas> getReservasList() {
        return reservasList;
    }

    public void setReservasList(List<Reservas> reservasList) {
        this.reservasList = reservasList;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Vuelos)) {
            return false;
        }
        Vuelos other = (Vuelos) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "entidades.Vuelos[ id=" + id + " ]";
    }
    
}
