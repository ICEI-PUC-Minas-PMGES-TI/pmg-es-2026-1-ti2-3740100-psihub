import { useMemo, useState } from 'react';
import { AppShell } from './components/AppShell.jsx';
import { AdminPsychologistsPage } from './features/admin/AdminPsychologistsPage.jsx';
import { AuthPage } from './features/auth/AuthPage.jsx';
import { PatientDashboard } from './features/patient/PatientDashboard.jsx';
import { PatientEmotionPage } from './features/patient/PatientEmotionPage.jsx';
import { PatientProfilePage } from './features/patient/PatientProfilePage.jsx';
import { PsychologistAgendaPage } from './features/psychologist/PsychologistAgendaPage.jsx';
import { PsychologistDashboard } from './features/psychologist/PsychologistDashboard.jsx';
import { PsychologistProfilePage } from './features/psychologist/PsychologistProfilePage.jsx';
import { PatientsManagementPage } from './features/psychologist/PatientsManagementPage.jsx';
import { ReportsPage } from './features/psychologist/ReportsPage.jsx';
import { Toast } from './components/Toast.jsx';
import {
    clearAuthSession,
    getStoredAuthSession,
    storeAuthSession,
} from './utils/auth.js';

export default function App() {
    const [auth, setAuth] = useState(() => getStoredAuthSession());
    const [activeView, setActiveView] = useState(() =>
        getInitialView(getStoredAuthSession()?.tipo)
    );
    const [toast, setToast] = useState(null);

    const role = auth?.tipo;

    const menuItems = useMemo(() => {
        if (role === 'admin') {
            return [{ key: 'admin-psychologists', label: 'Psicologos' }];
        }

        if (role === 'psicologo') {
            return [
                { key: 'dashboard', label: 'Dashboard' },
                { key: 'agenda', label: 'Agenda' },
                { key: 'patients', label: 'Pacientes' },
                { key: 'reports', label: 'Relatorios' },
                { key: 'psychologist-profile', label: 'Perfil Profissional' },
            ];
        }

        return [
            { key: 'schedule', label: 'Agendar consulta' },
            { key: 'appointments', label: 'Minhas consultas' },
            { key: 'emotions', label: 'Registro emocional' },
            { key: 'patient-profile', label: 'Perfil' },
        ];
    }, [role]);

    function handleAuthenticated(session) {
        storeAuthSession(session);
        setAuth(session);
        setActiveView(getInitialView(session.tipo));
    }

    function handleLogout() {
        clearAuthSession();
        setAuth(null);
        setActiveView(null);
    }

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
                {role === 'admin' ? (
                    <AdminPsychologistsPage onToast={setToast} />
                ) : role === 'psicologo' ? (
                    <>
                        {activeView === 'agenda' && (
                            <PsychologistAgendaPage onToast={setToast} />
                        )}

                        {activeView === 'dashboard' && (
                            <PsychologistDashboard
                                onToast={setToast}
                                onNavigate={setActiveView}
                            />
                        )}

                        {activeView === 'psychologist-profile' && (
                            <PsychologistProfilePage onToast={setToast} />
                        )}

                        {activeView === 'patients' && (
                            <PatientsManagementPage onToast={setToast} />
                        )}

                        {activeView === 'reports' && (
                            <ReportsPage onToast={setToast} />
                        )}
                    </>
                ) : (
                    <>
                        {(activeView === 'schedule' || activeView === 'appointments') && (
                            <PatientDashboard
                                activeView={activeView}
                                patientName={auth.user.nome}
                                onNavigate={setActiveView}
                                onToast={setToast}
                            />
                        )}
                        {activeView === 'emotions' && <PatientEmotionPage onToast={setToast} />}
                        {activeView === 'patient-profile' && <PatientProfilePage onToast={setToast} />}
                    </>
                )}
            </AppShell>

            <Toast
                toast={toast}
                onClose={() => setToast(null)}
            />
        </>
    );
}

function getInitialView(role) {
    if (role === 'admin') return 'admin-psychologists';
    if (role === 'psicologo') return 'agenda';
    if (role === 'paciente') return 'schedule';
    return null;
}
