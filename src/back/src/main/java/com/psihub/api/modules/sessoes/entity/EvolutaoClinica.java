package com.psihub.api.modules.sessoes.entity;

import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.SQLRestriction;

@Entity
@SQLRestriction("ativo = true")
@Table(name = "evolucoes_clinicas")
public class EvolutaoClinica extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Psicologo psicologo;

    @Column(length = 500)
    private String titulo;

    @Column(name = "temas_sessao", columnDefinition = "TEXT")
    private String temasSessao;

    @Column(name = "anotacoes_clinicas", nullable = false, columnDefinition = "TEXT")
    private String anotacoesClinicas;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_engajamento", length = 10)
    private NivelEngajamento nivelEngajamento;

    @Column(name = "nivel_progresso")
    private Integer nivelProgresso;

    @Column(length = 1000)
    private String intercorrencias;

    @Column(name = "tarefas_encaminhamentos", columnDefinition = "TEXT")
    private String tarefasEncaminhamentos;

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

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getTemasSessao() {
        return temasSessao;
    }

    public void setTemasSessao(String temasSessao) {
        this.temasSessao = temasSessao;
    }

    public String getAnotacoesClinicas() {
        return anotacoesClinicas;
    }

    public void setAnotacoesClinicas(String anotacoesClinicas) {
        this.anotacoesClinicas = anotacoesClinicas;
    }

    public NivelEngajamento getNivelEngajamento() {
        return nivelEngajamento;
    }

    public void setNivelEngajamento(NivelEngajamento nivelEngajamento) {
        this.nivelEngajamento = nivelEngajamento;
    }

    public Integer getNivelProgresso() {
        return nivelProgresso;
    }

    public void setNivelProgresso(Integer nivelProgresso) {
        this.nivelProgresso = nivelProgresso;
    }

    public String getIntercorrencias() {
        return intercorrencias;
    }

    public void setIntercorrencias(String intercorrencias) {
        this.intercorrencias = intercorrencias;
    }

    public String getTarefasEncaminhamentos() {
        return tarefasEncaminhamentos;
    }

    public void setTarefasEncaminhamentos(String tarefasEncaminhamentos) {
        this.tarefasEncaminhamentos = tarefasEncaminhamentos;
    }
}
