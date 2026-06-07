package com.psihub.api.shared.utils;

import com.psihub.api.modules.agenda.dto.RegraDisponibilidadeResponse;
import com.psihub.api.modules.agenda.entity.RegraDisponibilidade;
import com.psihub.api.modules.consultas.dto.ConsultaResponse;
import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.registros.entity.RegistroEmocional;
import com.psihub.api.modules.sessoes.dto.LinhaTempoSessaoResponse;
import com.psihub.api.modules.sessoes.dto.ProntuarioSessaoResponse;
import com.psihub.api.modules.sessoes.dto.RegistroEmocionalResponse;
import com.psihub.api.modules.sessoes.entity.ProntuarioSessao;
import org.springframework.stereotype.Component;

@Component
// Mapper mantido em shared por atender responses de multiplos modulos.
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

    public ConsultaResponse toResponse(Consulta consulta) {
        return new ConsultaResponse(
                consulta.getId(),
                consulta.getPaciente().getId(),
                consulta.getPaciente().getUsuario().getNome(),
                consulta.getPaciente().getUsuario().getEmail(),
                consulta.getPaciente().getUsuario().getTelefone(),
                consulta.getPsicologo().getId(),
                consulta.getPsicologo().getUsuario().getNome(),
                consulta.getInicioEm(),
                consulta.getFimEm(),
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
                consulta.getInicioEm(),
                consulta.getFimEm(),
                jsonListMapper.fromJson(prontuario.getTemasSessao()),
                prontuario.getNivelProgresso(),
                prontuario.getNivelEngajamento(),
                prontuario.getEvolucaoClinica()
        );
    }
}

