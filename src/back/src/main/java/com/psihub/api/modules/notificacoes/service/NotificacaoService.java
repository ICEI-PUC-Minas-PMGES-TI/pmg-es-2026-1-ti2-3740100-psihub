package com.psihub.api.modules.notificacoes.service;

import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.notificacoes.dto.NotificacaoResponse;
import com.psihub.api.modules.notificacoes.entity.Notificacao;
import com.psihub.api.modules.notificacoes.repository.NotificacaoRepository;
import com.psihub.api.shared.exception.ApiException;
import java.util.List;
import java.util.Objects;
import java.time.format.DateTimeFormatter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificacaoService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final NotificacaoRepository notificacaoRepository;

    public NotificacaoService(NotificacaoRepository notificacaoRepository) {
        this.notificacaoRepository = notificacaoRepository;
    }

    public void notificarCancelamentoParaPsicologo(Consulta consulta) {
        Usuario psicologo = consulta.getPsicologo().getUsuario();
        String pacienteNome = consulta.getPaciente().getUsuario().getNome();
        String horario = consulta.getInicioEm().format(DATE_TIME_FORMATTER);
        criar(
                psicologo,
                "Consulta cancelada",
                pacienteNome + " cancelou a consulta de " + horario + "."
        );
    }

    public void notificarCancelamentoParaPaciente(Consulta consulta) {
        Usuario paciente = consulta.getPaciente().getUsuario();
        String psicologoNome = consulta.getPsicologo().getUsuario().getNome();
        String horario = consulta.getInicioEm().format(DATE_TIME_FORMATTER);
        criar(
                paciente,
                "Consulta cancelada",
                psicologoNome + " cancelou a consulta de " + horario + "."
        );
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponse> listar(Long usuarioId, Boolean lida) {
        List<Notificacao> notificacoes;
        if (lida != null) {
            notificacoes = notificacaoRepository.findByUsuarioIdAndLidaOrderByCriadoEmDesc(usuarioId, lida);
        } else {
            notificacoes = notificacaoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId);
        }
        return notificacoes.stream().map(this::toResponse).toList();
    }

    @Transactional
    public NotificacaoResponse marcarLida(Long usuarioId, Long notificacaoId) {
        Notificacao notificacao = notificacaoRepository.findById(Objects.requireNonNull(notificacaoId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notificação não encontrada"));

        if (!notificacao.getUsuario().getId().equals(usuarioId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Notificação não pertence ao usuário autenticado");
        }

        notificacao.setLida(true);
        return toResponse(notificacaoRepository.save(notificacao));
    }

    @Transactional
    public void marcarTodasLidas(Long usuarioId) {
        List<Notificacao> pendentes = notificacaoRepository
                .findByUsuarioIdAndLidaOrderByCriadoEmDesc(usuarioId, false);
        pendentes.forEach(n -> n.setLida(true));
        notificacaoRepository.saveAll(pendentes);
    }

    public void criar(Usuario usuario, String titulo, String mensagem) {
        Notificacao notificacao = new Notificacao();
        notificacao.setUsuario(usuario);
        notificacao.setTitulo(titulo);
        notificacao.setMensagem(mensagem);
        notificacao.setLida(false);
        notificacaoRepository.save(notificacao);
    }

    private NotificacaoResponse toResponse(Notificacao notificacao) {
        return new NotificacaoResponse(
                notificacao.getId(),
                notificacao.getTitulo(),
                notificacao.getMensagem(),
                Boolean.TRUE.equals(notificacao.getLida()),
                notificacao.getCriadoEm()
        );
    }
}

