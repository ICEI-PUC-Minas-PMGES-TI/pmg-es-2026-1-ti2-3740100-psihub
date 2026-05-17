package com.psihub.api.shared.config;

import com.psihub.api.modules.agenda.entity.RegraDisponibilidade;
import com.psihub.api.modules.agenda.entity.SlotConsulta;
import com.psihub.api.modules.agenda.repository.RegraDisponibilidadeRepository;
import com.psihub.api.modules.agenda.repository.SlotConsultaRepository;
import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.auth.repository.UsuarioRepository;
import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.consultas.repository.ConsultaRepository;
import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.pacientes.repository.PacienteRepository;
import com.psihub.api.modules.psicologos.entity.EspecialidadePsicologo;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.modules.psicologos.repository.EspecialidadePsicologoRepository;
import com.psihub.api.modules.psicologos.repository.PsicologoRepository;
import com.psihub.api.shared.enums.DiaSemana;
import com.psihub.api.shared.enums.StatusAcesso;
import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.enums.StatusSlotConsulta;
import com.psihub.api.shared.enums.TipoAtendimento;
import com.psihub.api.shared.enums.TipoUsuario;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
// Seeder mantido em shared porque popula dados de multiplos modulos.
public class MockDataSeeder implements ApplicationRunner {

    private static final String SEED_PASSWORD = "senha123";
    private static final int SLOT_DURATION_MINUTES = 50;
    private static final int DAYS_TO_GENERATE = 30;

    private final Environment environment;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioRepository usuarioRepository;
    private final PsicologoRepository psicologoRepository;
    private final PacienteRepository pacienteRepository;
    private final EspecialidadePsicologoRepository especialidadePsicologoRepository;
    private final RegraDisponibilidadeRepository regraDisponibilidadeRepository;
    private final SlotConsultaRepository slotConsultaRepository;
    private final ConsultaRepository consultaRepository;

    public MockDataSeeder(
            Environment environment,
            PasswordEncoder passwordEncoder,
            UsuarioRepository usuarioRepository,
            PsicologoRepository psicologoRepository,
            PacienteRepository pacienteRepository,
            EspecialidadePsicologoRepository especialidadePsicologoRepository,
            RegraDisponibilidadeRepository regraDisponibilidadeRepository,
            SlotConsultaRepository slotConsultaRepository,
            ConsultaRepository consultaRepository
    ) {
        this.environment = environment;
        this.passwordEncoder = passwordEncoder;
        this.usuarioRepository = usuarioRepository;
        this.psicologoRepository = psicologoRepository;
        this.pacienteRepository = pacienteRepository;
        this.especialidadePsicologoRepository = especialidadePsicologoRepository;
        this.regraDisponibilidadeRepository = regraDisponibilidadeRepository;
        this.slotConsultaRepository = slotConsultaRepository;
        this.consultaRepository = consultaRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (isProduction()) {
            return;
        }

        try {
            if (usuarioRepository.count() > 0) {
                System.out.println("⏭️ [Seed] Banco já populado, seed ignorado.");
                return;
            }

            seed();
            System.out.println("✅ [Seed] Dados mockados inseridos com sucesso.");
        } catch (Exception exception) {
            System.err.println("❌ [Seed] Erro ao inserir dados: " + exception.getMessage());
            throw exception;
        }
    }

