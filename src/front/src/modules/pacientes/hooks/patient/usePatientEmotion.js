import { useEffect, useState } from 'react';
import { clinicalApi } from '@/services/clinical.service';

const initialForm = {
    humorDia: 3,
    emocoes: '',
    descricao: '',
    psicologoId: null,
};

export function usePatientEmotion(onToast) {
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [psicologos, setPsicologos] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        clinicalApi.listEmotionRecords(controller.signal)
            .then((data) => {
                setRecords(data || []);
                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message || 'Nao foi possivel carregar registros.');
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        clinicalApi.listAvailablePsychologists(controller.signal)
            .then((data) => setPsicologos(data || []))
            .catch(() => setPsicologos([]));
        return () => controller.abort();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        if (Number(form.humorDia) < 1 || Number(form.humorDia) > 5) {
            setError('Humor deve estar entre 1 e 5.');
            return;
        }

        setSaving(true);
        setError('');
        const payload = {
            humorDia: Number(form.humorDia),
            descricao: form.descricao || null,
            emocoes: form.emocoes.split(',').map((item) => item.trim()).filter(Boolean),
            psicologoId: form.psicologoId || null,
        };

        try {
            if (editingId) {
                await clinicalApi.updateEmotionRecord(editingId, payload);
            } else {
                await clinicalApi.createEmotionRecord(payload);
            }
            setRecords(await clinicalApi.listEmotionRecords());
            setForm(initialForm);
            setEditingId(null);
            onToast?.({ type: 'success', message: 'Registro emocional salvo.' });
        } catch (err) {
            setError(err.message || 'Nao foi possivel salvar o registro.');
        } finally {
            setSaving(false);
        }
    }

    function startEdit(record) {
        setEditingId(record.id);
        setForm({
            humorDia: record.humorDia,
            descricao: record.descricao || '',
            emocoes: (record.emocoes || []).join(', '),
            psicologoId: record.psicologoId || null,
        });
    }

    return {
        records,
        form,
        setForm,
        editingId,
        loading,
        saving,
        error,
        psicologos,
        handleSubmit,
        startEdit,
    };
}
