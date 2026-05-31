import { useState } from 'react';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { authApi } from '@/services/auth.service';
import { decodeJwtPayload } from '../../utils/auth.utils';

const initialForm = {
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    crp: '',
    valorConsulta: '',
    especialidades: '',
    biografia: '',
};

const PSYCHOLOGIST_PENDING_MESSAGE = 'Seu cadastro foi recebido! Aguarde a aprovação do administrador. Você receberá acesso após a análise do seu perfil.';

export function PsychologistRegisterPage({ onAuthenticated, onBack, onToast }) {
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState('');
    const [registered, setRegistered] = useState(false);

    const passwordTooShort = form.senha.length > 0 && form.senha.length < 8;
    const passwordMismatch = form.confirmarSenha.length > 0 && form.senha !== form.confirmarSenha;

    async function handleSubmit(event) {
        event.preventDefault();

        if (form.senha.length < 8) {
            setError('A senha precisa ter pelo menos 8 caracteres.');
            return;
        }

        if (form.senha !== form.confirmarSenha) {
            setError('A confirmação de senha não confere.');
            return;
        }

        if (!form.crp.trim()) {
            setError('Informe seu CRP para criar o perfil profissional.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const response = await authApi.register({
                nome: form.nome,
                email: form.email,
                senha: form.senha,
                confirmarSenha: form.confirmarSenha,
                telefone: form.telefone || null,
                tipo: 'psicologo',
                crp: form.crp,
                valorConsulta: Number(form.valorConsulta || 0),
                biografia: form.biografia || null,
                especialidades: form.especialidades
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
            });

            if (response.token) {
                const tokenPayload = decodeJwtPayload(response.token);
                onAuthenticated?.({
                    token: response.token,
                    user: response.user,
                    tipo: tokenPayload.tipo,
                });
                return;
            }

            setRegistered(true);
            onToast?.({
                type: 'success',
                message: PSYCHOLOGIST_PENDING_MESSAGE,
            });
        } catch (err) {
            setError(err.message || 'Não foi possível criar o perfil profissional agora.');
        } finally {
            setSubmitting(false);
        }
    }

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    return (
        <main className="professional-register-page">
            <section className="professional-register-panel">
                <div className="professional-register-panel__intro">
                    <button type="button" className="ghost-button professional-register-panel__back" onClick={onBack}>
                        <ArrowLeft size={17} />
                        Voltar
                    </button>

                    <div className="brand-mark" aria-hidden="true"></div>
                    <p className="eyebrow">Cadastro profissional</p>
                    <h1>Crie seu perfil de psicólogo</h1>
                    <p>
                        Preencha seus dados profissionais para acessar sua agenda e gerenciar seus pacientes no PsiHub.
                    </p>
                </div>

                <div className="professional-register-panel__body">
                    {registered ? (
                        <div className="success-panel">
                            <CheckCircle size={34} />
                            <h2>Cadastro enviado</h2>
                            <p>{PSYCHOLOGIST_PENDING_MESSAGE}</p>
                            <button type="button" className="primary-button primary-button--fit" onClick={onBack}>
                                Voltar para início
                            </button>
                        </div>
                    ) : (
                        <form className="stack-form" onSubmit={handleSubmit}>
                            {error && <div className="inline-alert inline-alert--error">{error}</div>}

                            <div className="form-grid">
                                <label className="field">
                                    Nome completo
                                    <input
                                        value={form.nome}
                                        onChange={(event) => updateField('nome', event.target.value)}
                                        maxLength={150}
                                        required
                                    />
                                </label>

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
                                    Telefone
                                    <input
                                        value={form.telefone}
                                        onChange={(event) => updateField('telefone', event.target.value)}
                                        maxLength={30}
                                    />
                                </label>

                                <label className="field">
                                    CRP
                                    <input
                                        value={form.crp}
                                        onChange={(event) => updateField('crp', event.target.value)}
                                        maxLength={30}
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
                                    <span className={passwordTooShort ? 'field-hint field-hint--error' : 'field-hint'}>
                                        Mínimo 8 caracteres
                                    </span>
                                </label>

                                <label className="field">
                                    Confirmar senha
                                    <span className="password-field">
                                        <input
                                            type={showConfirmation ? 'text' : 'password'}
                                            value={form.confirmarSenha}
                                            onChange={(event) => updateField('confirmarSenha', event.target.value)}
                                            minLength={8}
                                            maxLength={120}
                                            required
                                            aria-invalid={passwordMismatch}
                                        />
                                        <button
                                            className="password-field__toggle"
                                            type="button"
                                            onClick={() => setShowConfirmation((current) => !current)}
                                            aria-label={showConfirmation ? 'Ocultar senha' : 'Mostrar senha'}
                                        >
                                            {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </span>
                                    {passwordMismatch && <span className="field-hint field-hint--error">As senhas não conferem</span>}
                                </label>

                                <label className="field">
                                    Valor da sessão
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.valorConsulta}
                                        onChange={(event) => updateField('valorConsulta', event.target.value)}
                                        required
                                    />
                                </label>

                                <label className="field">
                                    Especialidades
                                    <input
                                        value={form.especialidades}
                                        onChange={(event) => updateField('especialidades', event.target.value)}
                                        maxLength={200}
                                        placeholder="Ex.: Ansiedade, TCC, Casais"
                                    />
                                </label>
                            </div>

                            <label className="field">
                                Bio profissional
                                <textarea
                                    rows="4"
                                    value={form.biografia}
                                    onChange={(event) => updateField('biografia', event.target.value)}
                                    maxLength={500}
                                />
                            </label>

                            <button className="primary-button" type="submit" disabled={submitting}>
                                {submitting ? <Loader2 className="spin" size={17} /> : <UserPlus size={17} />}
                                Criar perfil profissional
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
}
