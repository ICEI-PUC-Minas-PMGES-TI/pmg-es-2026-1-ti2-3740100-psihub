package psihub.mappers;

import org.springframework.stereotype.Component;
import psihub.domain.model.Consulta;
import psihub.domain.model.ProntuarioSessao;
import psihub.domain.model.RegraDisponibilidade;
import psihub.domain.model.RegistroEmocional;
import psihub.domain.model.SlotConsulta;
import psihub.dtos.agenda.RegraDisponibilidadeResponse;
import psihub.dtos.agenda.SlotConsultaResponse;
import psihub.dtos.consultas.ConsultaResponse;
import psihub.dtos.sessoes.LinhaTempoSessaoResponse;
import psihub.dtos.sessoes.ProntuarioSessaoResponse;
import psihub.dtos.sessoes.RegistroEmocionalResponse;

@Component
public class ApiResponseMapper {

    private final JsonListMapper jsonListMapper;

    public ApiResponseMapper(JsonListMapper jsonListMapper) {
        this.jsonListMapper = jsonListMapper;
    }

    public RegraDisponibilidadeResponse toResponse(RegraDisponibilidade regra) {
        return new RegraDisponibilidadeResponse(
                regra.getId(),
                regra.getPsicologo().getId(),
                regra.getDiaSemana(),
                regra.getValidoAPartirDe(),
                regra.getValidoAte(),
                regra.getHoraInicio(),
                regra.getHoraFim(),
                regra.getPausaInicio(),
                regra.getPausaFim(),
                regra.getDuracaoSlotMinutos(),
                regra.getAtivo()
        );
    }

    public SlotConsultaResponse toResponse(SlotConsulta slot) {
        return toResponse(slot, null);
    }

    public SlotConsultaResponse toResponse(SlotConsulta slot, Consulta consulta) {
        Long regraId = slot.getRegraDisponibilidade() == null ? null : slot.getRegraDisponibilidade().getId();
        return new SlotConsultaResponse(
                slot.getId(),
                slot.getPsicologo().getId(),
                regraId,
                slot.getInicioEm(),
                slot.getFimEm(),
                slot.getStatus(),
                consulta == null ? null : consulta.getPaciente().getUsuario().getNome(),
                consulta == null ? null : consulta.getTipoAtendimento(),
                consulta == null ? null : consulta.getStatus(),
                consulta == null ? null : consulta.getObservacoes(),
                consulta == null ? null : consulta.getMotivoCancelamento()
        );
    }

    public ConsultaResponse toResponse(Consulta consulta) {
        return new ConsultaResponse(
                consulta.getId(),
                consulta.getPaciente().getId(),
                consulta.getPaciente().getUsuario().getNome(),
                consulta.getPaciente().getUsuario().getEmail(),
                consulta.getPaciente().getUsuario().getTelefone(),
                consulta.getPsicologo().getId(),
                consulta.getPsicologo().getUsuario().getNome(),
                consulta.getSlotConsulta().getId(),
                consulta.getSlotConsulta().getInicioEm(),
                consulta.getSlotConsulta().getFimEm(),
                consulta.getSlotConsulta().getStatus(),
                consulta.getTipoAtendimento(),
                consulta.getStatus(),
                consulta.getObservacoes(),
                consulta.getMotivoCancelamento(),
                consulta.getAgendadoPorUsuario().getId(),
                consulta.getIniciadoEm(),
                consulta.getFinalizadoEm()
        );
    }

    public RegistroEmocionalResponse toResponse(RegistroEmocional registro) {
        return new RegistroEmocionalResponse(
                registro.getId(),
                registro.getHumorDia(),
                registro.getDescricao(),
                jsonListMapper.fromJson(registro.getEmocoes()),
                registro.getRegistradoEm()
        );
    }

    public ProntuarioSessaoResponse toResponse(ProntuarioSessao prontuario) {
        if (prontuario == null) {
            return null;
        }

        return new ProntuarioSessaoResponse(
                prontuario.getId(),
                prontuario.getConsulta().getId(),
                prontuario.getObservacoesPreSessao(),
                prontuario.getAnotacoesClinicas(),
                jsonListMapper.fromJson(prontuario.getTemasSessao()),
                prontuario.getNivelEngajamento(),
                prontuario.getIntercorrencias(),
                prontuario.getEvolucaoClinica(),
                jsonListMapper.fromJson(prontuario.getIntervencoes()),
                prontuario.getTarefasEncaminhamentos(),
                prontuario.getNivelProgresso(),
                prontuario.getIncluirLinhaTempo(),
                prontuario.getCriadoEm(),
                prontuario.getAtualizadoEm()
        );
    }

    public LinhaTempoSessaoResponse toLinhaTempoResponse(ProntuarioSessao prontuario) {
        Consulta consulta = prontuario.getConsulta();
        return new LinhaTempoSessaoResponse(
                prontuario.getId(),
                consulta.getId(),
                consulta.getSlotConsulta().getInicioEm(),
                consulta.getSlotConsulta().getFimEm(),
                jsonListMapper.fromJson(prontuario.getTemasSessao()),
                prontuario.getNivelProgresso(),
                prontuario.getNivelEngajamento(),
                prontuario.getEvolucaoClinica()
        );
    }
}
