package com.psihub.api.modules.agenda.entity;

import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.shared.entity.BaseEntity;
import com.psihub.api.shared.enums.StatusSlotConsulta;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.SQLRestriction;

@Entity
@SQLRestriction("ativo = true")
@Table(name = "slots_consulta")
public class SlotConsulta extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Psicologo psicologo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regra_disponibilidade_id")
    private RegraDisponibilidade regraDisponibilidade;

    @Column(name = "inicio_em", nullable = false)
    private LocalDateTime inicioEm;

    @Column(name = "fim_em", nullable = false)
    private LocalDateTime fimEm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusSlotConsulta status = StatusSlotConsulta.DISPONIVEL;

    @OneToMany(mappedBy = "slotConsulta")
    private List<Consulta> consultas = new ArrayList<>();

    public Psicologo getPsicologo() {
        return psicologo;
    }

    public void setPsicologo(Psicologo psicologo) {
        this.psicologo = psicologo;
    }

    public RegraDisponibilidade getRegraDisponibilidade() {
        return regraDisponibilidade;
    }

    public void setRegraDisponibilidade(RegraDisponibilidade regraDisponibilidade) {
        this.regraDisponibilidade = regraDisponibilidade;
    }

    public LocalDateTime getInicioEm() {
        return inicioEm;
    }

    public void setInicioEm(LocalDateTime inicioEm) {
        this.inicioEm = inicioEm;
    }

    public LocalDateTime getFimEm() {
        return fimEm;
    }

    public void setFimEm(LocalDateTime fimEm) {
        this.fimEm = fimEm;
    }

    public StatusSlotConsulta getStatus() {
        return status;
    }

    public void setStatus(StatusSlotConsulta status) {
        this.status = status;
    }

    public List<Consulta> getConsultas() {
        return consultas;
    }

    public void setConsultas(List<Consulta> consultas) {
        this.consultas = consultas;
    }
}

