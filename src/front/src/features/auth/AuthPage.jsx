import { useState } from 'react';
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from 'lucide-react';
import { authApi } from '../../api/authApi.js';
import { decodeJwtPayload } from '../../utils/auth.js';

const initialForm = {
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    dataNascimento: '',
    tipo: 'paciente',
};

export function AuthPage({ onAuthenticated, onToast }) {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isRegister = mode === 'register';
    const passwordTooShort = form.senha.length > 0 && form.senha.length < 8;
    const passwordMismatch = isRegister && form.confirmarSenha && form.senha !== form.confirmarSenha;

    async function handleSubmit(event) {
        event.preventDefault();

        if (form.senha.length < 8 || passwordMismatch) {
            return;
        }
        if (isRegister && form.tipo === 'paciente' && !form.dataNascimento) {
            onToast?.({ type: 'error', message: 'Informe a data de nascimento do paciente.' });
            return;
        }

        setSubmitting(true);

        try {
            const payload = isRegister
                ? {
                    nome: form.nome,
                    email: form.email,
                    senha: form.senha,
                    confirmarSenha: form.confirmarSenha,
                    telefone: form.telefone || null,
                    dataNascimento: form.tipo === 'paciente' ? form.dataNascimento : null,
                    tipo: form.tipo,
                }
                : { email: form.email, senha: form.senha };
            const response = isRegister ? await authApi.register(payload) : await authApi.login(payload);

            if (!response.token) {
                setMode('login');
                setForm((current) => ({ ...current, senha: '', confirmarSenha: '' }));
                onToast?.({ type: 'success', message: 'Cadastro enviado. Aguarde aprovacao administrativa para entrar.' });
                return;
            }

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
                    <p>Entre para acessar sua agenda de consultas psicologicas.</p>
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
                                Perfil
                                <select value={form.tipo} onChange={(event) => updateField('tipo', event.target.value)}>
                                    <option value="paciente">Paciente</option>
                                    <option value="psicologo">Psicologo</option>
                                </select>
                            </label>

                            <label className="field">
                                Nome
                                <input
                                    value={form.nome}
                                    onChange={(event) => updateField('nome', event.target.value)}
                                    maxLength={150}
                                    required
                                />
                            </label>

                            <label className="field">
                                Telefone
                                <input
                                    value={form.telefone}
                                    onChange={(event) => updateField('telefone', event.target.value)}
                                    maxLength={30}
                                    inputMode="tel"
                                />
                            </label>

                            {form.tipo === 'paciente' && (
                                <label className="field">
                                    Data de nascimento
                                    <input
                                        type="date"
                                        value={form.dataNascimento}
                                        onChange={(event) => updateField('dataNascimento', event.target.value)}
                                        required
                                    />
                                </label>
                            )}
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
                        <span className="password-field">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={form.senha}
                                onChange={(event) => updateField('senha', event.target.value)}
                                minLength={8}
                                maxLength={120}
                                required
                                aria-invalid={passwordTooShort}
                                aria-describedby="password-help"
                            />
                            <button
                                className="password-field__toggle"
                                type="button"
                                onClick={() => setShowPassword((current) => !current)}
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </span>
                        <span
                            id="password-help"
                            className={passwordTooShort ? 'field-hint field-hint--error' : 'field-hint'}
                        >
                            Minimo 8 caracteres
                        </span>
                    </label>

                    {isRegister && (
                        <label className="field">
                            Confirmar senha
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={form.confirmarSenha}
                                onChange={(event) => updateField('confirmarSenha', event.target.value)}
                                minLength={8}
                                maxLength={120}
                                required
                                aria-invalid={passwordMismatch}
                            />
                            {passwordMismatch && <span className="field-hint field-hint--error">As senhas nao conferem.</span>}
                        </label>
                    )}

                    <button className="primary-button" type="submit" disabled={submitting || passwordMismatch}>
                        {submitting ? <Loader2 className="spin" size={17} /> : isRegister ? <UserPlus size={17} /> : <LogIn size={17} />}
                        {isRegister ? 'Criar conta' : 'Entrar'}
                    </button>
                </form>
            </section>
        </main>
    );
}

function friendlyError(error, isRegister) {
    if (error?.status === 401) return 'E-mail ou senha nao conferem.';
    if (error?.status === 403) return error.message || 'Acesso bloqueado para este perfil.';
    if (error?.status === 409) return 'Ja existe uma conta com este e-mail.';
    if (error?.status === 400) return error.message || 'Revise os dados informados.';
    return isRegister ? 'Nao foi possivel criar sua conta agora.' : 'Nao foi possivel entrar agora.';
}
