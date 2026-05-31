import { useEffect, useState } from 'react';
import { clinicalApi } from '@/services/clinical.service';

const emptyProfile = {
    nome: '',
    telefone: '',
    fotoPerfilUrl: '',
    dataNascimento: '',
    observacoesIniciais: '',
};

export function usePatientProfile(onToast) {
    const [form, setForm] = useState(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        clinicalApi.getPatientProfile(controller.signal)
            .then((profile) => {
                setForm({
                    nome: profile.nome || '',
                    telefone: profile.telefone || '',
                    fotoPerfilUrl: profile.fotoPerfilUrl || '',
                    dataNascimento: profile.dataNascimento || '',
                    observacoesIniciais: profile.observacoesIniciais || '',
                });
                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message || 'Nao foi possivel carregar o perfil.');
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!form.nome.trim() || !form.dataNascimento) {
            setError('Nome e data de nascimento sao obrigatorios.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await clinicalApi.updatePatientProfile({
                nome: form.nome,
                telefone: form.telefone || null,
                fotoPerfilUrl: form.fotoPerfilUrl || null,
                dataNascimento: form.dataNascimento,
                observacoesIniciais: form.observacoesIniciais || null,
            });
            onToast?.({ type: 'success', message: 'Perfil atualizado.' });
        } catch (err) {
            setError(err.message || 'Nao foi possivel salvar o perfil.');
        } finally {
            setSaving(false);
        }
    }

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    return {
        form,
        loading,
        saving,
        error,
        handleSubmit,
        updateField,
    };
}
