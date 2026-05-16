import { useMemo, useState } from 'react';

import { AppShell } from './components/AppShell.jsx';
import { Toast } from './components/Toast.jsx';

import { AuthPage } from './features/auth/AuthPage.jsx';
import { LandingPage } from './features/auth/LandingPage.jsx';

import { PatientDashboard } from './features/patient/PatientDashboard.jsx';

import { PsychologistAgendaPage } from './features/psychologist/PsychologistAgendaPage.jsx';
import { PsychologistDashboard } from './features/psychologist/PsychologistDashboard.jsx';

import {
    clearAuthSession,
    getStoredAuthSession,
    storeAuthSession
} from './utils/auth.js';

export default function App() {

    const [auth, setAuth] = useState(() => getStoredAuthSession());

    const [showAuth, setShowAuth] = useState(false);

    const [activeView, setActiveView] = useState(() =>
        getInitialView(getStoredAuthSession()?.tipo)
    );

    const [toast, setToast] = useState(null);

    const role = auth?.tipo;

    // MENU
    const menuItems = useMemo(() => {

        if (role === 'psicologo') {

            return [
                { key: 'dashboard', label: 'Dashboard' },
                { key: 'agenda', label: 'Agenda' },
            ];
        }

        return [
            { key: 'schedule', label: 'Agendar consulta' },
            { key: 'appointments', label: 'Minhas consultas' },
        ];

    }, [role]);

    // LOGIN
    function handleAuthenticated(session) {

        storeAuthSession(session);

        setAuth(session);

        setActiveView(getInitialView(session.tipo));
    }

    // LOGOUT
    function handleLogout() {

        clearAuthSession();

        setAuth(null);

        setShowAuth(false);

        setActiveView(null);
    }

    // LANDING PAGE
    if (!auth && !showAuth) {

        return (
            <>
                <LandingPage
                    onLogin={() => setShowAuth(true)}
                    onRegister={() => setShowAuth(true)}
                />

                <Toast
                    toast={toast}
                    onClose={() => setToast(null)}
                />
            </>
        );
    }

    // LOGIN / CADASTRO
    if (!auth) {

        return (
            <>
                <AuthPage
                    onAuthenticated={handleAuthenticated}
                    onToast={setToast}
                />

                <Toast
                    toast={toast}
                    onClose={() => setToast(null)}
                />
            </>
        );
    }

    // SISTEMA
    return (
        <>
            <AppShell
                user={auth.user}
                role={role}
                menuItems={menuItems}
                activeView={activeView}
                onNavigate={setActiveView}
                onLogout={handleLogout}
            >

                {role === 'psicologo' ? (

                    <>
                        {activeView === 'agenda' && (
                            <PsychologistAgendaPage
                                onToast={setToast}
                            />
                        )}

                        {activeView === 'dashboard' && (
                            <PsychologistDashboard
                                onToast={setToast}
                            />
                        )}
                    </>

                ) : (

                    <PatientDashboard
                        activeView={activeView}
                        patientName={auth.user.nome}
                        onNavigate={setActiveView}
                        onToast={setToast}
                    />
                )}
            </AppShell>

            <Toast
                toast={toast}
                onClose={() => setToast(null)}
            />
        </>
    );
}

// TELA INICIAL
function getInitialView(role) {

    if (role === 'psicologo') return 'agenda';

    if (role === 'paciente') return 'schedule';

    return null;
}