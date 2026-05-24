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

const PSYCHOLOGIST_PENDING_MESSAGE = 'Seu cadastro foi recebido! Aguarde a aprovação do administrador. Você receberá acesso após a análise do seu perfil.';

export function useAuthForm({ onAuthenticated, onToast, initialMode = 'login', initialTipo = 'paciente' }) {
    const [mode, setMode] = useState(initialMode);
    const [form, setForm] = useState({ ...initialForm, tipo: initialTipo });
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isRegister = mode === 'register';
    const passwordTooShort = form.senha.length > 0 && form.senha.length < 8;

    async function handleSubmit(event) {
        event.preventDefault();
        setConfirmationMessage('');

        if (form.senha.length < 8) {
            onToast({ type: 'error', message: 'A senha precisa ter pelo menos 8 caracteres.' });
            return;
        }

        if (isRegister && form.senha !== form.confirmarSenha) {
            onToast({ type: 'error', message: 'A confirmação de senha não confere.' });
            return;
        }

        if (isRegister && form.tipo === 'paciente' && !form.dataNascimento) {
            onToast({ type: 'error', message: 'Informe sua data de nascimento para criar a conta.' });
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
                    tipo: form.tipo,
                    ...(form.tipo === 'paciente' ? { dataNascimento: form.dataNascimento } : {}),
                }
                : { email: form.email, senha: form.senha };
            const response = isRegister ? await authApi.register(payload) : await authApi.login(payload);

            if (!response?.token) {
                if (isRegister && form.tipo === 'psicologo') {
                    setConfirmationMessage(PSYCHOLOGIST_PENDING_MESSAGE);
                    onToast?.({ type: 'success', message: PSYCHOLOGIST_PENDING_MESSAGE });
                    return;
                }

                onToast({ type: 'error', message: isRegister ? 'Não foi possível criar sua conta agora.' : 'Não foi possível entrar agora.' });
                return;
            }

            const tokenPayload = decodeJwtPayload(response.token);

            if (!tokenPayload) {
                onToast({ type: 'error', message: isRegister ? 'Não foi possível criar sua conta agora.' : 'Não foi possível entrar agora.' });
                return;
            }

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
        setConfirmationMessage('');
        setForm((current) => ({ ...current, [field]: value }));
    }

    return {
        form,
        confirmationMessage,
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
