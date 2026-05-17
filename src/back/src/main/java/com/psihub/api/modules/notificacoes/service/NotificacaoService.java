package com.psihub.api.modules.notificacoes.service;

import com.psihub.api.modules.auth.entity.Usuario;
import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.notificacoes.entity.Notificacao;
import com.psihub.api.modules.notificacoes.repository.NotificacaoRepository;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;

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

    private void criar(Usuario usuario, String titulo, String mensagem) {
        Notificacao notificacao = new Notificacao();
        notificacao.setUsuario(usuario);
        notificacao.setTitulo(titulo);
        notificacao.setMensagem(mensagem);
        notificacao.setLida(false);
        notificacaoRepository.save(notificacao);
    }
}

