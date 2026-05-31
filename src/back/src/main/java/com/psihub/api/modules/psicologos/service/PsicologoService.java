package com.psihub.api.modules.psicologos.service;

import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.psicologos.dto.AdminPsicologoResponse;
import com.psihub.api.modules.psicologos.dto.PerfilPsicologoRequest;
import com.psihub.api.modules.psicologos.dto.PerfilPsicologoResponse;
import com.psihub.api.modules.psicologos.dto.PsicologoDisponivelResponse;
import com.psihub.api.modules.psicologos.entity.EspecialidadePsicologo;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.modules.psicologos.repository.EspecialidadePsicologoRepository;
import com.psihub.api.modules.psicologos.repository.PsicologoRepository;
import com.psihub.api.shared.enums.StatusAcesso;
import com.psihub.api.shared.exception.ApiException;
import com.psihub.api.shared.utils.StringUtils;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PsicologoService {

    private final PsicologoRepository psicologoRepository;
    private final EspecialidadePsicologoRepository especialidadePsicologoRepository;

    public PsicologoService(
            PsicologoRepository psicologoRepository,
            EspecialidadePsicologoRepository especialidadePsicologoRepository
    ) {
        this.psicologoRepository = psicologoRepository;
        this.especialidadePsicologoRepository = especialidadePsicologoRepository;
    }

    @Transactional(readOnly = true)
    public List<PsicologoDisponivelResponse> listarDisponiveis() {
        // Apenas psicólogos com acesso ATIVO são exibidos publicamente.
        // PENDENTE e REVOGADO não aparecem para pacientes.
        return psicologoRepository.findDisponiveis(StatusAcesso.ATIVO)
                .stream()
                .sorted(Comparator.comparing(psicologo -> psicologo.getUsuario().getNome()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Psicologo buscarPorId(Long id) {
        return psicologoRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Psicologo nao encontrado"));
    }

    @Transactional(readOnly = true)
    public Psicologo buscarAtivoPorId(Long id) {
        Psicologo psicologo = buscarPorId(id);
        validarStatusAtivo(psicologo);
        return psicologo;
    }

    @Transactional(readOnly = true)
    public StatusAcesso buscarStatusAcessoPorId(Long id) {
        return buscarPorId(id).getStatusAcesso();
    }

    @Transactional(readOnly = true)
    public PerfilPsicologoResponse obterPerfil(Long psicologoId) {
        return toPerfilResponse(buscarPorId(psicologoId));
    }

    @Transactional
    public void criarPerfilInicial(Usuario usuario) {
        criarPerfilInicial(usuario, null, null, null, null);
    }

    @Transactional
    public void criarPerfilInicial(
            Usuario usuario,
            String crp,
            BigDecimal valorConsulta,
            String biografia,
            List<String> especialidades
    ) {
        Psicologo psicologo = new Psicologo();
        psicologo.setUsuario(usuario);
        String crpNormalizado = StringUtils.sanitizeOptional(crp);
        String biografiaNormalizada = StringUtils.sanitizeOptional(biografia);
        psicologo.setCrp(crpNormalizado != null ? crpNormalizado : "CADASTRO-" + usuario.getId());
        psicologo.setValorConsulta(valorConsulta != null ? valorConsulta : BigDecimal.ZERO);
        psicologo.setBiografia(biografiaNormalizada != null ? biografiaNormalizada : "Perfil profissional em configuracao.");
        // Novo psicólogo começa como PENDENTE e só acessa após aprovação do admin.
        // Para aprovar, utilize o endpoint PATCH /api/admin/psicologos/{id}/aprovar.
        psicologo.setStatusAcesso(StatusAcesso.PENDENTE);
        Psicologo psicologoSalvo = psicologoRepository.save(psicologo);

        List<String> nomes = especialidades == null ? List.of("Psicologia") : especialidades.stream()
                .map(StringUtils::sanitizeOptional)
                .filter(Objects::nonNull)
                .collect(LinkedHashMap<String, String>::new, (map, nome) -> map.putIfAbsent(normalizarChave(nome), nome), Map::putAll)
                .values()
                .stream()
                .sorted()
                .toList();
        if (nomes.isEmpty()) {
            nomes = List.of("Psicologia");
        }

        for (String nome : nomes) {
            EspecialidadePsicologo especialidade = new EspecialidadePsicologo();
            especialidade.setPsicologo(psicologoSalvo);
            especialidade.setNome(nome);
            especialidadePsicologoRepository.save(especialidade);
        }
    }

    @Transactional(readOnly = true)
    public boolean existeCrp(String crp) {
        String normalized = StringUtils.sanitizeOptional(crp);
        return normalized != null && psicologoRepository.existsByCrpIgnoreCase(normalized);
    }

    @Transactional
    public PerfilPsicologoResponse atualizarPerfil(Long psicologoId, PerfilPsicologoRequest request) {
        Psicologo psicologo = buscarPorId(psicologoId);
        Usuario usuario = psicologo.getUsuario();

        String nome = StringUtils.sanitizeOptional(request.nome());
        if (nome != null) {
            usuario.setNome(nome);
        }
        usuario.setTelefone(StringUtils.sanitizeOptional(request.telefone()));
        usuario.setFotoUrl(StringUtils.sanitizeOptional(request.fotoPerfilUrl()));

        String crp = StringUtils.sanitizeOptional(request.crp());
        if (crp != null) {
            // Valida unicidade do CRP apenas quando o valor muda.
            if (!crp.equalsIgnoreCase(psicologo.getCrp()) && existeCrp(crp)) {
                throw new ApiException(HttpStatus.CONFLICT, "Ja existe um psicologo cadastrado com este CRP");
            }
            psicologo.setCrp(crp);
        }
        if (request.valorConsulta() != null) {
            psicologo.setValorConsulta(request.valorConsulta());
        }
        psicologo.setBiografia(StringUtils.sanitizeOptional(request.biografia()));

        atualizarEspecialidades(psicologo, request.especialidades());
        return toPerfilResponse(psicologo);
    }

    @Transactional(readOnly = true)
    public List<AdminPsicologoResponse> listarParaAdmin(StatusAcesso status) {
        return psicologoRepository.findParaAdmin(status)
                .stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional
    public AdminPsicologoResponse aprovar(Long psicologoId) {
        Psicologo psicologo = buscarPorId(psicologoId);
        if (psicologo.getStatusAcesso() == StatusAcesso.ATIVO) {
            return toAdminResponse(psicologo);
        }
        if (psicologo.getStatusAcesso() == StatusAcesso.REVOGADO) {
            throw new ApiException(HttpStatus.CONFLICT, "Psicologo revogado nao pode ser aprovado automaticamente");
        }

        psicologo.setStatusAcesso(StatusAcesso.ATIVO);
        psicologo.setMotivoRevogacao(null);
        return toAdminResponse(psicologo);
    }

    @Transactional
    public AdminPsicologoResponse revogar(Long psicologoId, String motivo) {
        Psicologo psicologo = buscarPorId(psicologoId);
        if (psicologo.getStatusAcesso() == StatusAcesso.REVOGADO) {
            return toAdminResponse(psicologo);
        }

        psicologo.setStatusAcesso(StatusAcesso.REVOGADO);
        psicologo.setMotivoRevogacao(StringUtils.sanitizeOptional(motivo));
        return toAdminResponse(psicologo);
    }

    public String buscarCrpPorId(Long id) {
        return psicologoRepository.findById(Objects.requireNonNull(id))
                .map(Psicologo::getCrp)
                .orElse(null);
    }

    private PsicologoDisponivelResponse toResponse(Psicologo psicologo) {
        List<String> especialidades = psicologo.getEspecialidades()
                .stream()
                .map(especialidade -> especialidade.getNome())
                .sorted(Comparator.naturalOrder())
                .toList();

        return new PsicologoDisponivelResponse(
                psicologo.getId(),
                psicologo.getUsuario().getNome(),
                psicologo.getCrp(),
                psicologo.getValorConsulta(),
                psicologo.getBiografia(),
                especialidades
        );
    }

    private PerfilPsicologoResponse toPerfilResponse(Psicologo psicologo) {
        return new PerfilPsicologoResponse(
                psicologo.getId(),
                psicologo.getUsuario().getNome(),
                psicologo.getUsuario().getEmail(),
                psicologo.getUsuario().getTelefone(),
                psicologo.getUsuario().getFotoUrl(),
                psicologo.getCrp(),
                psicologo.getValorConsulta(),
                psicologo.getBiografia(),
                especialidades(psicologo),
                psicologo.getStatusAcesso()
        );
    }

    private AdminPsicologoResponse toAdminResponse(Psicologo psicologo) {
        return new AdminPsicologoResponse(
                psicologo.getId(),
                psicologo.getUsuario().getNome(),
                psicologo.getUsuario().getEmail(),
                psicologo.getCrp(),
                psicologo.getValorConsulta(),
                especialidades(psicologo),
                psicologo.getStatusAcesso(),
                psicologo.getMotivoRevogacao()
        );
    }

    private List<String> especialidades(Psicologo psicologo) {
        return psicologo.getEspecialidades()
                .stream()
                .map(EspecialidadePsicologo::getNome)
                .sorted(Comparator.naturalOrder())
                .toList();
    }

    private void validarStatusAtivo(Psicologo psicologo) {
        if (psicologo.getStatusAcesso() == StatusAcesso.PENDENTE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cadastro do psicologo aguarda aprovacao pelo administrador");
        }
        if (psicologo.getStatusAcesso() == StatusAcesso.REVOGADO) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Acesso do psicologo foi revogado pelo administrador");
        }
    }

    private void atualizarEspecialidades(Psicologo psicologo, List<String> especialidades) {
        if (especialidades == null) {
            return;
        }

        List<String> nomes = especialidades.stream()
                .map(StringUtils::sanitizeOptional)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
        Map<String, EspecialidadePsicologo> existentes = new LinkedHashMap<>();
        for (EspecialidadePsicologo especialidade : especialidadePsicologoRepository.findAllByPsicologoIdIncludingInactive(psicologo.getId())) {
            existentes.put(normalizarChave(especialidade.getNome()), especialidade);
        }

        for (EspecialidadePsicologo especialidade : existentes.values()) {
            especialidade.setAtivo(false);
        }

        for (String nome : nomes) {
            String chave = normalizarChave(nome);
            EspecialidadePsicologo especialidade = existentes.get(chave);
            if (especialidade == null) {
                especialidade = new EspecialidadePsicologo();
                especialidade.setPsicologo(psicologo);
                especialidade.setNome(nome);
            }
            especialidade.setAtivo(true);
            especialidadePsicologoRepository.save(especialidade);
        }
    }

    private String normalizarChave(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

}
