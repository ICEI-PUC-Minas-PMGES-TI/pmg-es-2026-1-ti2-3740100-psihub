package psihub.domain.model;

import psihub.domain.enums.StatusAcesso;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "psicologos")
public class Psicologo extends AuditableEntity {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "id")
    private Usuario usuario;

    @Column(nullable = false, unique = true, length = 30)
    private String crp;

    @Column(length = 500)
    private String biografia;

    @Column(name = "valor_consulta", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorConsulta;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_acesso", nullable = false, length = 20)
    private StatusAcesso statusAcesso = StatusAcesso.PENDENTE;

    @Column(name = "motivo_revogacao", length = 300)
    private String motivoRevogacao;

    @OneToMany(mappedBy = "psicologo")
    private List<EspecialidadePsicologo> especialidades = new ArrayList<>();

    @OneToMany(mappedBy = "psicologo")
    private List<VinculoPsicologoPaciente> vinculos = new ArrayList<>();

    @OneToMany(mappedBy = "psicologo")
    private List<RegraDisponibilidade> regrasDisponibilidade = new ArrayList<>();

    @OneToMany(mappedBy = "psicologo")
    private List<ExcecaoDisponibilidade> excecoesDisponibilidade = new ArrayList<>();

    @OneToMany(mappedBy = "psicologo")
    private List<SlotConsulta> slotsConsulta = new ArrayList<>();

    @OneToMany(mappedBy = "psicologo")
    private List<Consulta> consultas = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getCrp() {
        return crp;
    }

    public void setCrp(String crp) {
        this.crp = crp;
    }

    public String getBiografia() {
        return biografia;
    }

    public void setBiografia(String biografia) {
        this.biografia = biografia;
    }

    public BigDecimal getValorConsulta() {
        return valorConsulta;
    }

    public void setValorConsulta(BigDecimal valorConsulta) {
        this.valorConsulta = valorConsulta;
    }

    public StatusAcesso getStatusAcesso() {
        return statusAcesso;
    }

    public void setStatusAcesso(StatusAcesso statusAcesso) {
        this.statusAcesso = statusAcesso;
    }

    public String getMotivoRevogacao() {
        return motivoRevogacao;
    }

    public void setMotivoRevogacao(String motivoRevogacao) {
        this.motivoRevogacao = motivoRevogacao;
    }

    public List<EspecialidadePsicologo> getEspecialidades() {
        return especialidades;
    }

    public void setEspecialidades(List<EspecialidadePsicologo> especialidades) {
        this.especialidades = especialidades;
    }

    public List<VinculoPsicologoPaciente> getVinculos() {
        return vinculos;
    }

    public void setVinculos(List<VinculoPsicologoPaciente> vinculos) {
        this.vinculos = vinculos;
    }

    public List<RegraDisponibilidade> getRegrasDisponibilidade() {
        return regrasDisponibilidade;
    }

    public void setRegrasDisponibilidade(List<RegraDisponibilidade> regrasDisponibilidade) {
        this.regrasDisponibilidade = regrasDisponibilidade;
    }

    public List<ExcecaoDisponibilidade> getExcecoesDisponibilidade() {
        return excecoesDisponibilidade;
    }

    public void setExcecoesDisponibilidade(List<ExcecaoDisponibilidade> excecoesDisponibilidade) {
        this.excecoesDisponibilidade = excecoesDisponibilidade;
    }

    public List<SlotConsulta> getSlotsConsulta() {
        return slotsConsulta;
    }

    public void setSlotsConsulta(List<SlotConsulta> slotsConsulta) {
        this.slotsConsulta = slotsConsulta;
    }

    public List<Consulta> getConsultas() {
        return consultas;
    }

    public void setConsultas(List<Consulta> consultas) {
        this.consultas = consultas;
    }
}
