package com.psihub.api.modules.financeiro.service;

import com.psihub.api.modules.consultas.entity.Consulta;
import com.psihub.api.modules.consultas.repository.ConsultaRepository;
import com.psihub.api.modules.financeiro.dto.ConfirmarPagamentoRequest;
import com.psihub.api.modules.financeiro.dto.PagamentoResponse;
import com.psihub.api.modules.financeiro.dto.ReciboResponse;
import com.psihub.api.modules.financeiro.dto.RegistrarPagamentoRequest;
import com.psihub.api.modules.financeiro.entity.Pagamento;
import com.psihub.api.modules.financeiro.entity.Recibo;
import com.psihub.api.modules.financeiro.entity.StatusPagamento;
import com.psihub.api.modules.financeiro.repository.PagamentoRepository;
import com.psihub.api.modules.financeiro.repository.ReciboRepository;
import com.psihub.api.shared.enums.StatusConsulta;
import com.psihub.api.shared.exception.ApiException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final ReciboRepository reciboRepository;
    private final ConsultaRepository consultaRepository;

    public PagamentoService(
            PagamentoRepository pagamentoRepository,
            ReciboRepository reciboRepository,
            ConsultaRepository consultaRepository
    ) {
        this.pagamentoRepository = pagamentoRepository;
        this.reciboRepository = reciboRepository;
        this.consultaRepository = consultaRepository;
    }

    @Transactional
    public PagamentoResponse registrarPagamento(Long psicologoId, RegistrarPagamentoRequest request) {
        Consulta consulta = consultaRepository.findById(Objects.requireNonNull(request.consultaId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Consulta nao encontrada"));

        if (!consulta.getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Consulta nao pertence ao psicologo autenticado");
        }

        if (consulta.getStatus() != StatusConsulta.CONCLUIDA) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Pagamento so pode ser registrado para consultas concluidas");
        }

        pagamentoRepository.findByConsultaId(consulta.getId()).ifPresent(p -> {
            throw new ApiException(HttpStatus.CONFLICT, "Ja existe um pagamento registrado para esta consulta");
        });

        Pagamento pagamento = new Pagamento();
        pagamento.setConsulta(consulta);
        pagamento.setValor(request.valor());
        pagamento.setFormaPagamento(request.formaPagamento());
        pagamento.setStatusPagamento(StatusPagamento.PENDENTE);

        pagamento = pagamentoRepository.save(pagamento);
        return toResponse(pagamento);
    }

    @Transactional
    public PagamentoResponse confirmarPagamento(Long psicologoId, Long pagamentoId, ConfirmarPagamentoRequest request) {
        Pagamento pagamento = buscarPagamentoDoPsicologo(psicologoId, pagamentoId);

        pagamento.setStatusPagamento(request.statusPagamento());

        if (request.statusPagamento() == StatusPagamento.PAGO) {
            pagamento.setPagoEm(LocalDateTime.now());
            pagamento = pagamentoRepository.save(pagamento);
            gerarRecibo(pagamento.getId());
        } else {
            pagamento = pagamentoRepository.save(pagamento);
        }

        return toResponse(pagamentoRepository.findById(Objects.requireNonNull(pagamento.getId())).orElseThrow());
    }

    @Transactional
    public void gerarRecibo(Long pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(Objects.requireNonNull(pagamentoId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pagamento nao encontrado"));

        int ano = LocalDateTime.now().getYear();
        String uuid8 = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        String numeroRecibo = "REC-" + ano + "-" + uuid8;

        Recibo recibo = new Recibo();
        recibo.setPagamento(pagamento);
        recibo.setNumeroRecibo(numeroRecibo);
        recibo.setArquivoUrl("pending");

        reciboRepository.save(recibo);
    }

    @Transactional(readOnly = true)
    public PagamentoResponse buscarPorConsulta(Long psicologoId, Long consultaId) {
        Pagamento pagamento = pagamentoRepository.findByConsultaId(consultaId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pagamento nao encontrado para esta consulta"));

        if (!pagamento.getConsulta().getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Pagamento nao pertence ao psicologo autenticado");
        }

        return toResponse(pagamento);
    }

    @Transactional(readOnly = true)
    public List<PagamentoResponse> listar(Long psicologoId, StatusPagamento status, LocalDate inicio, LocalDate fim) {
        List<Pagamento> pagamentos;

        if (inicio != null && fim != null) {
            pagamentos = pagamentoRepository.findByPsicologoIdAndPagoEmBetween(
                    psicologoId,
                    inicio.atStartOfDay(),
                    fim.plusDays(1).atStartOfDay()
            );
        } else {
            pagamentos = pagamentoRepository.findByFiltros(psicologoId, status);
        }

        return pagamentos.stream().map(this::toResponse).toList();
    }

    @Transactional
    public PagamentoResponse estornar(Long psicologoId, Long pagamentoId) {
        Pagamento pagamento = buscarPagamentoDoPsicologo(psicologoId, pagamentoId);

        if (pagamento.getStatusPagamento() != StatusPagamento.PAGO) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Apenas pagamentos com status PAGO podem ser estornados");
        }

        pagamento.setStatusPagamento(StatusPagamento.ESTORNADO);
        pagamentoRepository.save(pagamento);

        reciboRepository.findByPagamentoId(pagamentoId).ifPresent(recibo -> {
            recibo.setAtivo(false);
            reciboRepository.save(recibo);
        });

        return toResponse(pagamentoRepository.findById(Objects.requireNonNull(pagamentoId)).orElseThrow());
    }

    @Transactional(readOnly = true)
    public ReciboResponse buscarReciboPorPagamento(Long psicologoId, Long pagamentoId) {
        Pagamento pagamento = buscarPagamentoDoPsicologo(psicologoId, pagamentoId);

        Recibo recibo = reciboRepository.findByPagamentoId(pagamento.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recibo nao encontrado para este pagamento"));

        return toReciboResponse(recibo);
    }

    @Transactional(readOnly = true)
    public PagamentoResponse buscarPorId(Long psicologoId, Long pagamentoId) {
        return toResponse(buscarPagamentoDoPsicologo(psicologoId, pagamentoId));
    }

    @Transactional(readOnly = true)
    public List<PagamentoResponse> listarComoPaciente(Long pacienteId) {
        return pagamentoRepository.findByPacienteId(pacienteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReciboResponse buscarReciboComoPaciente(Long pacienteId, Long pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(Objects.requireNonNull(pagamentoId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pagamento nao encontrado"));

        if (!pagamento.getConsulta().getPaciente().getId().equals(pacienteId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Pagamento nao pertence ao paciente autenticado");
        }

        Recibo recibo = reciboRepository.findByPagamentoId(pagamento.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recibo nao encontrado para este pagamento"));

        return toReciboResponse(recibo);
    }

    private Pagamento buscarPagamentoDoPsicologo(Long psicologoId, Long pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(Objects.requireNonNull(pagamentoId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pagamento nao encontrado"));

        if (!pagamento.getConsulta().getPsicologo().getId().equals(psicologoId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Pagamento nao pertence ao psicologo autenticado");
        }

        return pagamento;
    }

    private PagamentoResponse toResponse(Pagamento pagamento) {
        ReciboResponse reciboResponse = null;
        Recibo recibo = pagamento.getRecibo();
        if (recibo != null) {
            reciboResponse = toReciboResponse(recibo);
        }

        return new PagamentoResponse(
                pagamento.getId(),
                pagamento.getConsulta().getId(),
                pagamento.getValor(),
                pagamento.getFormaPagamento(),
                pagamento.getStatusPagamento(),
                pagamento.getPagoEm(),
                reciboResponse
        );
    }

    private ReciboResponse toReciboResponse(Recibo recibo) {
        return new ReciboResponse(
                recibo.getId(),
                recibo.getNumeroRecibo(),
                recibo.getArquivoUrl(),
                recibo.getEmitidoEm()
        );
    }
}
