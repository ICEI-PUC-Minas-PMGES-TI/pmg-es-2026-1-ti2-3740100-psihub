package com.psihub.api.modules.avaliacoes.entity;

import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

@Entity
@SQLRestriction("ativo = true")
@Table(name = "avaliacoes")
public class Avaliacao extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consulta_id", nullable = false, unique = true)
    private Consulta consulta;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Psicologo psicologo;

    @Column(nullable = false)
    @JdbcTypeCode(SqlTypes.TINYINT)
    private int nota;

    @Column(length = 300)
    private String comentario;

    @Column(name = "avaliado_em", nullable = false)
    private LocalDateTime avaliadoEm;

    @PrePersist
    void prePersist() {
        if (avaliadoEm == null) {
            avaliadoEm = LocalDateTime.now();
        }
    }

    public Consulta getConsulta() { return consulta; }
    public void setConsulta(Consulta consulta) { this.consulta = consulta; }

    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }

    public Psicologo getPsicologo() { return psicologo; }
    public void setPsicologo(Psicologo psicologo) { this.psicologo = psicologo; }

    public int getNota() { return nota; }
    public void setNota(int nota) { this.nota = nota; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public LocalDateTime getAvaliadoEm() { return avaliadoEm; }
    public void setAvaliadoEm(LocalDateTime avaliadoEm) { this.avaliadoEm = avaliadoEm; }
}