    private void seed() {
        Psicologo ana = createPsychologist(
                "Dra. Ana Silva",
                "ana@psihub.com",
                "CRP 06/123456",
                "Terapia Cognitivo-Comportamental",
                BigDecimal.valueOf(180)
        );
        Psicologo carlos = createPsychologist(
                "Dr. Carlos Mendes",
                "carlos@psihub.com",
                "CRP 06/654321",
                "Psicanálise",
                BigDecimal.valueOf(200)
        );

        Paciente joao = createPatient("João da Silva", "joao@email.com", LocalDate.of(1991, 5, 14));
        Paciente maria = createPatient("Maria Eduarda", "maria@email.com", LocalDate.of(1997, 9, 3));
        Paciente fernanda = createPatient("Fernanda Lima", "fernanda@email.com", LocalDate.of(1988, 2, 21));

        List<RegraDisponibilidade> anaRules = createAvailability(
                ana,
                List.of(DiaSemana.SEGUNDA, DiaSemana.QUARTA, DiaSemana.SEXTA),
                LocalTime.of(9, 0),
                LocalTime.of(17, 0)
        );
        List<RegraDisponibilidade> carlosRules = createAvailability(
                carlos,
                List.of(DiaSemana.TERCA, DiaSemana.QUINTA),
                LocalTime.of(10, 0),
                LocalTime.of(18, 0)
        );

        generateFutureAvailableSlots(ana, anaRules);
        generateFutureAvailableSlots(carlos, carlosRules);

        LocalDate today = LocalDate.now();
        createConsultation(joao, ana, today.plusDays(1).atTime(9, 0), TipoAtendimento.ONLINE, StatusConsulta.AGENDADA);
        createConsultation(maria, ana, today.plusDays(2).atTime(10, 30), TipoAtendimento.PRESENCIAL, StatusConsulta.AGENDADA);
        createConsultation(fernanda, carlos, today.plusDays(3).atTime(14, 0), TipoAtendimento.ONLINE, StatusConsulta.AGENDADA);
        createConsultation(joao, carlos, today.minusDays(7).atTime(9, 0), TipoAtendimento.PRESENCIAL, StatusConsulta.CONCLUIDA);
        createConsultation(maria, ana, today.minusDays(3).atTime(11, 0), TipoAtendimento.ONLINE, StatusConsulta.CONCLUIDA);
    }

    private Psicologo createPsychologist(
            String name,
            String email,
            String crp,
            String specialty,
            BigDecimal appointmentValue
    ) {
        Usuario user = createUser(name, email, TipoUsuario.PSICOLOGO);

        Psicologo psychologist = new Psicologo();
        psychologist.setUsuario(user);
        psychologist.setCrp(crp);
        psychologist.setBiografia("Atendimento clínico com foco em cuidado contínuo e acompanhamento individualizado.");
        psychologist.setValorConsulta(appointmentValue);
        psychologist.setStatusAcesso(StatusAcesso.ATIVO);
        Psicologo savedPsychologist = psicologoRepository.save(psychologist);

        EspecialidadePsicologo psychologistSpecialty = new EspecialidadePsicologo();
        psychologistSpecialty.setPsicologo(savedPsychologist);
        psychologistSpecialty.setNome(specialty);
        especialidadePsicologoRepository.save(psychologistSpecialty);

        return savedPsychologist;
    }

    private Paciente createPatient(String name, String email, LocalDate birthDate) {
        Usuario user = createUser(name, email, TipoUsuario.PACIENTE);

        Paciente patient = new Paciente();
        patient.setUsuario(user);
        patient.setDataNascimento(birthDate);
        patient.setObservacoesIniciais("Paciente cadastrado para dados de demonstração.");
        return pacienteRepository.save(patient);
    }

    private Usuario createUser(String name, String email, TipoUsuario userType) {
        Usuario user = new Usuario();
        user.setNome(name);
        user.setEmail(email);
        user.setSenhaHash(passwordEncoder.encode(SEED_PASSWORD));
        user.setTipoUsuario(userType);
        user.setAtivo(true);
        return usuarioRepository.save(user);
    }

    private List<RegraDisponibilidade> createAvailability(
            Psicologo psychologist,
            List<DiaSemana> weekDays,
            LocalTime startTime,
            LocalTime endTime
    ) {
        return weekDays.stream()
                .map(day -> {
                    RegraDisponibilidade rule = new RegraDisponibilidade();
                    rule.setPsicologo(psychologist);
                    rule.setDiaSemana(day);
                    rule.setValidoAPartirDe(LocalDate.now());
                    rule.setValidoAte(null);
                    rule.setHoraInicio(startTime);
                    rule.setHoraFim(endTime);
                    rule.setDuracaoSlotMinutos(SLOT_DURATION_MINUTES);
                    rule.setAtivo(true);
                    return regraDisponibilidadeRepository.save(rule);
                })
                .toList();
    }

