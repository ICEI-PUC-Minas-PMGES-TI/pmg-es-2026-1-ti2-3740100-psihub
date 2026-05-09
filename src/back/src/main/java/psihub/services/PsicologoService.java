package psihub.services;

import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import psihub.domain.enums.StatusAcesso;
import psihub.domain.model.Psicologo;
import psihub.dtos.psicologos.PsicologoDisponivelResponse;
import psihub.repositories.PsicologoRepository;

@Service
public class PsicologoService {

    private final PsicologoRepository psicologoRepository;

    public PsicologoService(PsicologoRepository psicologoRepository) {
        this.psicologoRepository = psicologoRepository;
    }

    @Transactional(readOnly = true)
    public List<PsicologoDisponivelResponse> listarDisponiveis() {
        return psicologoRepository.findDisponiveis(StatusAcesso.ATIVO)
                .stream()
                .sorted(Comparator.comparing(psicologo -> psicologo.getUsuario().getNome()))
                .map(this::toResponse)
                .toList();
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
