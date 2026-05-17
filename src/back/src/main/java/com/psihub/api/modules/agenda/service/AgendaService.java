package com.psihub.api.modules.agenda.service;

import com.psihub.api.modules.agenda.dto.BloquearSlotRequest;
import com.psihub.api.modules.agenda.dto.CriarSlotManualRequest;
import com.psihub.api.modules.agenda.dto.DefinirDisponibilidadeRequest;
import com.psihub.api.modules.agenda.dto.DisponibilidadeResponse;
import com.psihub.api.modules.agenda.dto.PacienteResumoResponse;
import com.psihub.api.modules.agenda.dto.RegraDisponibilidadeResponse;
import com.psihub.api.modules.agenda.dto.SlotConsultaResponse;
import com.psihub.api.modules.agenda.entity.RegraDisponibilidade;
import com.psihub.api.modules.agenda.entity.SlotConsulta;
import com.psihub.api.modules.agenda.repository.RegraDisponibilidadeRepository;
import com.psihub.api.modules.agenda.repository.SlotConsultaRepository;
import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.consultas.service.ConsultaService;
import com.psihub.api.modules.pacientes.service.PacienteService;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.modules.psicologos.service.PsicologoService;
import com.psihub.api.shared.enums.DiaSemana;
import com.psihub.api.shared.enums.StatusAcesso;
import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.enums.StatusSlotConsulta;
import com.psihub.api.shared.exception.ApiException;
import com.psihub.api.shared.utils.ApiResponseMapper;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.function.Function;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgendaService {

    private static final Logger log = LoggerFactory.getLogger(AgendaService.class);

    private static final int DURACAO_PADRAO_MINUTOS = 50;
    private static final int DIAS_GERACAO_PADRAO = 30;

    /**
     * Statuses used when auto-generating slots from availability rules.
     * DISPONIVEL is included to avoid creating duplicate available slots.
     */
    private static final Collection<StatusSlotConsulta> STATUSES_COM_CONFLITO = EnumSet.of(
            StatusSlotConsulta.DISPONIVEL,
            StatusSlotConsulta.RESERVADO,
            StatusSlotConsulta.BLOQUEADO
    );

    /**
     * Statuses used when validating a manually created slot.
     * DISPONIVEL is intentionally excluded: an existing available slot must not block
     * the creation of a manual slot at the same or overlapping time (the exact-duplicate
     * check handles identical slots separately). Booked intervals are validated through
     * active consultations, so only explicitly blocked slots constitute a slot-level conflict.
     */
    private static final Collection<StatusSlotConsulta> STATUSES_CONFLITO_SLOT_MANUAL = EnumSet.of(
            StatusSlotConsulta.BLOQUEADO
    );

    private static final Collection<StatusConsulta> STATUS_CONSULTA_BLOQUEANTES = EnumSet.of(
            StatusConsulta.AGENDADA,
            StatusConsulta.CONFIRMADA,
            StatusConsulta.EM_ANDAMENTO
    );

    private static final Collection<StatusConsulta> STATUS_CONSULTA_SEM_CONFLITO = EnumSet.of(
            StatusConsulta.CANCELADA,
            StatusConsulta.CONCLUIDA,
            StatusConsulta.FALTOU
    );

    private final PsicologoService psicologoService;
    private final RegraDisponibilidadeRepository regraDisponibilidadeRepository;
    private final SlotConsultaRepository slotConsultaRepository;
    private final ConsultaService consultaService;
    private final PacienteService pacienteService;
    private final ApiResponseMapper mapper;

    public AgendaService(
            PsicologoService psicologoService,
            RegraDisponibilidadeRepository regraDisponibilidadeRepository,
            SlotConsultaRepository slotConsultaRepository,
            ConsultaService consultaService,
            PacienteService pacienteService,
            ApiResponseMapper mapper
    ) {
        this.psicologoService = psicologoService;
        this.regraDisponibilidadeRepository = regraDisponibilidadeRepository;
        this.slotConsultaRepository = slotConsultaRepository;
        this.consultaService = consultaService;
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
        LocalDate gerarInicio = maiorData(request.validoAPartirDe(), LocalDate.now());
        LocalDate gerarFim = definirFimGeracao(request);

        List<RegraDisponibilidade> regras = request.diasSemana()
                .stream()
                .sorted(Comparator.comparing(DiaSemana::name))
                .map(dia -> criarRegra(psicologo, dia, request, duracao))
                .map(regraDisponibilidadeRepository::save)
                .toList();

        List<SlotConsulta> slotsCriados = gerarFim.isBefore(gerarInicio)
                ? List.of()
                : regras.stream()
                        .flatMap(regra -> gerarSlots(regra, gerarInicio, gerarFim).stream())
                        .toList();

        return new DisponibilidadeResponse(
                regras.stream().map(mapper::toResponse).toList(),
                slotsCriados.stream().map(mapper::toResponse).toList()
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
    public List<SlotConsultaResponse> listarMeusSlots(
            Long psicologoId,
            LocalDateTime inicio,
            LocalDateTime fim,
            StatusSlotConsulta status
    ) {
        buscarPsicologo(psicologoId);
        LocalDateTime inicioFiltro = inicio == null ? LocalDate.now().atStartOfDay() : inicio;
        LocalDateTime fimFiltro = fim == null ? inicioFiltro.plusDays(30) : fim;
        validarIntervaloDataHora(inicioFiltro, fimFiltro);

        Map<Long, Consulta> consultasPorSlot = consultaService.buscarConsultasPorPsicologoEPeriodo(
                psicologoId,
                STATUS_CONSULTA_BLOQUEANTES,
                inicioFiltro,
                fimFiltro
            )
            .stream()
            .collect(Collectors.toMap(
                consulta -> consulta.getSlotConsulta().getId(),
                Function.identity(),
                (first, second) -> second.getId() > first.getId() ? second : first
            ));

        return slotConsultaRepository.findAgenda(psicologoId, inicioFiltro, fimFiltro, status)
                .stream()
                .map(slot -> mapper.toResponse(slot, consultasPorSlot.get(slot.getId())))
                .toList();
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

    @Transactional
    public SlotConsultaResponse criarSlotManual(Long psicologoId, CriarSlotManualRequest request) {
        Psicologo psicologo = buscarPsicologoAtivo(psicologoId);
        validarPeriodo(request.horaInicio(), request.horaFim());

        LocalDateTime inicio = request.data().atTime(request.horaInicio());
        LocalDateTime fim = request.data().atTime(request.horaFim());

        if (inicio.isBefore(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nao e permitido criar horario em data passada");
        }

        validarSemConflitoComPausa(psicologoId, request.data(), request.horaInicio(), request.horaFim());

        SlotConsulta slotExistente = slotConsultaRepository
                .findByPsicologoIdAndInicioEmAndFimEm(psicologoId, inicio, fim)
                .orElse(null);
        if (slotExistente != null && slotExistente.getStatus() == StatusSlotConsulta.DISPONIVEL) {
            return mapper.toResponse(slotExistente);
        }

        // Slot-level conflicts cover explicit blocks. Booked intervals are checked against
        // active consultations below so cancelled, concluded and missed consultations are ignored.
        List<SlotConsulta> conflitantes = slotConsultaRepository.findOverlapping(
                psicologoId, inicio, fim, STATUSES_CONFLITO_SLOT_MANUAL);
        if (!conflitantes.isEmpty()) {
            log.warn(
                    "[AgendaService] Conflito detectado ao criar slot manual para psicologo {}. "
                    + "Novo intervalo: {} - {}. Slots conflitantes: {}",
                    psicologoId,
                    inicio,
                    fim,
                    conflitantes.stream()
                            .map(s -> String.format("id=%d inicio=%s fim=%s status=%s",
                                    s.getId(), s.getInicioEm(), s.getFimEm(), s.getStatus()))
                            .collect(Collectors.joining("; ")));
            throw new ApiException(HttpStatus.CONFLICT, "O horario informado conflita com outro horario da agenda");
        }

        if (consultaService.existeConflitoDeHorario(psicologoId, inicio, fim, STATUS_CONSULTA_SEM_CONFLITO)) {
            throw new ApiException(HttpStatus.CONFLICT, "O horario informado conflita com uma consulta ativa");
        }

        SlotConsulta slot = new SlotConsulta();
        slot.setPsicologo(psicologo);
        slot.setInicioEm(inicio);
        slot.setFimEm(fim);
        slot.setStatus(StatusSlotConsulta.DISPONIVEL);

        return mapper.toResponse(slotConsultaRepository.save(slot));
    }

    @Transactional(readOnly = true)
    public List<SlotConsultaResponse> listarSlots(
            Long psicologoId,
            LocalDateTime inicio,
            LocalDateTime fim,
            StatusSlotConsulta status
    ) {
        buscarPsicologo(psicologoId);
        LocalDateTime inicioFiltro = inicio == null ? LocalDate.now().atStartOfDay() : inicio;
        LocalDateTime fimFiltro = fim == null ? inicioFiltro.plusDays(30) : fim;
        validarIntervaloDataHora(inicioFiltro, fimFiltro);

        return slotConsultaRepository.findAgenda(psicologoId, inicioFiltro, fimFiltro, status)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SlotConsultaResponse> listarSlotsDisponiveis(Long psicologoId, LocalDate data) {
        LocalDate dataFiltro = data == null ? LocalDate.now() : data;
        return listarSlots(
                psicologoId,
                dataFiltro.atStartOfDay(),
                dataFiltro.plusDays(1).atStartOfDay(),
                StatusSlotConsulta.DISPONIVEL
        );
    }

    @Transactional
    public SlotConsultaResponse bloquearSlot(Long psicologoId, Long slotId, BloquearSlotRequest request) {
        buscarPsicologoAtivo(psicologoId);
        SlotConsulta slot = buscarSlotDoPsicologo(slotId, psicologoId);

        if (slot.getStatus() == StatusSlotConsulta.RESERVADO) {
            throw new ApiException(HttpStatus.CONFLICT, "Nao e possivel bloquear um horario reservado");
        }

        if (slot.getStatus() == StatusSlotConsulta.CANCELADO) {
            throw new ApiException(HttpStatus.CONFLICT, "Nao e possivel bloquear um horario cancelado");
        }

        slot.setStatus(StatusSlotConsulta.BLOQUEADO);
        return mapper.toResponse(slot);
    }

    @Transactional
    public SlotConsultaResponse cancelarSlot(Long psicologoId, Long slotId) {
        buscarPsicologoAtivo(psicologoId);
        SlotConsulta slot = buscarSlotDoPsicologo(slotId, psicologoId);

        if (slot.getStatus() == StatusSlotConsulta.RESERVADO) {
            throw new ApiException(HttpStatus.CONFLICT, "Nao e possivel remover um horario com consulta agendada");
        }

        slot.setAtivo(false);
        slot.setStatus(StatusSlotConsulta.CANCELADO);
        return mapper.toResponse(slot);
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

    private List<SlotConsulta> gerarSlots(RegraDisponibilidade regra, LocalDate gerarInicio, LocalDate gerarFim) {
        return gerarInicio.datesUntil(gerarFim.plusDays(1))
                .filter(data -> toDiaSemana(data.getDayOfWeek()) == regra.getDiaSemana())
                .flatMap(data -> gerarSlotsDaData(regra, data).stream())
                .toList();
    }

    private List<SlotConsulta> gerarSlotsDaData(RegraDisponibilidade regra, LocalDate data) {
        LocalDateTime agora = LocalDateTime.now();
        LocalTime cursor = regra.getHoraInicio();
        List<SlotConsulta> slots = new java.util.ArrayList<>();

        while (!cursor.plusMinutes(regra.getDuracaoSlotMinutos()).isAfter(regra.getHoraFim())) {
            LocalDateTime inicio = data.atTime(cursor);
            LocalDateTime fim = inicio.plusMinutes(regra.getDuracaoSlotMinutos());

            if (!inicio.isBefore(agora)
                    && !sobrepoePausa(cursor, cursor.plusMinutes(regra.getDuracaoSlotMinutos()), regra)
                    && !slotConsultaRepository.existsByPsicologoIdAndInicioEmAndFimEm(regra.getPsicologo().getId(), inicio, fim)
                    && !slotConsultaRepository.existsOverlap(regra.getPsicologo().getId(), inicio, fim, STATUSES_COM_CONFLITO)) {
                SlotConsulta slot = new SlotConsulta();
                slot.setPsicologo(regra.getPsicologo());
                slot.setRegraDisponibilidade(regra);
                slot.setInicioEm(inicio);
                slot.setFimEm(fim);
                slot.setStatus(StatusSlotConsulta.DISPONIVEL);
                slots.add(slotConsultaRepository.save(slot));
            }

            cursor = cursor.plusMinutes(regra.getDuracaoSlotMinutos());
        }

        return slots;
    }

    private Psicologo buscarPsicologo(Long psicologoId) {
        return psicologoService.buscarPorId(psicologoId);
    }

    private Psicologo buscarPsicologoAtivo(Long psicologoId) {
        Psicologo psicologo = buscarPsicologo(psicologoId);
        if (psicologo.getStatusAcesso() != StatusAcesso.ATIVO) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Psicologo ainda nao possui acesso ativo");
        }
        return psicologo;
    }

    private SlotConsulta buscarSlotDoPsicologo(Long slotId, Long psicologoId) {
        SlotConsulta slot = slotConsultaRepository.findByIdForUpdate(slotId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Horario nao encontrado"));

        if (!slot.getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Horario nao pertence ao psicologo informado");
        }

        return slot;
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
        return !regra.getValidoAPartirDe().isAfter(data)
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
        if (!fim.isAfter(inicio)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Fim do periodo deve ser posterior ao inicio");
        }
    }

    private LocalDate definirFimGeracao(DefinirDisponibilidadeRequest request) {
        LocalDate limite = request.gerarAte();
        if (limite == null) {
            limite = request.validoAte() == null
                    ? request.validoAPartirDe().plusDays(DIAS_GERACAO_PADRAO)
                    : request.validoAte();
        }

        if (request.validoAte() != null && limite.isAfter(request.validoAte())) {
            limite = request.validoAte();
        }

        if (limite.isBefore(request.validoAPartirDe())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Data limite de geracao deve respeitar a vigencia");
        }

        return limite;
    }

    private LocalDate maiorData(LocalDate primeira, LocalDate segunda) {
        return primeira.isAfter(segunda) ? primeira : segunda;
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

