package psihub.services;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import psihub.domain.enums.DiaSemana;
import psihub.domain.enums.StatusConsulta;
import psihub.domain.enums.StatusAcesso;
import psihub.domain.enums.StatusSlotConsulta;
import psihub.domain.enums.StatusVinculo;
import psihub.domain.model.Consulta;
import psihub.domain.model.Psicologo;
import psihub.domain.model.RegraDisponibilidade;
import psihub.domain.model.SlotConsulta;
import psihub.dtos.agenda.BloquearSlotRequest;
import psihub.dtos.agenda.CriarSlotManualRequest;
import psihub.dtos.agenda.DefinirDisponibilidadeRequest;
import psihub.dtos.agenda.DisponibilidadeResponse;
import psihub.dtos.agenda.PacienteResumoResponse;
import psihub.dtos.agenda.RegraDisponibilidadeResponse;
import psihub.dtos.agenda.SlotConsultaResponse;
import psihub.exceptions.ApiException;
import psihub.mappers.ApiResponseMapper;
import psihub.repositories.ConsultaRepository;
import psihub.repositories.PacienteRepository;
import psihub.repositories.PsicologoRepository;
import psihub.repositories.RegraDisponibilidadeRepository;
import psihub.repositories.SlotConsultaRepository;

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
     * check handles identical slots separately). Only an already-booked (RESERVADO) or
     * explicitly blocked (BLOQUEADO) slot constitutes a real conflict.
     */
    private static final Collection<StatusSlotConsulta> STATUSES_CONFLITO_SLOT_MANUAL = EnumSet.of(
            StatusSlotConsulta.RESERVADO,
            StatusSlotConsulta.BLOQUEADO
    );

    private final PsicologoRepository psicologoRepository;
    private final RegraDisponibilidadeRepository regraDisponibilidadeRepository;
    private final SlotConsultaRepository slotConsultaRepository;
    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final ApiResponseMapper mapper;

    public AgendaService(
            PsicologoRepository psicologoRepository,
            RegraDisponibilidadeRepository regraDisponibilidadeRepository,
            SlotConsultaRepository slotConsultaRepository,
            ConsultaRepository consultaRepository,
            PacienteRepository pacienteRepository,
            ApiResponseMapper mapper
    ) {
        this.psicologoRepository = psicologoRepository;
        this.regraDisponibilidadeRepository = regraDisponibilidadeRepository;
        this.slotConsultaRepository = slotConsultaRepository;
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
        this.mapper = mapper;
    }

    @Transactional
    public DisponibilidadeResponse definirDisponibilidade(Long psicologoId, DefinirDisponibilidadeRequest request) {
        Psicologo psicologo = buscarPsicologoAtivo(psicologoId);
        validarPeriodo(request.horaInicio(), request.horaFim());
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
        return regraDisponibilidadeRepository.findByPsicologoIdOrderByDiaSemanaAscHoraInicioAsc(psicologoId)
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

        Map<Long, Consulta> consultasPorSlot = consultaRepository.findByFiltros(
                null,
                psicologoId,
                null,
                inicioFiltro,
                fimFiltro
            )
            .stream()
            .filter(consulta -> consulta.getStatus() != StatusConsulta.CANCELADA)
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
        String filtroNome = (nome == null || nome.isBlank()) ? null : nome.trim();
        return pacienteRepository.findByPsicologoIdAndVinculo(psicologoId, StatusVinculo.ACEITO, filtroNome)
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

        // Exact-duplicate check: ignore CANCELADO slots so a previously cancelled slot
        // at the same time does not prevent re-creation of the slot.
        if (slotConsultaRepository.existsByPsicologoIdAndInicioEmAndFimEmAndStatusNot(
                psicologoId, inicio, fim, StatusSlotConsulta.CANCELADO)) {
            throw new ApiException(HttpStatus.CONFLICT, "Ja existe um horario cadastrado para este periodo");
        }

        // Overlap check: only RESERVADO and BLOQUEADO slots constitute a real conflict.
        // An existing DISPONIVEL slot at the same time is NOT a conflict — the exact-duplicate
        // check above already handles identical slots, and partially-overlapping available
        // slots must not block manual creation (e.g. blocking a time that has an auto-generated
        // available slot).
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
        return psicologoRepository.findById(psicologoId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Psicologo nao encontrado"));
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
