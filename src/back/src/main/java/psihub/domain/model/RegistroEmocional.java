package psihub.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_emocionais")
public class RegistroEmocional extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "humor_dia", nullable = false)
    private Integer humorDia;

    @Column(length = 500)
    private String descricao;

    @Column(columnDefinition = "TEXT")
    private String emocoes;

    @Column(name = "registrado_em", nullable = false)
    private LocalDateTime registradoEm;

    @Column(name = "editavel_ate", nullable = false)
    private LocalDateTime editavelAte;

    @PrePersist
    void prePersist() {
        if (registradoEm == null) {
            registradoEm = LocalDateTime.now();
        }
        if (editavelAte == null) {
            editavelAte = registradoEm.plusHours(24);
        }
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public Integer getHumorDia() {
        return humorDia;
    }

    public void setHumorDia(Integer humorDia) {
        this.humorDia = humorDia;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getEmocoes() {
        return emocoes;
    }

    public void setEmocoes(String emocoes) {
        this.emocoes = emocoes;
    }

    public LocalDateTime getRegistradoEm() {
        return registradoEm;
    }

    public void setRegistradoEm(LocalDateTime registradoEm) {
        this.registradoEm = registradoEm;
    }

    public LocalDateTime getEditavelAte() {
        return editavelAte;
    }

    public void setEditavelAte(LocalDateTime editavelAte) {
        this.editavelAte = editavelAte;
    }
}
