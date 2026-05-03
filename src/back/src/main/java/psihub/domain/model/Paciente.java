package psihub.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pacientes")
public class Paciente extends AuditableEntity {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "id")
    private Usuario usuario;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(name = "observacoes_iniciais", length = 300)
    private String observacoesIniciais;

    @OneToMany(mappedBy = "paciente")
    private List<VinculoPsicologoPaciente> vinculos = new ArrayList<>();

    @OneToMany(mappedBy = "paciente")
    private List<Consulta> consultas = new ArrayList<>();

    @OneToMany(mappedBy = "paciente")
    private List<RegistroEmocional> registrosEmocionais = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getObservacoesIniciais() {
        return observacoesIniciais;
    }

    public void setObservacoesIniciais(String observacoesIniciais) {
        this.observacoesIniciais = observacoesIniciais;
    }

    public List<VinculoPsicologoPaciente> getVinculos() {
        return vinculos;
    }

    public void setVinculos(List<VinculoPsicologoPaciente> vinculos) {
        this.vinculos = vinculos;
    }

    public List<Consulta> getConsultas() {
        return consultas;
    }

    public void setConsultas(List<Consulta> consultas) {
        this.consultas = consultas;
    }

    public List<RegistroEmocional> getRegistrosEmocionais() {
        return registrosEmocionais;
    }

    public void setRegistrosEmocionais(List<RegistroEmocional> registrosEmocionais) {
        this.registrosEmocionais = registrosEmocionais;
    }
}
