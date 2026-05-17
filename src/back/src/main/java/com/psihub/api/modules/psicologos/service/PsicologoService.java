package com.psihub.api.modules.psicologos.service;

import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.psicologos.dto.PsicologoDisponivelResponse;
import com.psihub.api.modules.psicologos.entity.EspecialidadePsicologo;
import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.modules.psicologos.repository.EspecialidadePsicologoRepository;
import com.psihub.api.modules.psicologos.repository.PsicologoRepository;
import com.psihub.api.shared.enums.StatusAcesso;
import com.psihub.api.shared.exception.ApiException;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
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

    @Transactional
    public void criarPerfilInicial(Usuario usuario) {
        Psicologo psicologo = new Psicologo();
        psicologo.setUsuario(usuario);
        psicologo.setCrp("CADASTRO-" + usuario.getId());
        psicologo.setValorConsulta(BigDecimal.ZERO);
        psicologo.setBiografia("Perfil profissional em configuracao.");
        psicologo.setStatusAcesso(StatusAcesso.ATIVO);
        Psicologo psicologoSalvo = psicologoRepository.save(psicologo);

        EspecialidadePsicologo especialidade = new EspecialidadePsicologo();
        especialidade.setPsicologo(psicologoSalvo);
        especialidade.setNome("Psicologia");
        especialidadePsicologoRepository.save(especialidade);
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
}

