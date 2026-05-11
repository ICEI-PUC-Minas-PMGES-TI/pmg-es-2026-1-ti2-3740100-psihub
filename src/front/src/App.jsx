import { useMemo, useState } from 'react';
import { AppShell } from './components/AppShell.jsx';
import { AuthPage } from './features/auth/AuthPage.jsx';
import { PatientDashboard } from './features/patient/PatientDashboard.jsx';
import { PsychologistAgendaPage } from './features/psychologist/PsychologistAgendaPage.jsx';
import { Toast } from './components/Toast.jsx';
import { clearAuthSession, getStoredAuthSession, storeAuthSession } from './utils/auth.js';
import { PsychologistDashboard } from './features/psychologist/PsychologistDashboard.jsx';

export default function App() {
    const [auth, setAuth] = useState(() => getStoredAuthSession());
    const [activeView, setActiveView] = useState(() => getInitialView(getStoredAuthSession()?.tipo));
    const [toast, setToast] = useState(null);

    const role = auth?.tipo;

    // Define os itens de menu com base no tipo de usuário
    const menuItems = useMemo(() => {

        if (role === 'psicologo') {
            // Menu do psicólogo
            return [
                { key: 'dashboard', label: 'Dashboard' },
                { key: 'agenda', label: 'Agenda' },
            ];
        }

        return [
            // Menu do paciente
            { key: 'schedule', label: 'Agendar consulta' },
            { key: 'appointments', label: 'Minhas consultas' },
        ];
    }, [role]);


    // Função para lidar com autenticação bem-sucedida
    function handleAuthenticated(session) {
        storeAuthSession(session);
        setAuth(session);
        setActiveView(getInitialView(session.tipo));
    }

    // Função para lidar com logout
    function handleLogout() {
        clearAuthSession();
        setAuth(null);
        setActiveView(null);
    }

    if (!auth) {

        // Se não estiver autenticado, mostra a página de login
        return (
            <>
                <AuthPage onAuthenticated={handleAuthenticated} onToast={setToast} />
                <Toast toast={toast} onClose={() => setToast(null)} />
            </>
        );
    }

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

            <Toast toast={toast} onClose={() => setToast(null)} />
        </>
    );
}

// DEFINE A TELA INICIAL

function getInitialView(role) {

    // Tela inicial do psicólogo
    if (role === 'psicologo') return 'agenda';

    // Tela inicial do paciente
    if (role === 'paciente') return 'schedule';
    return null;
}
