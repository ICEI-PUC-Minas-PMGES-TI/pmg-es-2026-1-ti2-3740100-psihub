import { useState } from 'react';
import { authApi } from '@/services/auth.service';
import { decodeJwtPayload } from '@/modules/auth/utils/auth.utils';

const initialForm = {
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    dataNascimento: '',
    tipo: 'paciente',
};

export function useAuthForm({ onAuthenticated, onToast, initialMode = 'login', initialTipo = 'paciente' }) {
    const [mode, setMode] = useState(initialMode);
    const [form, setForm] = useState({ ...initialForm, tipo: initialTipo });
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isRegister = mode === 'register';
    const passwordTooShort = form.senha.length > 0 && form.senha.length < 8;

    async function handleSubmit(event) {
        event.preventDefault();

        if (form.senha.length < 8) {
            return;
        }

        if (isRegister && form.senha !== form.confirmarSenha) {
            onToast({ type: 'error', message: 'A confirmação de senha não confere.' });
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
                    dataNascimento: form.dataNascimento,
                    tipo: form.tipo,
                }
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

    return {
        form,
        handleSubmit,
        isRegister,
        passwordTooShort,
        setMode,
        setShowPassword,
        showPassword,
        submitting,
        updateField,
    };
}

function friendlyError(error, isRegister) {
    if (error?.status === 401) return 'E-mail ou senha não conferem.';
    if (error?.status === 409) return 'Já existe uma conta com este e-mail.';
    if (error?.status === 403 && error?.message) return error.message;
    if (error?.status === 400 && error?.message) return error.message;
    return isRegister ? 'Não foi possível criar sua conta agora.' : 'Não foi possível entrar agora.';
}
