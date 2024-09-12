package espe.servidorsubasta.entidades;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "pujas")
@NamedQueries({
    @NamedQuery(name = "Pujas.findAll", query = "SELECT p FROM Pujas p"),
    @NamedQuery(name = "Pujas.findByIdPuja", query = "SELECT p FROM Pujas p WHERE p.idPuja = :idPuja"),
    @NamedQuery(name = "Pujas.findByMontoPuja", query = "SELECT p FROM Pujas p WHERE p.montoPuja = :montoPuja"),
    @NamedQuery(name = "Pujas.findByFecha", query = "SELECT p FROM Pujas p WHERE p.fecha = :fecha")})
public class Pujas implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "idPuja")
    private Integer idPuja;
    // @Max(value=?)  @Min(value=?)//if you know range of your decimal fields consider using these annotations to enforce field validation
    @Basic(optional = false)
    @Column(name = "montoPuja")
    private BigDecimal montoPuja;
    @Basic(optional = false)
    @Column(name = "fecha")
    @Temporal(TemporalType.TIMESTAMP)
    private Date fecha;
    @JoinColumn(name = "idSubasta", referencedColumnName = "idSubasta")
    @ManyToOne(optional = false)
    private Subastas idSubasta;
    @JoinColumn(name = "idUsuario", referencedColumnName = "idUsuario")
    @ManyToOne(optional = false)
    private Usuarios idUsuario;

    public Pujas() {
    }

    public Pujas(Integer idPuja) {
        this.idPuja = idPuja;
    }

    public Pujas(Integer idPuja, BigDecimal montoPuja, Date fecha) {
        this.idPuja = idPuja;
        this.montoPuja = montoPuja;
        this.fecha = fecha;
    }

    public Integer getIdPuja() {
        return idPuja;
    }

    public void setIdPuja(Integer idPuja) {
        this.idPuja = idPuja;
    }

    public BigDecimal getMontoPuja() {
        return montoPuja;
    }

    public void setMontoPuja(BigDecimal montoPuja) {
        this.montoPuja = montoPuja;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public Subastas getIdSubasta() {
        return idSubasta;
    }

    public void setIdSubasta(Subastas idSubasta) {
        this.idSubasta = idSubasta;
    }

    public Usuarios getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Usuarios idUsuario) {
        this.idUsuario = idUsuario;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (idPuja != null ? idPuja.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Pujas)) {
            return false;
        }
        Pujas other = (Pujas) object;
        if ((this.idPuja == null && other.idPuja != null) || (this.idPuja != null && !this.idPuja.equals(other.idPuja))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "espe.servidorsubasta.entidades.Pujas[ idPuja=" + idPuja + " ]";
    }
    
}
