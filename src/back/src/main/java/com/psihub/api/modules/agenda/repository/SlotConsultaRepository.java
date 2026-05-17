package com.psihub.api.modules.agenda.repository;

import com.psihub.api.modules.agenda.entity.SlotConsulta;
import com.psihub.api.shared.enums.StatusSlotConsulta;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SlotConsultaRepository extends JpaRepository<SlotConsulta, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select slot
            from SlotConsulta slot
            join fetch slot.psicologo psicologo
            where slot.id = :id
            """)
    Optional<SlotConsulta> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            select slot
            from SlotConsulta slot
            join fetch slot.psicologo psicologo
            where psicologo.id = :psicologoId
              and slot.inicioEm >= :inicio
              and slot.inicioEm < :fim
              and (:status is null or slot.status = :status)
            order by slot.inicioEm asc
            """)
    List<SlotConsulta> findAgenda(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("status") StatusSlotConsulta status
    );

    boolean existsByPsicologoIdAndInicioEmAndFimEm(Long psicologoId, LocalDateTime inicioEm, LocalDateTime fimEm);

    Optional<SlotConsulta> findByPsicologoIdAndInicioEmAndFimEm(Long psicologoId, LocalDateTime inicioEm, LocalDateTime fimEm);

    @Query("""
            select count(slot) > 0
            from SlotConsulta slot
            where slot.psicologo.id = :psicologoId
              and slot.ativo = true
              and slot.status in :statuses
              and slot.inicioEm < :fim
              and slot.fimEm > :inicio
            """)
    boolean existsOverlap(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("statuses") Collection<StatusSlotConsulta> statuses
    );

    @Query("""
            select slot
            from SlotConsulta slot
            where slot.psicologo.id = :psicologoId
              and slot.ativo = true
              and slot.status in :statuses
              and slot.inicioEm < :fim
              and slot.fimEm > :inicio
            order by slot.inicioEm asc
            """)
    List<SlotConsulta> findOverlapping(
            @Param("psicologoId") Long psicologoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("statuses") Collection<StatusSlotConsulta> statuses
    );
}

