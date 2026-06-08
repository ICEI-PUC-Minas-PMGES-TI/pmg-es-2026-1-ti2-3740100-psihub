import { useEffect, useState } from 'react';
import { psychologistApi } from '@/services/psychologist.service';

const emptyProfile = {
    nome: '',
    telefone: '',
    fotoPerfilUrl: '',
    crp: '',
    valorConsulta: '',
    biografia: '',
    especialidades: '',
};

export function usePsychologistProfile(onToast) {
    const [form, setForm] = useState(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);

        psychologistApi
            .getPsychologistProfile(controller.signal)
            .then((profile) => {
                setForm({
                    nome: profile.nome || '',
                    telefone: profile.telefone || '',
                    fotoPerfilUrl: profile.fotoPerfilUrl || '',
                    crp: profile.crp || '',
                    valorConsulta: profile.valorConsulta ?? '',
                    biografia: profile.biografia || '',
                    especialidades: (profile.especialidades || []).join(', '),
                });

                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(
                        err.message ||
                            'Nao foi possivel carregar o perfil.'
                    );
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!form.nome.trim() || !form.crp.trim()) {
            setError('Nome e CRP sao obrigatorios.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            await psychologistApi.updatePsychologistProfile({
                nome: form.nome,
                telefone: form.telefone || null,
                fotoPerfilUrl: form.fotoPerfilUrl || null,
                crp: form.crp,
                valorConsulta: Number(form.valorConsulta || 0),
                biografia: form.biografia || null,
                especialidades: form.especialidades
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
            });

            onToast?.({
                type: 'success',
                message: 'Perfil profissional atualizado.',
            });
        } catch (err) {
            setError(err.message || 'Nao foi possivel salvar o perfil.');
        } finally {
            setSaving(false);
        }
    }

    function updateField(field, value) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
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
