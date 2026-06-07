package com.psihub.api.modules.registros.repository;

import com.psihub.api.modules.registros.entity.RegistroAnotacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistroAnotacaoRepository extends JpaRepository<RegistroAnotacao, Long> {

    List<RegistroAnotacao> findByRegistroIdAndAtivoTrueOrderByCriadoEmAsc(Long registroId);

}

