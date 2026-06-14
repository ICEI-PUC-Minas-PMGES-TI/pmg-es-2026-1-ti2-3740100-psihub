package com.psihub.api.modules.indicadores.dto;

public interface ConsultasMensaisPacienteProjection {
    Long getPacienteId();

    String getPacienteNome();

    Number getAno();

    Number getMes();

    Number getTotalConsultas();
}
