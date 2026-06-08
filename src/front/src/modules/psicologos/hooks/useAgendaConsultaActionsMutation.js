import { useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';

/**
 * Mutacoes da consulta para status, edicao e exclusao.
 */
export function useAgendaConsultaActionsMutation({ consultationModal, setConsultationModal, onToast, refreshAll }) {
    const [statusSubmitting, setStatusSubmitting] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    async function handleUpdateStatus(status, motivo = null) {
        if (!consultationModal) return;
        setStatusSubmitting(true);
        try {
            await schedulingApi.updateConsultationStatus({
                consultaId: consultationModal.id,
                status,
                motivo,
            });
            onToast?.({ type: 'success', message: 'Status da consulta atualizado.' });
            setConsultationModal(null);
            refreshAll();
        } catch (error) {
            onToast?.({ type: 'error', message: error?.message || 'Não foi possível atualizar o status.' });
        } finally {
            setStatusSubmitting(false);
        }
    }

    async function handleEditConsultation(form, consultationId) {
        const targetId = consultationId || consultationModal?.id;
        if (!targetId) return;
        setEditSubmitting(true);
        try {
            await schedulingApi.updateConsultation({
                consultaId: targetId,
                payload: {
                    inicioEm: form.inicioEm,
                    fimEm: form.fimEm,
                    tipoAtendimento: form.tipoAtendimento,
                    observacoes: form.observacoes || null,
                },
            });
            onToast?.({ type: 'success', message: 'Consulta atualizada com sucesso.' });
            setConsultationModal(null);
            refreshAll();
        } catch (error) {
            onToast?.({ type: 'error', message: error?.message || 'Não foi possível editar a consulta.' });
        } finally {
            setEditSubmitting(false);
        }
    }

    async function handleDeleteConsultation() {
        if (!consultationModal) return;
        setDeleteSubmitting(true);
        try {
            await schedulingApi.deleteConsultation(consultationModal.id);
            onToast?.({ type: 'success', message: 'Consulta removida com sucesso.' });
            setConsultationModal(null);
            refreshAll();
        } catch (error) {
            onToast?.({ type: 'error', message: error?.message || 'Não foi possível remover a consulta.' });
        } finally {
            setDeleteSubmitting(false);
        }
    }

    return {
        statusSubmitting,
        editSubmitting,
        deleteSubmitting,
        handleUpdateStatus,
        handleEditConsultation,
        handleDeleteConsultation,
    };
}
