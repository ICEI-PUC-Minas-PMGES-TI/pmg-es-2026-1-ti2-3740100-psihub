package psihub.domain.model;

import psihub.domain.enums.NivelEngajamento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "prontuarios_sessao")
public class ProntuarioSessao extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consulta_id", nullable = false, unique = true)
    private Consulta consulta;

    @Column(name = "observacoes_pre_sessao", columnDefinition = "TEXT")
    private String observacoesPreSessao;

    @Column(name = "anotacoes_clinicas", columnDefinition = "TEXT")
    private String anotacoesClinicas;

    @Column(length = 1000)
    private String intercorrencias;

    @Column(name = "evolucao_clinica", columnDefinition = "TEXT")
    private String evolucaoClinica;

    @Column(name = "tarefas_encaminhamentos", length = 1000)
    private String tarefasEncaminhamentos;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_engajamento", length = 10)
    private NivelEngajamento nivelEngajamento;

    @Column(name = "nivel_progresso")
    private Integer nivelProgresso;

    @Column(name = "incluir_linha_tempo", nullable = false)
    private Boolean incluirLinhaTempo = true;

    @Column(name = "temas_sessao", columnDefinition = "TEXT")
    private String temasSessao;

    @Column(columnDefinition = "TEXT")
    private String intervencoes;

    public Consulta getConsulta() {
        return consulta;
    }

    public void setConsulta(Consulta consulta) {
        this.consulta = consulta;
    }

    public String getObservacoesPreSessao() {
        return observacoesPreSessao;
    }

    public void setObservacoesPreSessao(String observacoesPreSessao) {
        this.observacoesPreSessao = observacoesPreSessao;
    }

    public String getAnotacoesClinicas() {
        return anotacoesClinicas;
    }

    public void setAnotacoesClinicas(String anotacoesClinicas) {
        this.anotacoesClinicas = anotacoesClinicas;
    }

    public String getIntercorrencias() {
        return intercorrencias;
    }

    public void setIntercorrencias(String intercorrencias) {
        this.intercorrencias = intercorrencias;
    }

    public String getEvolucaoClinica() {
        return evolucaoClinica;
    }

    public void setEvolucaoClinica(String evolucaoClinica) {
        this.evolucaoClinica = evolucaoClinica;
    }

    public String getTarefasEncaminhamentos() {
        return tarefasEncaminhamentos;
    }

    public void setTarefasEncaminhamentos(String tarefasEncaminhamentos) {
        this.tarefasEncaminhamentos = tarefasEncaminhamentos;
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

    public Boolean getIncluirLinhaTempo() {
        return incluirLinhaTempo;
    }

    public void setIncluirLinhaTempo(Boolean incluirLinhaTempo) {
        this.incluirLinhaTempo = incluirLinhaTempo;
    }

    public String getTemasSessao() {
        return temasSessao;
    }

    public void setTemasSessao(String temasSessao) {
        this.temasSessao = temasSessao;
    }

    public String getIntervencoes() {
        return intervencoes;
    }

    public void setIntervencoes(String intervencoes) {
        this.intervencoes = intervencoes;
    }
}
