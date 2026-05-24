import { useMemo, useState } from 'react';
import { AdminPsychologistsPage } from '@/pages/AdminPsychologists';
import { AuthPage } from '@/pages/Auth';
import { LandingPage } from '@/pages/Landing';
import { PatientDashboard } from '@/pages/PatientDashboard';
import { PatientEmotionPage } from '@/pages/PatientEmotion';
import { PatientProfilePage } from '@/pages/PatientProfile';
import { PatientsManagementPage } from '@/pages/PatientsManagement';
import { PsychologistAgendaPage } from '@/pages/PsychologistAgenda';
import { PsychologistDashboard } from '@/pages/PsychologistDashboard';
import { PsychologistProfilePage } from '@/pages/PsychologistProfile';
import { PsychologistRegisterPage } from '@/pages/PsychologistRegister';
import { ReportsPage } from '@/pages/Reports';
import { AppShell } from '@/shared/components/AppShell';
import { Toast } from '@/shared/components/Toast';
import {
    clearAuthSession,
    getStoredAuthSession,
    storeAuthSession,
} from '@/modules/auth';

export default function App() {
    const [auth, setAuth] = useState(() => getStoredAuthSession());
    const [activeView, setActiveView] = useState(() =>
        getInitialView(getStoredAuthSession()?.tipo)
    );
    const [publicView, setPublicView] = useState('landing');
    const [authMode, setAuthMode] = useState('login');
    const [authType, setAuthType] = useState('paciente');
    const [toast, setToast] = useState(null);
    const [preselectedPatient, setPreselectedPatient] = useState(null);

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
        setPublicView('landing');
    }

    function handleLogout() {
        clearAuthSession();
        setAuth(null);
        setActiveView(null);
        setPublicView('landing');
    }

    if (!auth) {
        if (publicView === 'psychologist-register') {
            return (
                <>
                    <PsychologistRegisterPage
                        onAuthenticated={handleAuthenticated}
                        onBack={() => setPublicView('landing')}
                        onToast={setToast}
                    />
                    <Toast
                        toast={toast}
                        onClose={() => setToast(null)}
                    />
                </>
            );
        }

        if (publicView === 'auth') {
            return (
                <>
                    <AuthPage
                        onAuthenticated={handleAuthenticated}
                        onToast={setToast}
                        initialMode={authMode}
                        initialTipo={authType}
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
                <LandingPage
                    onLogin={() => {
                        setAuthMode('login');
                        setPublicView('auth');
                    }}
                    onRegister={(tipo) => {
                        if (tipo === 'psicologo') {
                            setPublicView('psychologist-register');
                            return;
                        }
                        setAuthMode('register');
                        setAuthType(tipo);
                        setPublicView('auth');
                    }}
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
                            <PatientsManagementPage
                                onToast={setToast}
                                onSelectPatient={(id) => {
                                    setPreselectedPatient(id);
                                    setActiveView('reports');
                                }}
                            />
                        )}

                        {activeView === 'reports' && (
                            <ReportsPage onToast={setToast} initialPatientId={preselectedPatient} />
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
