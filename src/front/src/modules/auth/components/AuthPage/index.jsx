import { Eye, EyeOff, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuthForm } from '@/modules/auth/hooks/useAuthForm';

export function AuthPage({ onAuthenticated, onToast, initialMode, initialTipo }) {
    const {
        form,
        handleSubmit,
        isRegister,
        passwordTooShort,
        setMode,
        setShowPassword,
        showPassword,
        submitting,
        updateField,
    } = useAuthForm({ onAuthenticated, onToast, initialMode, initialTipo });
    const passwordMismatch = isRegister && form.confirmarSenha.length > 0 && form.senha !== form.confirmarSenha;

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

                            <label className="field">
                                Data de nascimento
                                <input
                                    type="date"
                                    value={form.dataNascimento}
                                    onChange={(event) => updateField('dataNascimento', event.target.value)}
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
                            Mínimo 8 caracteres
                        </span>
                    </label>

                    {isRegister && (
                        <label className="field">
                            Confirmar senha
                            <input
                                type="password"
                                value={form.confirmarSenha}
                                onChange={(event) => updateField('confirmarSenha', event.target.value)}
                                minLength={8}
                                maxLength={120}
                                required
                                aria-invalid={passwordMismatch}
                            />
                            {passwordMismatch && (
                                <span className="field-hint field-hint--error">As senhas não conferem</span>
                            )}
                        </label>
                    )}

                    <button className="primary-button" type="submit" disabled={submitting}>
                        {submitting ? <Loader2 className="spin" size={17} /> : isRegister ? <UserPlus size={17} /> : <LogIn size={17} />}
                        {isRegister ? 'Criar conta' : 'Entrar'}
                    </button>
                    {!isRegister && (
                        <button
                            className="auth-forgot-button"
                            type="button"
                            onClick={() => onToast?.({ type: 'info', message: 'Em breve você poderá redefinir sua senha por e-mail.' })}
                        >
                            Esqueci minha senha
                        </button>
                    )}
                </form>
            </section>
        </main>
    );
}
