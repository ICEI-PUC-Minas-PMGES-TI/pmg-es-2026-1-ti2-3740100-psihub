package com.psihub.api.modules.agenda.service;

import com.psihub.api.modules.agenda.dto.AgendaCompletaResponse;
import com.psihub.api.modules.agenda.dto.DefinirDisponibilidadeRequest;
import com.psihub.api.modules.agenda.dto.DisponibilidadeResponse;
import com.psihub.api.modules.agenda.dto.HorarioDisponivelDTO;
import com.psihub.api.modules.agenda.dto.PacienteResumoResponse;
import com.psihub.api.modules.agenda.dto.RegraDisponibilidadeResponse;
import com.psihub.api.modules.agenda.entity.ExcecaoDisponibilidade;
import com.psihub.api.modules.agenda.entity.RegraDisponibilidade;
import com.psihub.api.modules.agenda.entity.TipoExcecaoDisponibilidade;
import com.psihub.api.modules.agenda.repository.ExcecaoDisponibilidadeRepository;
import com.psihub.api.modules.agenda.repository.RegraDisponibilidadeRepository;
import com.psihub.api.modules.consultas.dto.ConsultaResponse;
import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.consultas.repository.ConsultaRepository;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.shared.enums.DiaSemana;
import com.psihub.api.shared.enums.StatusAcesso;
import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.exception.ApiException;
import com.psihub.api.shared.utils.ApiResponseMapper;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgendaService {

    private static final int DURACAO_PADRAO_MINUTOS = 50;
    private static final int DIAS_GERACAO_PADRAO = 30;

    private static final Collection<StatusConsulta> STATUS_CONSULTA_BLOQUEANTES = EnumSet.of(
            StatusConsulta.AGENDADA,
            StatusConsulta.CONFIRMADA,
            StatusConsulta.EM_ANDAMENTO
    );

    private final PsicologoService psicologoService;
    private final RegraDisponibilidadeRepository regraDisponibilidadeRepository;
    private final ExcecaoDisponibilidadeRepository excecaoDisponibilidadeRepository;
    private final ConsultaRepository consultaRepository;
    private final PacienteService pacienteService;
    private final ApiResponseMapper mapper;

    public AgendaService(
            PsicologoService psicologoService,
            RegraDisponibilidadeRepository regraDisponibilidadeRepository,
        ExcecaoDisponibilidadeRepository excecaoDisponibilidadeRepository,
        ConsultaRepository consultaRepository,
            PacienteService pacienteService,
            ApiResponseMapper mapper
    ) {
        this.psicologoService = psicologoService;
        this.regraDisponibilidadeRepository = regraDisponibilidadeRepository;
    this.excecaoDisponibilidadeRepository = excecaoDisponibilidadeRepository;
    this.consultaRepository = consultaRepository;
        this.pacienteService = pacienteService;
        this.mapper = mapper;
    }

    @Transactional
    public DisponibilidadeResponse definirDisponibilidade(Long psicologoId, DefinirDisponibilidadeRequest request) {
        Psicologo psicologo = buscarPsicologoAtivo(psicologoId);
        validarPeriodo(request.horaInicio(), request.horaFim());
        validarPausa(request.horaInicio(), request.horaFim(), request.pausaInicio(), request.pausaFim());
        validarVigencia(request.validoAPartirDe(), request.validoAte());

        int duracao = request.duracaoSlotMinutos() == null ? DURACAO_PADRAO_MINUTOS : request.duracaoSlotMinutos();
        List<RegraDisponibilidade> regras = request.diasSemana()
                .stream()
                .sorted(Comparator.comparing(DiaSemana::name))
                .map(dia -> criarRegra(psicologo, dia, request, duracao))
                .map(regraDisponibilidadeRepository::save)
                .toList();

        return new DisponibilidadeResponse(
                regras.stream().map(mapper::toResponse).toList(),
            List.of()
        );
    }

    @Transactional(readOnly = true)
    public List<RegraDisponibilidadeResponse> listarRegras(Long psicologoId) {
        buscarPsicologo(psicologoId);
        return regraDisponibilidadeRepository.findByPsicologoIdAndAtivoTrueOrderByDiaSemanaAscHoraInicioAsc(psicologoId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HorarioDisponivelDTO> listarDisponibilidade(Long psicologoId, LocalDate de, LocalDate ate) {
        if (!psicologoExiste(psicologoId)) {
            return List.of();
        }

        LocalDate inicio = de == null ? LocalDate.now() : de;
        LocalDate fim = ate == null ? inicio.plusDays(DIAS_GERACAO_PADRAO) : ate;
        if (fim.isBefore(inicio)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Data final deve ser posterior ou igual a inicial");
        }

        LocalDateTime inicioPeriodo = inicio.atStartOfDay();
        LocalDateTime fimPeriodo = fim.plusDays(1).atStartOfDay();
        validarIntervaloDataHora(inicioPeriodo, fimPeriodo);

        List<RegraDisponibilidade> regras = regraDisponibilidadeRepository
                .findByPsicologoIdAndAtivoTrueOrderByDiaSemanaAscHoraInicioAsc(psicologoId);

        Map<LocalDate, List<ExcecaoDisponibilidade>> excecoesPorData = excecaoDisponibilidadeRepository
                .findByPsicologoIdAndDataBetweenAndAtivoTrue(psicologoId, inicio, fim)
                .stream()
                .collect(Collectors.groupingBy(ExcecaoDisponibilidade::getData));

        List<Consulta> consultas = consultaRepository.findByFiltros(
                null,
                psicologoId,
                STATUS_CONSULTA_BLOQUEANTES,
                inicioPeriodo,
                fimPeriodo
        );

        List<HorarioDisponivelDTO> disponibilidade = new ArrayList<>();
        Set<String> chavesGeradas = new HashSet<>();

        for (LocalDate data = inicio; !data.isAfter(fim); data = data.plusDays(1)) {
            LocalDate dataAtual = data;
            List<RegraDisponibilidade> regrasDoDia = regras.stream()
                .filter(regra -> regra.getDiaSemana() == toDiaSemana(dataAtual.getDayOfWeek()))
                .filter(regra -> regraVigenteNaData(regra, dataAtual))
                    .toList();

            List<ExcecaoDisponibilidade> excecoesDoDia = excecoesPorData.getOrDefault(dataAtual, List.of());

            for (RegraDisponibilidade regra : regrasDoDia) {
                adicionarSlotsDoIntervalo(
                dataAtual,
                        regra.getHoraInicio(),
                        regra.getHoraFim(),
                        regra.getDuracaoSlotMinutos(),
                        regra,
                        excecoesDoDia,
                        consultas,
                        disponibilidade,
                        chavesGeradas
                );
            }

            for (ExcecaoDisponibilidade excecao : excecoesDoDia) {
                if (excecao.getTipo() != TipoExcecaoDisponibilidade.JANELA_EXTRA) {
                    continue;
                }

                if (excecao.getHoraInicio() == null || excecao.getHoraFim() == null
                        || !excecao.getHoraFim().isAfter(excecao.getHoraInicio())) {
                    continue;
                }

                int duracao = regrasDoDia.isEmpty()
                        ? DURACAO_PADRAO_MINUTOS
                        : regrasDoDia.get(0).getDuracaoSlotMinutos();

                adicionarSlotsDoIntervalo(
                    dataAtual,
                        excecao.getHoraInicio(),
                        excecao.getHoraFim(),
                        duracao,
                        null,
                        excecoesDoDia,
                        consultas,
                        disponibilidade,
                        chavesGeradas
                );
            }
        }

        return disponibilidade.stream()
                .sorted(Comparator.comparing(HorarioDisponivelDTO::inicio))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HorarioDisponivelDTO> listarDisponibilidade(Long psicologoId, LocalDateTime inicio, LocalDateTime fim) {
        validarIntervaloDataHora(inicio, fim);
        LocalDate dataFinal = fim.minusNanos(1).toLocalDate();

        return listarDisponibilidade(psicologoId, inicio.toLocalDate(), dataFinal)
                .stream()
                .filter(horario -> !horario.inicio().isBefore(inicio) && !horario.fim().isAfter(fim))
                .toList();
    }

    @Transactional(readOnly = true)
    public AgendaCompletaResponse listarAgendaCompleta(Long psicologoId, LocalDateTime inicio, LocalDateTime fim) {
        validarIntervaloDataHora(inicio, fim);
        if (!psicologoExiste(psicologoId)) {
            return new AgendaCompletaResponse(List.of(), List.of());
        }

        List<HorarioDisponivelDTO> horariosDisponiveis = listarDisponibilidade(psicologoId, inicio, fim);
        List<ConsultaResponse> consultas = consultaRepository.findByFiltros(
                        null,
                        psicologoId,
                        STATUS_CONSULTA_BLOQUEANTES,
                        inicio,
                        fim
                )
                .stream()
                .map(mapper::toResponse)
                .toList();

        return new AgendaCompletaResponse(horariosDisponiveis, consultas);
    }

    @Transactional(readOnly = true)
    public List<PacienteResumoResponse> listarPacientesVinculados(Long psicologoId, String nome) {
        buscarPsicologo(psicologoId);
        String filtroNome = (nome == null || nome.isBlank()) ? null : ("%" + nome.trim().toLowerCase() + "%");
        return pacienteService.buscarPorPsicologoId(psicologoId, filtroNome)
                .stream()
                .map(paciente -> new PacienteResumoResponse(paciente.getId(), paciente.getUsuario().getNome()))
                .toList();
    }

    private RegraDisponibilidade criarRegra(
            Psicologo psicologo,
            DiaSemana dia,
            DefinirDisponibilidadeRequest request,
            int duracao
    ) {
        RegraDisponibilidade regra = new RegraDisponibilidade();
        regra.setPsicologo(psicologo);
        regra.setDiaSemana(dia);
        regra.setValidoAPartirDe(request.validoAPartirDe());
        regra.setValidoAte(request.validoAte());
        regra.setHoraInicio(request.horaInicio());
        regra.setHoraFim(request.horaFim());
        regra.setPausaInicio(request.pausaInicio());
        regra.setPausaFim(request.pausaFim());
        regra.setDuracaoSlotMinutos(duracao);
        regra.setAtivo(true);
        return regra;
    }

    private void adicionarSlotsDoIntervalo(
            LocalDate data,
            LocalTime horaInicio,
            LocalTime horaFim,
            Integer duracaoMinutos,
            RegraDisponibilidade regra,
            List<ExcecaoDisponibilidade> excecoesDoDia,
            List<Consulta> consultas,
            List<HorarioDisponivelDTO> disponibilidade,
            Set<String> chavesGeradas
    ) {
        if (horaInicio == null || horaFim == null || duracaoMinutos == null || duracaoMinutos <= 0
                || !horaFim.isAfter(horaInicio)) {
            return;
        }

        LocalDateTime agora = LocalDateTime.now();
        LocalTime cursor = horaInicio;

        while (!cursor.plusMinutes(duracaoMinutos).isAfter(horaFim)) {
            LocalTime inicioSlotHora = cursor;
            LocalTime fimSlotHora = inicioSlotHora.plusMinutes(duracaoMinutos);
            LocalDateTime inicioSlot = data.atTime(inicioSlotHora);
            LocalDateTime fimSlot = data.atTime(fimSlotHora);

            boolean sobrepoePausa = regra != null && sobrepoePausa(inicioSlotHora, fimSlotHora, regra);
            boolean bloqueadoPorExcecao = excecoesDoDia.stream()
                    .filter(excecao -> excecao.getTipo() != TipoExcecaoDisponibilidade.JANELA_EXTRA)
                .anyMatch(excecao -> sobrepoeExcecao(inicioSlotHora, fimSlotHora, excecao));
            boolean ocupadoPorConsulta = consultas.stream()
                    .filter(consulta -> consulta.getInicioEm() != null && consulta.getFimEm() != null)
                    .anyMatch(consulta -> sobrepoeIntervalo(inicioSlot, fimSlot, consulta.getInicioEm(), consulta.getFimEm()));

            if (!inicioSlot.isBefore(agora) && !sobrepoePausa && !bloqueadoPorExcecao && !ocupadoPorConsulta) {
                String chave = inicioSlot + "|" + fimSlot;
                if (chavesGeradas.add(chave)) {
                    disponibilidade.add(new HorarioDisponivelDTO(inicioSlot, fimSlot));
                }
            }

            cursor = cursor.plusMinutes(duracaoMinutos);
        }
    }

    private Psicologo buscarPsicologo(Long psicologoId) {
        return psicologoService.buscarPorId(psicologoId);
    }

    private boolean psicologoExiste(Long psicologoId) {
        if (psicologoId == null) {
            return false;
        }

        try {
            buscarPsicologo(psicologoId);
            return true;
        } catch (ApiException exception) {
            if (exception.getStatus() == HttpStatus.NOT_FOUND) {
                return false;
            }
            throw exception;
        }
    }

    private Psicologo buscarPsicologoAtivo(Long psicologoId) {
        Psicologo psicologo = buscarPsicologo(psicologoId);
        if (psicologo.getStatusAcesso() != StatusAcesso.ATIVO) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Psicologo ainda nao possui acesso ativo");
        }
        return psicologo;
    }

    private void validarPeriodo(LocalTime inicio, LocalTime fim) {
        if (!fim.isAfter(inicio)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Horario de fim deve ser posterior ao horario de inicio");
        }
    }

    private void validarPausa(LocalTime horaInicio, LocalTime horaFim, LocalTime pausaInicio, LocalTime pausaFim) {
        if (pausaInicio == null && pausaFim == null) {
            return;
        }

        if (pausaInicio == null || pausaFim == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Informe inicio e fim do intervalo");
        }

        if (!pausaFim.isAfter(pausaInicio)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Fim do intervalo deve ser posterior ao inicio");
        }

        if (pausaInicio.isBefore(horaInicio) || pausaFim.isAfter(horaFim)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Intervalo deve estar dentro do horario de atendimento");
        }
    }

    @SuppressWarnings("unused")
    private void validarSemConflitoComPausa(Long psicologoId, LocalDate data, LocalTime inicio, LocalTime fim) {
        regraDisponibilidadeRepository.findByPsicologoIdAndDiaSemanaAndAtivoTrueOrderByIdDesc(psicologoId, toDiaSemana(data.getDayOfWeek()))
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
        return (regra.getValidoAPartirDe() == null || !regra.getValidoAPartirDe().isAfter(data))
                && (regra.getValidoAte() == null || !regra.getValidoAte().isBefore(data));
    }

    private boolean sobrepoePausa(LocalTime inicio, LocalTime fim, RegraDisponibilidade regra) {
        if (regra.getPausaInicio() == null || regra.getPausaFim() == null) {
            return false;
        }

        return inicio.isBefore(regra.getPausaFim()) && fim.isAfter(regra.getPausaInicio());
    }

    private void validarVigencia(LocalDate inicio, LocalDate fim) {
        if (fim != null && fim.isBefore(inicio)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Data final de vigencia deve ser posterior ou igual a inicial");
        }
    }

    private void validarIntervaloDataHora(LocalDateTime inicio, LocalDateTime fim) {
        if (inicio == null || fim == null || !fim.isAfter(inicio)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Fim do periodo deve ser posterior ao inicio");
        }
    }

    private boolean sobrepoeExcecao(LocalTime inicio, LocalTime fim, ExcecaoDisponibilidade excecao) {
        if (excecao.getTipo() == TipoExcecaoDisponibilidade.FOLGA) {
            return true;
        }

        if (excecao.getHoraInicio() == null || excecao.getHoraFim() == null) {
            return true;
        }

        return inicio.isBefore(excecao.getHoraFim()) && fim.isAfter(excecao.getHoraInicio());
    }

    private boolean sobrepoeIntervalo(
            LocalDateTime inicioA,
            LocalDateTime fimA,
            LocalDateTime inicioB,
            LocalDateTime fimB
    ) {
        if (inicioA == null || fimA == null || inicioB == null || fimB == null) {
            return false;
        }

        return inicioA.isBefore(fimB) && fimA.isAfter(inicioB);
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
