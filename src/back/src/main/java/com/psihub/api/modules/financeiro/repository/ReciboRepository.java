package com.psihub.api.modules.financeiro.repository;

import com.psihub.api.modules.financeiro.entity.Recibo;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReciboRepository extends JpaRepository<Recibo, Long> {

    @Query("select r from Recibo r where r.pagamento.id = :pagamentoId")
    Optional<Recibo> findByPagamentoId(@Param("pagamentoId") Long pagamentoId);
}
