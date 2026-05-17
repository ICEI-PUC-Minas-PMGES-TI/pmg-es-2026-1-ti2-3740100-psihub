package com.psihub.api.modules.consultas.entity;

import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.financeiro.entity.Pagamento;
import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.modules.sessoes.entity.ProntuarioSessao;
import com.psihub.api.shared.entity.BaseEntity;
import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.enums.TipoAtendimento;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import org.hibernate.annotations.SQLRestriction;

@Entity
@SQLRestriction("ativo = true")
@Table(name = "consultas")
public class Consulta extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Psicologo psicologo;

    @Column(name = "inicio_em")
    private LocalDateTime inicioEm;

    @Column(name = "fim_em")
    private LocalDateTime fimEm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "agendado_por_usuario_id", nullable = false)
    private Usuario agendadoPorUsuario;

    @Column(name = "iniciado_em")
    private LocalDateTime iniciadoEm;

    @Column(name = "finalizado_em")
    private LocalDateTime finalizadoEm;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_atendimento", nullable = false, length = 20)
    private TipoAtendimento tipoAtendimento = TipoAtendimento.ONLINE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusConsulta status = StatusConsulta.AGENDADA;

    @Column(length = 300)
    private String observacoes;

    @Column(name = "motivo_cancelamento", length = 300)
    private String motivoCancelamento;

    @OneToOne(mappedBy = "consulta", fetch = FetchType.LAZY)
    private ProntuarioSessao prontuarioSessao;

    @OneToOne(mappedBy = "consulta", fetch = FetchType.LAZY)
    private Pagamento pagamento;

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public Psicologo getPsicologo() {
        return psicologo;
    }

    public void setPsicologo(Psicologo psicologo) {
        this.psicologo = psicologo;
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

    public Usuario getAgendadoPorUsuario() {
        return agendadoPorUsuario;
    }

    public void setAgendadoPorUsuario(Usuario agendadoPorUsuario) {
        this.agendadoPorUsuario = agendadoPorUsuario;
    }

    public LocalDateTime getIniciadoEm() {
        return iniciadoEm;
    }

    public void setIniciadoEm(LocalDateTime iniciadoEm) {
        this.iniciadoEm = iniciadoEm;
    }

    public LocalDateTime getFinalizadoEm() {
        return finalizadoEm;
    }

    public void setFinalizadoEm(LocalDateTime finalizadoEm) {
        this.finalizadoEm = finalizadoEm;
    }

    public TipoAtendimento getTipoAtendimento() {
        return tipoAtendimento;
    }

    public void setTipoAtendimento(TipoAtendimento tipoAtendimento) {
        this.tipoAtendimento = tipoAtendimento;
    }

    public StatusConsulta getStatus() {
        return status;
    }

    public void setStatus(StatusConsulta status) {
        this.status = status;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public String getMotivoCancelamento() {
        return motivoCancelamento;
    }

    public void setMotivoCancelamento(String motivoCancelamento) {
        this.motivoCancelamento = motivoCancelamento;
    }

    public ProntuarioSessao getProntuarioSessao() {
        return prontuarioSessao;
    }

    public void setProntuarioSessao(ProntuarioSessao prontuarioSessao) {
        this.prontuarioSessao = prontuarioSessao;
    }

    public Pagamento getPagamento() {
        return pagamento;
    }

    public void setPagamento(Pagamento pagamento) {
        this.pagamento = pagamento;
    }
}

