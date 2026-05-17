package com.psihub.api.shared.config;

import com.psihub.api.modules.agenda.entity.RegraDisponibilidade;
import com.psihub.api.modules.agenda.repository.RegraDisponibilidadeRepository;
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
import com.psihub.api.modules.vinculos.entity.StatusVinculo;
import com.psihub.api.modules.vinculos.entity.VinculoPsicologoPaciente;
import com.psihub.api.modules.vinculos.repository.VinculoPsicologoPacienteRepository;
import com.psihub.api.shared.enums.DiaSemana;
import com.psihub.api.shared.enums.StatusAcesso;
import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.enums.TipoAtendimento;
import com.psihub.api.shared.enums.TipoUsuario;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
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

    private final Environment environment;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioRepository usuarioRepository;
    private final PsicologoRepository psicologoRepository;
    private final PacienteRepository pacienteRepository;
    private final EspecialidadePsicologoRepository especialidadePsicologoRepository;
    private final RegraDisponibilidadeRepository regraDisponibilidadeRepository;
    private final ConsultaRepository consultaRepository;
    private final VinculoPsicologoPacienteRepository vinculoRepository;

    public MockDataSeeder(
            Environment environment,
            PasswordEncoder passwordEncoder,
            UsuarioRepository usuarioRepository,
            PsicologoRepository psicologoRepository,
            PacienteRepository pacienteRepository,
            EspecialidadePsicologoRepository especialidadePsicologoRepository,
            RegraDisponibilidadeRepository regraDisponibilidadeRepository,
            ConsultaRepository consultaRepository,
            VinculoPsicologoPacienteRepository vinculoRepository
    ) {
        this.environment = environment;
        this.passwordEncoder = passwordEncoder;
        this.usuarioRepository = usuarioRepository;
        this.psicologoRepository = psicologoRepository;
        this.pacienteRepository = pacienteRepository;
        this.especialidadePsicologoRepository = especialidadePsicologoRepository;
        this.regraDisponibilidadeRepository = regraDisponibilidadeRepository;
        this.consultaRepository = consultaRepository;
        this.vinculoRepository = vinculoRepository;
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
        createUser("Administrador PsiHub", "admin@psihub.com", TipoUsuario.ADMIN);

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

        createAcceptedLink(joao, ana);
        createAcceptedLink(maria, ana);
        createAcceptedLink(fernanda, carlos);
        createAcceptedLink(joao, carlos);

        createAvailability(
                ana,
                List.of(DiaSemana.SEGUNDA, DiaSemana.QUARTA, DiaSemana.SEXTA),
                LocalTime.of(9, 0),
                LocalTime.of(17, 0)
        );
        createAvailability(
                carlos,
                List.of(DiaSemana.TERCA, DiaSemana.QUINTA),
                LocalTime.of(10, 0),
                LocalTime.of(18, 0)
        );

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

    private void createAcceptedLink(Paciente patient, Psicologo psychologist) {
        VinculoPsicologoPaciente link = new VinculoPsicologoPaciente();
        link.setPaciente(patient);
        link.setPsicologo(psychologist);
        link.setStatus(StatusVinculo.ACEITO);
        link.setSolicitadoEm(LocalDateTime.now().minusDays(10));
        link.setRespondidoEm(LocalDateTime.now().minusDays(9));
        vinculoRepository.save(link);
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

    private Consulta createConsultation(
            Paciente patient,
            Psicologo psychologist,
            LocalDateTime start,
            TipoAtendimento serviceType,
            StatusConsulta status
    ) {
        Consulta consultation = new Consulta();
        consultation.setPaciente(patient);
        consultation.setPsicologo(psychologist);
        consultation.setInicioEm(start);
        consultation.setFimEm(start.plusMinutes(SLOT_DURATION_MINUTES));
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

    private boolean isProduction() {
        String nodeEnv = System.getenv("NODE_ENV");
        if ("production".equalsIgnoreCase(nodeEnv)) {
            return true;
        }

        return List.of(environment.getActiveProfiles()).stream()
                .anyMatch(profile -> "production".equalsIgnoreCase(profile) || "prod".equalsIgnoreCase(profile));
    }

}
