import { useState } from 'react';
import {
    clearAuthSession,
    getStoredAuthSession,
    storeAuthSession,
} from '@/modules/auth/utils/auth.utils';

export function useAuthSession() {
    const [auth, setAuth] = useState(() => getStoredAuthSession());
    const [showAuth, setShowAuth] = useState(false);
    const [activeView, setActiveView] = useState(() =>
        getInitialView(getStoredAuthSession()?.tipo)
    );

    const role = auth?.tipo;

    function handleAuthenticated(session) {
        storeAuthSession(session);
        setAuth(session);
        setActiveView(getInitialView(session.tipo));
    }

    function handleLogout() {
        clearAuthSession();
        setAuth(null);
        setShowAuth(false);
        setActiveView(null);
    }

    return {
        activeView,
        auth,
        handleAuthenticated,
        handleLogout,
        role,
        setActiveView,
        setShowAuth,
        showAuth,
    };
}

function getInitialView(role) {
    if (role === 'psicologo') return 'agenda';
    if (role === 'paciente') return 'schedule';
    return null;
}
