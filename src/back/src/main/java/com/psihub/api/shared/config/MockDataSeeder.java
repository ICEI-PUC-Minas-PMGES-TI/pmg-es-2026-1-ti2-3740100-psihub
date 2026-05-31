package com.psihub.api.shared.config;

import com.psihub.api.modules.agenda.entity.RegraDisponibilidade;
import com.psihub.api.modules.agenda.repository.RegraDisponibilidadeRepository;
import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.auth.repository.UsuarioRepository;
import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.consultas.repository.ConsultaRepository;
import com.psihub.api.modules.financeiro.entity.FormaPagamento;
import com.psihub.api.modules.financeiro.entity.Pagamento;
import com.psihub.api.modules.financeiro.entity.StatusPagamento;
import com.psihub.api.modules.financeiro.repository.PagamentoRepository;
import com.psihub.api.modules.pacientes.entity.Paciente;
import com.psihub.api.modules.pacientes.repository.PacienteRepository;
import com.psihub.api.modules.psicologos.entity.EspecialidadePsicologo;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.modules.psicologos.repository.EspecialidadePsicologoRepository;
import com.psihub.api.modules.psicologos.repository.PsicologoRepository;
import com.psihub.api.modules.registros.entity.RegistroEmocional;
import com.psihub.api.modules.registros.repository.RegistroEmocionalRepository;
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
    private final PagamentoRepository pagamentoRepository;
    private final RegistroEmocionalRepository registroEmocionalRepository;

    public MockDataSeeder(
            Environment environment,
            PasswordEncoder passwordEncoder,
            UsuarioRepository usuarioRepository,
            PsicologoRepository psicologoRepository,
            PacienteRepository pacienteRepository,
            EspecialidadePsicologoRepository especialidadePsicologoRepository,
            RegraDisponibilidadeRepository regraDisponibilidadeRepository,
            ConsultaRepository consultaRepository,
            VinculoPsicologoPacienteRepository vinculoRepository,
            PagamentoRepository pagamentoRepository,
            RegistroEmocionalRepository registroEmocionalRepository
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
        this.pagamentoRepository = pagamentoRepository;
        this.registroEmocionalRepository = registroEmocionalRepository;
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

        // --- Psicólogos ---
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
        Psicologo beatriz = createPsychologist(
                "Dra. Beatriz Santos",
                "beatriz@psihub.com",
                "CRP 06/987654",
                "Psicoterapia Humanista",
                BigDecimal.valueOf(160)
        );
        Psicologo rafael = createPsychologist(
                "Dr. Rafael Oliveira",
                "rafael.psi@psihub.com",
                "CRP 06/112233",
                "Neuropsicologia",
                BigDecimal.valueOf(220)
        );
        Psicologo camila = createPsychologist(
                "Dra. Camila Ferreira",
                "camila@psihub.com",
                "CRP 06/445566",
                "Terapia de Família e Casal",
                BigDecimal.valueOf(190)
        );

        // --- Pacientes ---
        Paciente joao      = createPatient("João da Silva",     "joao@email.com",     LocalDate.of(1991, 5, 14));
        Paciente maria     = createPatient("Maria Eduarda",     "maria@email.com",    LocalDate.of(1997, 9,  3));
        Paciente fernanda  = createPatient("Fernanda Lima",     "fernanda@email.com", LocalDate.of(1988, 2, 21));
        Paciente pedro     = createPatient("Pedro Henrique",    "pedro@email.com",    LocalDate.of(1993, 7, 30));
        Paciente luciana   = createPatient("Luciana Pereira",   "luciana@email.com",  LocalDate.of(1995, 11, 5));
        Paciente rafaelPac = createPatient("Rafael Souza",      "rafaels@email.com",  LocalDate.of(1990, 3, 18));
        Paciente isabela   = createPatient("Isabela Martins",   "isabela@email.com",  LocalDate.of(2000, 6, 22));
        Paciente gustavo   = createPatient("Gustavo Ramos",     "gustavo@email.com",  LocalDate.of(1985, 12, 9));

        // --- Vínculos aceitos ---
        createLink(joao,     ana,     StatusVinculo.ACEITO,     30);
        createLink(maria,    ana,     StatusVinculo.ACEITO,     25);
        createLink(fernanda, carlos,  StatusVinculo.ACEITO,     20);
        createLink(joao,     carlos,  StatusVinculo.ACEITO,     15);
        createLink(pedro,    beatriz, StatusVinculo.ACEITO,     22);
        createLink(luciana,  beatriz, StatusVinculo.ACEITO,     18);
        createLink(rafaelPac, rafael, StatusVinculo.ACEITO,     28);
        createLink(isabela,  camila,  StatusVinculo.ACEITO,     16);
        createLink(gustavo,  camila,  StatusVinculo.ACEITO,     12);
        createLink(gustavo,  ana,     StatusVinculo.ACEITO,     10);
        createLink(isabela,  carlos,  StatusVinculo.ACEITO,     9);

        // --- Vínculos pendentes (para testar solicitações) ---
        createLink(pedro,    ana,     StatusVinculo.SOLICITADO, 2);
        createLink(maria,    rafael,  StatusVinculo.SOLICITADO, 1);

        // --- Vínculos recusados (para testar histórico) ---
        createLink(fernanda, beatriz, StatusVinculo.RECUSADO,   14);

        // --- Disponibilidades ---
        createAvailability(ana,     List.of(DiaSemana.SEGUNDA, DiaSemana.QUARTA, DiaSemana.SEXTA),                              LocalTime.of(9,  0), LocalTime.of(17, 0));
        createAvailability(carlos,  List.of(DiaSemana.TERCA, DiaSemana.QUINTA),                                                 LocalTime.of(10, 0), LocalTime.of(18, 0));
        createAvailability(beatriz, List.of(DiaSemana.SEGUNDA, DiaSemana.TERCA, DiaSemana.QUINTA, DiaSemana.SEXTA),             LocalTime.of(8,  0), LocalTime.of(16, 0));
        createAvailability(rafael,  List.of(DiaSemana.QUARTA, DiaSemana.SEXTA),                                                 LocalTime.of(13, 0), LocalTime.of(20, 0));
        createAvailability(camila,  List.of(DiaSemana.SEGUNDA, DiaSemana.TERCA, DiaSemana.QUARTA, DiaSemana.QUINTA, DiaSemana.SEXTA), LocalTime.of(9, 0), LocalTime.of(13, 0));

        LocalDate today = LocalDate.now();

        // --- Consultas concluídas (passado) ---
        Consulta c1  = createConsultation(joao,     ana,     today.minusDays(30).atTime(9,  0),  TipoAtendimento.PRESENCIAL, StatusConsulta.CONCLUIDA);
        Consulta c2  = createConsultation(joao,     ana,     today.minusDays(16).atTime(9,  0),  TipoAtendimento.ONLINE,     StatusConsulta.CONCLUIDA);
        Consulta c3  = createConsultation(joao,     ana,     today.minusDays(7).atTime(9,   0),  TipoAtendimento.ONLINE,     StatusConsulta.CONCLUIDA);
        Consulta c4  = createConsultation(maria,    ana,     today.minusDays(21).atTime(10, 30), TipoAtendimento.PRESENCIAL, StatusConsulta.CONCLUIDA);
        Consulta c5  = createConsultation(maria,    ana,     today.minusDays(10).atTime(10, 30), TipoAtendimento.ONLINE,     StatusConsulta.CONCLUIDA);
        Consulta c6  = createConsultation(maria,    ana,     today.minusDays(3).atTime(11,  0),  TipoAtendimento.ONLINE,     StatusConsulta.CONCLUIDA);
        Consulta c7  = createConsultation(fernanda, carlos,  today.minusDays(28).atTime(14, 0),  TipoAtendimento.PRESENCIAL, StatusConsulta.CONCLUIDA);
        Consulta c8  = createConsultation(fernanda, carlos,  today.minusDays(14).atTime(14, 0),  TipoAtendimento.ONLINE,     StatusConsulta.CONCLUIDA);
        Consulta c9  = createConsultation(joao,     carlos,  today.minusDays(7).atTime(11,  0),  TipoAtendimento.PRESENCIAL, StatusConsulta.CONCLUIDA);
        Consulta c10 = createConsultation(pedro,    beatriz, today.minusDays(21).atTime(8,  0),  TipoAtendimento.PRESENCIAL, StatusConsulta.CONCLUIDA);
        Consulta c11 = createConsultation(pedro,    beatriz, today.minusDays(7).atTime(8,   0),  TipoAtendimento.ONLINE,     StatusConsulta.CONCLUIDA);
        Consulta c12 = createConsultation(luciana,  beatriz, today.minusDays(14).atTime(9,  0),  TipoAtendimento.PRESENCIAL, StatusConsulta.CONCLUIDA);
        Consulta c13 = createConsultation(luciana,  beatriz, today.minusDays(5).atTime(9,   0),  TipoAtendimento.ONLINE,     StatusConsulta.CONCLUIDA);
        Consulta c14 = createConsultation(rafaelPac, rafael, today.minusDays(20).atTime(14, 0),  TipoAtendimento.ONLINE,     StatusConsulta.CONCLUIDA);
        Consulta c15 = createConsultation(rafaelPac, rafael, today.minusDays(6).atTime(14,  0),  TipoAtendimento.PRESENCIAL, StatusConsulta.CONCLUIDA);
        Consulta c16 = createConsultation(isabela,  camila,  today.minusDays(15).atTime(9,  0),  TipoAtendimento.PRESENCIAL, StatusConsulta.CONCLUIDA);
        Consulta c17 = createConsultation(isabela,  carlos,  today.minusDays(8).atTime(11,  0),  TipoAtendimento.ONLINE,     StatusConsulta.CONCLUIDA);
        Consulta c18 = createConsultation(gustavo,  camila,  today.minusDays(10).atTime(10, 0),  TipoAtendimento.PRESENCIAL, StatusConsulta.CONCLUIDA);
        Consulta c19 = createConsultation(gustavo,  ana,     today.minusDays(5).atTime(15,  0),  TipoAtendimento.ONLINE,     StatusConsulta.CONCLUIDA);

        // --- Consultas canceladas (passado) ---
        createConsultation(maria,    ana,     today.minusDays(17).atTime(11, 0),  TipoAtendimento.ONLINE,     StatusConsulta.CANCELADA);
        createConsultation(fernanda, carlos,  today.minusDays(6).atTime(14,  0),  TipoAtendimento.PRESENCIAL, StatusConsulta.CANCELADA);
        createConsultation(pedro,    beatriz, today.minusDays(3).atTime(8,   0),  TipoAtendimento.ONLINE,     StatusConsulta.CANCELADA);

        // --- Consultas com falta (passado) ---
        createConsultation(pedro,    beatriz, today.minusDays(14).atTime(8,  0),  TipoAtendimento.PRESENCIAL, StatusConsulta.FALTOU);
        createConsultation(luciana,  beatriz, today.minusDays(7).atTime(9,   0),  TipoAtendimento.ONLINE,     StatusConsulta.FALTOU);
        createConsultation(isabela,  camila,  today.minusDays(4).atTime(9,   0),  TipoAtendimento.PRESENCIAL, StatusConsulta.FALTOU);

        // --- Consultas agendadas (futuro) ---
        createConsultation(joao,     ana,     today.plusDays(1).atTime(9,   0),   TipoAtendimento.ONLINE,     StatusConsulta.AGENDADA);
        createConsultation(joao,     ana,     today.plusDays(8).atTime(9,   0),   TipoAtendimento.PRESENCIAL, StatusConsulta.AGENDADA);
        createConsultation(joao,     ana,     today.plusDays(15).atTime(9,  0),   TipoAtendimento.ONLINE,     StatusConsulta.AGENDADA);
        createConsultation(maria,    ana,     today.plusDays(2).atTime(10, 30),   TipoAtendimento.PRESENCIAL, StatusConsulta.AGENDADA);
        createConsultation(maria,    ana,     today.plusDays(9).atTime(10, 30),   TipoAtendimento.ONLINE,     StatusConsulta.AGENDADA);
        createConsultation(fernanda, carlos,  today.plusDays(3).atTime(14,  0),   TipoAtendimento.ONLINE,     StatusConsulta.AGENDADA);
        createConsultation(fernanda, carlos,  today.plusDays(10).atTime(14, 0),   TipoAtendimento.PRESENCIAL, StatusConsulta.AGENDADA);
        createConsultation(pedro,    beatriz, today.plusDays(4).atTime(8,   0),   TipoAtendimento.PRESENCIAL, StatusConsulta.AGENDADA);
        createConsultation(pedro,    beatriz, today.plusDays(11).atTime(8,  0),   TipoAtendimento.ONLINE,     StatusConsulta.AGENDADA);
        createConsultation(luciana,  beatriz, today.plusDays(5).atTime(9,   0),   TipoAtendimento.PRESENCIAL, StatusConsulta.AGENDADA);
        createConsultation(luciana,  beatriz, today.plusDays(12).atTime(9,  0),   TipoAtendimento.ONLINE,     StatusConsulta.AGENDADA);
        createConsultation(rafaelPac, rafael, today.plusDays(3).atTime(14,  0),   TipoAtendimento.ONLINE,     StatusConsulta.AGENDADA);
        createConsultation(rafaelPac, rafael, today.plusDays(10).atTime(14, 0),   TipoAtendimento.PRESENCIAL, StatusConsulta.AGENDADA);
        createConsultation(isabela,  camila,  today.plusDays(1).atTime(9,   0),   TipoAtendimento.ONLINE,     StatusConsulta.AGENDADA);
        createConsultation(isabela,  carlos,  today.plusDays(4).atTime(11,  0),   TipoAtendimento.PRESENCIAL, StatusConsulta.AGENDADA);
        createConsultation(gustavo,  camila,  today.plusDays(2).atTime(10,  0),   TipoAtendimento.PRESENCIAL, StatusConsulta.AGENDADA);
        createConsultation(gustavo,  ana,     today.plusDays(7).atTime(15,  0),   TipoAtendimento.ONLINE,     StatusConsulta.AGENDADA);

        // --- Consultas confirmadas (futuro próximo) ---
        createConsultation(joao,     ana,     today.plusDays(2).atTime(10, 0),    TipoAtendimento.PRESENCIAL, StatusConsulta.CONFIRMADA);
        createConsultation(pedro,    beatriz, today.plusDays(2).atTime(13, 0),    TipoAtendimento.ONLINE,     StatusConsulta.CONFIRMADA);
        createConsultation(gustavo,  camila,  today.plusDays(1).atTime(11, 0),    TipoAtendimento.PRESENCIAL, StatusConsulta.CONFIRMADA);

        // --- Pagamentos das consultas concluídas ---
        createPayment(c1,  ana.getValorConsulta(),  FormaPagamento.PIX,      StatusPagamento.PAGO,     today.minusDays(30).atTime(10, 0));
        createPayment(c2,  ana.getValorConsulta(),  FormaPagamento.CARTAO,   StatusPagamento.PAGO,     today.minusDays(16).atTime(10, 0));
        createPayment(c3,  ana.getValorConsulta(),  FormaPagamento.PIX,      StatusPagamento.PENDENTE, null);
        createPayment(c4,  ana.getValorConsulta(),  FormaPagamento.DINHEIRO, StatusPagamento.PAGO,     today.minusDays(21).atTime(11, 30));
        createPayment(c5,  ana.getValorConsulta(),  FormaPagamento.PIX,      StatusPagamento.PAGO,     today.minusDays(10).atTime(11, 30));
        createPayment(c6,  ana.getValorConsulta(),  FormaPagamento.CARTAO,   StatusPagamento.PENDENTE, null);
        createPayment(c7,  carlos.getValorConsulta(), FormaPagamento.PIX,    StatusPagamento.PAGO,     today.minusDays(28).atTime(15, 0));
        createPayment(c8,  carlos.getValorConsulta(), FormaPagamento.CARTAO, StatusPagamento.PAGO,     today.minusDays(14).atTime(15, 0));
        createPayment(c9,  carlos.getValorConsulta(), FormaPagamento.PIX,    StatusPagamento.PENDENTE, null);
        createPayment(c10, beatriz.getValorConsulta(), FormaPagamento.PIX,   StatusPagamento.PAGO,     today.minusDays(21).atTime(9, 0));
        createPayment(c11, beatriz.getValorConsulta(), FormaPagamento.DINHEIRO, StatusPagamento.PAGO,  today.minusDays(7).atTime(9, 0));
        createPayment(c12, beatriz.getValorConsulta(), FormaPagamento.PIX,   StatusPagamento.PAGO,     today.minusDays(14).atTime(10, 0));
        createPayment(c13, beatriz.getValorConsulta(), FormaPagamento.CARTAO, StatusPagamento.PENDENTE, null);
        createPayment(c14, rafael.getValorConsulta(), FormaPagamento.PIX,    StatusPagamento.PAGO,     today.minusDays(20).atTime(15, 0));
        createPayment(c15, rafael.getValorConsulta(), FormaPagamento.CARTAO, StatusPagamento.PENDENTE, null);
        createPayment(c16, camila.getValorConsulta(), FormaPagamento.PIX,    StatusPagamento.PAGO,     today.minusDays(15).atTime(10, 0));
        createPayment(c17, carlos.getValorConsulta(), FormaPagamento.PIX,    StatusPagamento.PAGO,     today.minusDays(8).atTime(12, 0));
        createPayment(c18, camila.getValorConsulta(), FormaPagamento.DINHEIRO, StatusPagamento.PAGO,   today.minusDays(10).atTime(11, 0));
        createPayment(c19, ana.getValorConsulta(),   FormaPagamento.CARTAO,  StatusPagamento.PENDENTE, null);

        // --- Registros emocionais ---
        createEmotionalRecords(joao,     today, 14, new int[]{4, 3, 4, 2, 4, 5, 4, 3, 4, 2, 4, 5, 4, 3}, new String[]{"Bem disposto", "Cansativo", "Ótimo dia", "Ansioso", "Tranquilo", "Muito bem", "Produtivo", "Stressado", "Calmo", "Triste", "Animado", "Feliz", "Equilibrado", "Cansado"});
        createEmotionalRecords(maria,    today, 12, new int[]{3, 3, 2, 4, 4, 3, 3, 4, 5, 4, 3, 4},       new String[]{"Dia difícil", "Melhorando", "Ansiosa", "Boa conversa", "Muito bem", "Normal", "Cansada", "Animada", "Excelente", "Feliz", "Tranquila", "Bem"});
        createEmotionalRecords(fernanda, today, 10, new int[]{4, 4, 5, 3, 4, 4, 5, 4, 4, 3},             new String[]{"Ótimo", "Bem", "Excelente", "Cansada", "Animada", "Tranquila", "Feliz", "Produtiva", "Bem", "Estressada"});
        createEmotionalRecords(pedro,    today, 10, new int[]{2, 3, 2, 3, 4, 3, 3, 4, 4, 3},             new String[]{"Ansioso", "Um pouco melhor", "Difícil", "Melhorando", "Bem", "Tranquilo", "Animado", "Ótimo", "Bom dia", "Normal"});
        createEmotionalRecords(luciana,  today, 7,  new int[]{3, 4, 4, 3, 5, 4, 4},                      new String[]{"Bem", "Animada", "Excelente", "Tranquila", "Muito bem", "Boa energia", "Feliz"});
        createEmotionalRecords(rafaelPac, today, 8, new int[]{3, 3, 4, 3, 4, 3, 4, 5},                   new String[]{"Cansado", "Melhorando", "Bem", "Ansioso", "Animado", "Normal", "Bom", "Ótimo"});
        createEmotionalRecords(isabela,  today, 12, new int[]{4, 5, 4, 4, 3, 5, 4, 4, 5, 4, 4, 5},      new String[]{"Feliz", "Excelente", "Bem", "Animada", "Cansada", "Muito bem", "Ótimo", "Tranquila", "Feliz", "Bem disposta", "Produtiva", "Excelente"});
        createEmotionalRecords(gustavo,  today, 8,  new int[]{3, 3, 4, 4, 3, 4, 5, 4},                   new String[]{"Normal", "Cansado", "Melhorando", "Bem", "Ansioso", "Tranquilo", "Animado", "Ótimo"});
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

    private void createLink(Paciente patient, Psicologo psychologist, StatusVinculo status, long daysAgo) {
        VinculoPsicologoPaciente link = new VinculoPsicologoPaciente();
        link.setPaciente(patient);
        link.setPsicologo(psychologist);
        link.setStatus(status);
        link.setSolicitadoEm(LocalDateTime.now().minusDays(daysAgo));
        if (status == StatusVinculo.ACEITO || status == StatusVinculo.RECUSADO) {
            link.setRespondidoEm(LocalDateTime.now().minusDays(daysAgo - 1));
        }
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

    private void createPayment(
            Consulta consultation,
            BigDecimal value,
            FormaPagamento paymentMethod,
            StatusPagamento paymentStatus,
            LocalDateTime paidAt
    ) {
        Pagamento pagamento = new Pagamento();
        pagamento.setConsulta(consultation);
        pagamento.setValor(value);
        pagamento.setFormaPagamento(paymentMethod);
        pagamento.setStatusPagamento(paymentStatus);
        if (paymentStatus == StatusPagamento.PAGO && paidAt != null) {
            pagamento.setPagoEm(paidAt);
        }
        pagamentoRepository.save(pagamento);
    }

    private void createEmotionalRecords(
            Paciente patient,
            LocalDate referenceDate,
            int count,
            int[] moodScores,
            String[] descriptions
    ) {
        for (int i = 0; i < count; i++) {
            LocalDateTime registeredAt = referenceDate.minusDays(count - 1 - i).atTime(20, 0);
            RegistroEmocional registro = new RegistroEmocional();
            registro.setPaciente(patient);
            registro.setHumorDia(moodScores[i]);
            registro.setDescricao(descriptions[i]);
            registro.setRegistradoEm(registeredAt);
            registro.setEditavelAte(registeredAt.plusHours(24));
            registroEmocionalRepository.save(registro);
        }
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
