package com.psihub.api.modules.registros.entity;

import com.psihub.api.modules.psicologos.entity.Psicologo;
import com.psihub.api.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.SQLRestriction;

@Entity
@SQLRestriction("ativo = true")
@Table(name = "registros_anotacoes")
public class RegistroAnotacao extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registro_emocional_id", nullable = false)
    private RegistroEmocional registro;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "psicologo_id", nullable = false)
    private Psicologo psicologo;

    @Column(columnDefinition = "TEXT")
    private String texto;

    public RegistroEmocional getRegistro() {
        return registro;
    }

    public void setRegistro(RegistroEmocional registro) {
        this.registro = registro;
    }

    public Psicologo getPsicologo() {
        return psicologo;
    }

    public void setPsicologo(Psicologo psicologo) {
        this.psicologo = psicologo;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }
}

