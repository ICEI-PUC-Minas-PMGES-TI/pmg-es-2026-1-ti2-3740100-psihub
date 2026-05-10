import { useState } from 'react';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { authApi } from '../../api/authApi.js';
import { decodeJwtPayload } from '../../utils/auth.js';

const initialForm = {
    nome: '',
    email: '',
    senha: '',
    tipo: 'paciente',
};

export function AuthPage({ onAuthenticated, onToast }) {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);

    const isRegister = mode === 'register';

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);

        try {
            const payload = isRegister
                ? { nome: form.nome, email: form.email, senha: form.senha, tipo: form.tipo }
                : { email: form.email, senha: form.senha };
            const response = isRegister ? await authApi.register(payload) : await authApi.login(payload);
            const tokenPayload = decodeJwtPayload(response.token);

            onAuthenticated({
                token: response.token,
                user: response.user,
                tipo: tokenPayload.tipo,
            });
        } catch (error) {
            onToast({ type: 'error', message: friendlyError(error, isRegister) });
        } finally {
            setSubmitting(false);
        }
    }

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    return (
        <main className="auth-page">
            <section className="auth-panel">
                <div className="auth-panel__intro">
                    <div className="brand-mark" aria-hidden="true"></div>
                    <h1>PsiHub</h1>
                    <p>Entre para acessar sua agenda de consultas psicológicas.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="segmented-control" role="tablist" aria-label="Modo de acesso">
                        <button
                            type="button"
                            className={!isRegister ? 'segmented-control__item segmented-control__item--active' : 'segmented-control__item'}
                            onClick={() => setMode('login')}
                        >
                            Entrar
                        </button>
                        <button
                            type="button"
                            className={isRegister ? 'segmented-control__item segmented-control__item--active' : 'segmented-control__item'}
                            onClick={() => setMode('register')}
                        >
                            Criar conta
                        </button>
                    </div>

                    {isRegister && (
                        <>
                            <label className="field">
                                Nome
                                <input
                                    value={form.nome}
                                    onChange={(event) => updateField('nome', event.target.value)}
                                    maxLength={150}
                                    required
                                />
                            </label>
                        </>
                    )}

                    <label className="field">
                        E-mail
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) => updateField('email', event.target.value)}
                            maxLength={180}
                            required
                        />
                    </label>

                    <label className="field">
                        Senha
                        <input
                            type="password"
                            value={form.senha}
                            onChange={(event) => updateField('senha', event.target.value)}
                            minLength={8}
                            maxLength={120}
                            required
                        />
                    </label>

                    <button className="primary-button" type="submit" disabled={submitting}>
                        {submitting ? <Loader2 className="spin" size={17} /> : isRegister ? <UserPlus size={17} /> : <LogIn size={17} />}
                        {isRegister ? 'Criar conta' : 'Entrar'}
                    </button>
                </form>
            </section>
        </main>
    );
}

function friendlyError(error, isRegister) {
    if (error?.status === 401) return 'E-mail ou senha não conferem.';
    if (error?.status === 409) return 'Já existe uma conta com este e-mail.';
    return isRegister ? 'Não foi possível criar sua conta agora.' : 'Não foi possível entrar agora.';
}
