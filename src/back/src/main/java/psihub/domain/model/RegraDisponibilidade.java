package psihub.domain.model;

import psihub.domain.enums.DiaSemana;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "regras_disponibilidade")
public class RegraDisponibilidade extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Psicologo psicologo;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false, length = 10)
    private DiaSemana diaSemana;

    @Column(name = "valido_a_partir_de", nullable = false)
    private LocalDate validoAPartirDe;

    @Column(name = "valido_ate")
    private LocalDate validoAte;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fim", nullable = false)
    private LocalTime horaFim;

    @Column(name = "duracao_slot_minutos", nullable = false)
    private Integer duracaoSlotMinutos;

    @Column(nullable = false)
    private Boolean ativo = true;

    @OneToMany(mappedBy = "regraDisponibilidade")
    private List<SlotConsulta> slotsConsulta = new ArrayList<>();

    public Psicologo getPsicologo() {
        return psicologo;
    }

    public void setPsicologo(Psicologo psicologo) {
        this.psicologo = psicologo;
    }

    public DiaSemana getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(DiaSemana diaSemana) {
        this.diaSemana = diaSemana;
    }

    public LocalDate getValidoAPartirDe() {
        return validoAPartirDe;
    }

    public void setValidoAPartirDe(LocalDate validoAPartirDe) {
        this.validoAPartirDe = validoAPartirDe;
    }

    public LocalDate getValidoAte() {
        return validoAte;
    }

    public void setValidoAte(LocalDate validoAte) {
        this.validoAte = validoAte;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFim() {
        return horaFim;
    }

    public void setHoraFim(LocalTime horaFim) {
        this.horaFim = horaFim;
    }

    public Integer getDuracaoSlotMinutos() {
        return duracaoSlotMinutos;
    }

    public void setDuracaoSlotMinutos(Integer duracaoSlotMinutos) {
        this.duracaoSlotMinutos = duracaoSlotMinutos;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public List<SlotConsulta> getSlotsConsulta() {
        return slotsConsulta;
    }

    public void setSlotsConsulta(List<SlotConsulta> slotsConsulta) {
        this.slotsConsulta = slotsConsulta;
    }
}
