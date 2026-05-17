package com.psihub.api.modules.agenda.service;

import com.psihub.api.modules.agenda.entity.RegraDisponibilidade;
import com.psihub.api.modules.agenda.entity.SlotConsulta;
import com.psihub.api.modules.agenda.repository.RegraDisponibilidadeRepository;
import com.psihub.api.modules.agenda.repository.SlotConsultaRepository;
import com.psihub.api.shared.enums.DiaSemana;
import com.psihub.api.shared.exception.ApiException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SlotConsultaService {

    private final SlotConsultaRepository slotConsultaRepository;
    private final RegraDisponibilidadeRepository regraDisponibilidadeRepository;

    public SlotConsultaService(
            SlotConsultaRepository slotConsultaRepository,
            RegraDisponibilidadeRepository regraDisponibilidadeRepository
    ) {
        this.slotConsultaRepository = slotConsultaRepository;
        this.regraDisponibilidadeRepository = regraDisponibilidadeRepository;
    }

    @Transactional
    public SlotConsulta buscarParaReserva(Long id) {
        return slotConsultaRepository.findByIdForUpdate(Objects.requireNonNull(id))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Horario nao encontrado"));
    }

    public void validarSemConflitoComPausa(Long psicologoId, LocalDate data, LocalTime inicio, LocalTime fim) {
        regraDisponibilidadeRepository
                .findByPsicologoIdAndDiaSemanaAndAtivoTrueOrderByIdDesc(psicologoId, toDiaSemana(data.getDayOfWeek()))
                .stream()
                .filter(regra -> regraVigenteNaData(regra, data))
                .findFirst()
                .ifPresent(regra -> {
                    if (sobrepoePausa(inicio, fim, regra)) {
                        throw new ApiException(HttpStatus.CONFLICT, "Horario reservado para intervalo");
                    }
                });
    }

    private boolean regraVigenteNaData(RegraDisponibilidade regra, LocalDate data) {
        return !regra.getValidoAPartirDe().isAfter(data)
                && (regra.getValidoAte() == null || !regra.getValidoAte().isBefore(data));
    }

    private boolean sobrepoePausa(LocalTime inicio, LocalTime fim, RegraDisponibilidade regra) {
        if (regra.getPausaInicio() == null || regra.getPausaFim() == null) {
            return false;
        }
        return inicio.isBefore(regra.getPausaFim()) && fim.isAfter(regra.getPausaInicio());
    }

    private DiaSemana toDiaSemana(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> DiaSemana.SEGUNDA;
            case TUESDAY -> DiaSemana.TERCA;
            case WEDNESDAY -> DiaSemana.QUARTA;
            case THURSDAY -> DiaSemana.QUINTA;
            case FRIDAY -> DiaSemana.SEXTA;
            case SATURDAY -> DiaSemana.SABADO;
            case SUNDAY -> DiaSemana.DOMINGO;
        };
    }
}