    private void generateFutureAvailableSlots(Psicologo psychologist, List<RegraDisponibilidade> rules) {
        Map<DiaSemana, RegraDisponibilidade> rulesByDay = rules.stream()
                .collect(java.util.stream.Collectors.toMap(RegraDisponibilidade::getDiaSemana, rule -> rule));
        LocalDate today = LocalDate.now();

        for (int offset = 0; offset <= DAYS_TO_GENERATE; offset++) {
            LocalDate date = today.plusDays(offset);
            RegraDisponibilidade rule = rulesByDay.get(toDiaSemana(date.getDayOfWeek()));
            if (rule == null) {
                continue;
            }

            LocalTime cursor = rule.getHoraInicio();
            while (!cursor.plusMinutes(SLOT_DURATION_MINUTES).isAfter(rule.getHoraFim())) {
                LocalDateTime start = date.atTime(cursor);
                LocalDateTime end = start.plusMinutes(SLOT_DURATION_MINUTES);

                if (start.isAfter(LocalDateTime.now())) {
                    createSlot(psychologist, rule, start, end, StatusSlotConsulta.DISPONIVEL);
                }

                cursor = cursor.plusMinutes(SLOT_DURATION_MINUTES);
            }
        }
    }

    private Consulta createConsultation(
            Paciente patient,
            Psicologo psychologist,
            LocalDateTime start,
            TipoAtendimento serviceType,
            StatusConsulta status
    ) {
        SlotConsulta slot = createSlot(
                psychologist,
                null,
                start,
                start.plusMinutes(SLOT_DURATION_MINUTES),
                StatusSlotConsulta.RESERVADO
        );

        Consulta consultation = new Consulta();
        consultation.setPaciente(patient);
        consultation.setPsicologo(psychologist);
        consultation.setSlotConsulta(slot);
        consultation.setAgendadoPorUsuario(patient.getUsuario());
        consultation.setTipoAtendimento(serviceType);
        consultation.setStatus(status);
        consultation.setObservacoes("Consulta criada automaticamente para demonstração.");

        if (status == StatusConsulta.CONCLUIDA) {
            consultation.setIniciadoEm(start);
            consultation.setFinalizadoEm(start.plusMinutes(SLOT_DURATION_MINUTES));
        }

        return consultaRepository.save(consultation);
    }

    private SlotConsulta createSlot(
            Psicologo psychologist,
            RegraDisponibilidade rule,
            LocalDateTime start,
            LocalDateTime end,
            StatusSlotConsulta status
    ) {
        return slotConsultaRepository.findByPsicologoIdAndInicioEmAndFimEm(psychologist.getId(), start, end)
                .map(existingSlot -> {
                    if (status == StatusSlotConsulta.RESERVADO) {
                        existingSlot.setStatus(StatusSlotConsulta.RESERVADO);
                    }
                    if (existingSlot.getRegraDisponibilidade() == null && rule != null) {
                        existingSlot.setRegraDisponibilidade(rule);
                    }
                    return existingSlot;
                })
                .orElseGet(() -> createNewSlot(psychologist, rule, start, end, status));
    }

    private SlotConsulta createNewSlot(
            Psicologo psychologist,
            RegraDisponibilidade rule,
            LocalDateTime start,
            LocalDateTime end,
            StatusSlotConsulta status
    ) {
        SlotConsulta slot = new SlotConsulta();
        slot.setPsicologo(psychologist);
        slot.setRegraDisponibilidade(rule);
        slot.setInicioEm(start);
        slot.setFimEm(end);
        slot.setStatus(status);
        return slotConsultaRepository.save(slot);
    }

    private boolean isProduction() {
        String nodeEnv = System.getenv("NODE_ENV");
        if ("production".equalsIgnoreCase(nodeEnv)) {
            return true;
        }

        return List.of(environment.getActiveProfiles()).stream()
                .anyMatch(profile -> "production".equalsIgnoreCase(profile) || "prod".equalsIgnoreCase(profile));
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

