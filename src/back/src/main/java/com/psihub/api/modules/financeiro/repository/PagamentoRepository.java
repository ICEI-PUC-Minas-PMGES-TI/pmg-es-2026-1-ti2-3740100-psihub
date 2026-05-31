package com.psihub.api.modules.financeiro.repository;

import com.psihub.api.modules.financeiro.entity.Pagamento;
import com.psihub.api.modules.financeiro.entity.StatusPagamento;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {

    @Query("select p from Pagamento p where p.consulta.id = :consultaId")
    Optional<Pagamento> findByConsultaId(@Param("consultaId") Long consultaId);

    @Query("select p from Pagamento p where p.consulta.psicologo.id = :psicologoId and p.statusPagamento = :status")
    List<Pagamento> findByPsicologoIdAndStatusPagamento(
            @Param("psicologoId") Long psicologoId,
            @Param("status") StatusPagamento status
    );

    @Query("""
            select p from Pagamento p
            where p.consulta.psicologo.id = :psicologoId
              and p.pagoEm >= :inicio
              and p.pagoEm <= :fim
            """)
    List<Pagamento> findByPsicologoIdAndPagoEmBetween(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
            select p from Pagamento p
            where p.consulta.psicologo.id = :psicologoId
              and (:status is null or p.statusPagamento = :status)
            """)
    List<Pagamento> findByFiltros(
            @Param("psicologoId") Long psicologoId,
            @Param("status") StatusPagamento status
    );

    @Query("""
            select p from Pagamento p
            where p.consulta.psicologo.id = :psicologoId
              and (:status is null or p.statusPagamento = :status)
              and (:inicio is null or p.consulta.inicioEm >= :inicio)
              and (:fim is null or p.consulta.inicioEm < :fim)
            """)
    List<Pagamento> findByFiltrosCompleto(
            @Param("psicologoId") Long psicologoId,
            @Param("status") StatusPagamento status,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("select p from Pagamento p where p.consulta.paciente.id = :pacienteId")
    List<Pagamento> findByPacienteId(@Param("pacienteId") Long pacienteId);
}
