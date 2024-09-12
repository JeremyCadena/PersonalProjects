package espe.servidorsubasta.entidades;

import jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "subastas")
@NamedQueries({
    @NamedQuery(name = "Subastas.findAll", query = "SELECT s FROM Subastas s"),
    @NamedQuery(name = "Subastas.findByIdSubasta", query = "SELECT s FROM Subastas s WHERE s.idSubasta = :idSubasta"),
    @NamedQuery(name = "Subastas.findByNombreSubasta", query = "SELECT s FROM Subastas s WHERE s.nombreSubasta = :nombreSubasta"),
    @NamedQuery(name = "Subastas.findByFechaInicio", query = "SELECT s FROM Subastas s WHERE s.fechaInicio = :fechaInicio"),
    @NamedQuery(name = "Subastas.findByFechaFin", query = "SELECT s FROM Subastas s WHERE s.fechaFin = :fechaFin"),
    @NamedQuery(name = "Subastas.findByPrecioInicial", query = "SELECT s FROM Subastas s WHERE s.precioInicial = :precioInicial"),
    @NamedQuery(name = "Subastas.findByEstado", query = "SELECT s FROM Subastas s WHERE s.estado = :estado")})
public class Subastas implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "idSubasta")
    private Integer idSubasta;
    @Basic(optional = false)
    @Column(name = "nombreSubasta")
    private String nombreSubasta;
    @Basic(optional = false)
    @Lob
    @Column(name = "descripcion")
    private String descripcion;
    @Basic(optional = false)
    @Column(name = "fechaInicio")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaInicio;
    @Basic(optional = false)
    @Column(name = "fechaFin")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaFin;
    // @Max(value=?)  @Min(value=?)//if you know range of your decimal fields consider using these annotations to enforce field validation
    @Basic(optional = false)
    @Column(name = "precioInicial")
    private BigDecimal precioInicial;
    @Basic(optional = false)
    @Column(name = "estado")
    private String estado;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "idSubasta")
    private List<Pujas> pujasList;
    @JoinColumn(name = "idUsuarioCreador", referencedColumnName = "idUsuario")
    @ManyToOne(optional = false)
    private Usuarios idUsuarioCreador;

    public Subastas() {
    }

    public Subastas(Integer idSubasta) {
        this.idSubasta = idSubasta;
    }

    public Subastas(Integer idSubasta, String nombreSubasta, String descripcion, Date fechaInicio, Date fechaFin, BigDecimal precioInicial, String estado) {
        this.idSubasta = idSubasta;
        this.nombreSubasta = nombreSubasta;
        this.descripcion = descripcion;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.precioInicial = precioInicial;
        this.estado = estado;
    }

    public Integer getIdSubasta() {
        return idSubasta;
    }

    public void setIdSubasta(Integer idSubasta) {
        this.idSubasta = idSubasta;
    }

    public String getNombreSubasta() {
        return nombreSubasta;
    }

    public void setNombreSubasta(String nombreSubasta) {
        this.nombreSubasta = nombreSubasta;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Date getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(Date fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public Date getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(Date fechaFin) {
        this.fechaFin = fechaFin;
    }

    public BigDecimal getPrecioInicial() {
        return precioInicial;
    }

    public void setPrecioInicial(BigDecimal precioInicial) {
        this.precioInicial = precioInicial;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public List<Pujas> getPujasList() {
        return pujasList;
    }

    public void setPujasList(List<Pujas> pujasList) {
        this.pujasList = pujasList;
    }

    public Usuarios getIdUsuarioCreador() {
        return idUsuarioCreador;
    }

    public void setIdUsuarioCreador(Usuarios idUsuarioCreador) {
        this.idUsuarioCreador = idUsuarioCreador;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (idSubasta != null ? idSubasta.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Subastas)) {
            return false;
        }
        Subastas other = (Subastas) object;
        if ((this.idSubasta == null && other.idSubasta != null) || (this.idSubasta != null && !this.idSubasta.equals(other.idSubasta))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "espe.servidorsubasta.entidades.Subastas[ idSubasta=" + idSubasta + " ]";
    }
    
}
