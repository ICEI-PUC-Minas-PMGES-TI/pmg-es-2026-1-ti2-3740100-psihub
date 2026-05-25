import { useEffect, useState } from 'react';
import { Loader2, Save, User } from 'lucide-react';
import { clinicalApi } from '@/services/clinical.service';

const emptyProfile = {
    nome: '',
    telefone: '',
    fotoPerfilUrl: '',
    crp: '',
    valorConsulta: '',
    biografia: '',
    especialidades: '',
};

export function PsychologistProfilePage({ onToast }) {
    const [form, setForm] = useState(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);

        clinicalApi
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
            await clinicalApi.updatePsychologistProfile({
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

    const pageHeader = (
        <header className="agenda-page__header panel">
            <div>
                <p className="eyebrow">Configurações</p>
                <h1>Perfil Profissional</h1>
                <p className="agenda-page__subtitle">
                    Atualize os dados exibidos para pacientes e usados no agendamento.
                </p>
            </div>
        </header>
    );

    if (loading) {
        return (
            <div className="psihome">
                {pageHeader}

                <section className="panel">
                    <p className="state-row">
                        <Loader2 className="spin" size={18} />
                        Carregando perfil...
                    </p>
                </section>
            </div>
        );
    }

    return (
        <div className="psihome">
            {pageHeader}

            <section className="panel">
                <div className="panel__header">
                    <h2>Dados do Psicologo</h2>
                    <User size={20} />
                </div>

                {error && (
                    <div className="inline-alert inline-alert--error">
                        {error}
                    </div>
                )}

                <form className="form-grid" onSubmit={handleSubmit}>
                    <label className="form-group">
                        Nome completo

                        <input
                            value={form.nome}
                            onChange={(event) =>
                                updateField('nome', event.target.value)
                            }
                            maxLength={150}
                            required
                        />
                    </label>

                    <label className="form-group">
                        Telefone

                        <input
                            value={form.telefone}
                            onChange={(event) =>
                                updateField('telefone', event.target.value)
                            }
                            maxLength={30}
                        />
                    </label>

                    <label className="form-group">
                        CRP

                        <input
                            value={form.crp}
                            onChange={(event) =>
                                updateField('crp', event.target.value)
                            }
                            maxLength={30}
                            required
                        />
                    </label>

                    <label className="form-group">
                        Valor da consulta (R$)

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.valorConsulta}
                            onChange={(event) =>
                                updateField(
                                    'valorConsulta',
                                    event.target.value
                                )
                            }
                        />
                    </label>

                    <label className="form-group form-group--full">
                        Especialidades

                        <input
                            value={form.especialidades}
                            onChange={(event) =>
                                updateField(
                                    'especialidades',
                                    event.target.value
                                )
                            }
                            placeholder="Separe por virgula"
                        />
                    </label>

                    <label className="form-group form-group--full">
                        URL da foto de perfil

                        <input
                            value={form.fotoPerfilUrl}
                            onChange={(event) =>
                                updateField(
                                    'fotoPerfilUrl',
                                    event.target.value
                                )
                            }
                            maxLength={500}
                        />
                    </label>

                    <label className="form-group form-group--full">
                        Biografia

                        <textarea
                            rows="5"
                            value={form.biografia}
                            onChange={(event) =>
                                updateField(
                                    'biografia',
                                    event.target.value
                                )
                            }
                            maxLength={500}
                        />
                    </label>

                    <div style={{ marginTop: '20px' }}>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                backgroundColor: '#7c3aed',
                                color: 'white',
                                padding: '10px 18px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                width: 'fit-content',
                            }}
                        >
                            {saving ? (
                                <Loader2 className="spin" size={18} />
                            ) : (
                                <Save size={18} />
                            )}

                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}