import { useMemo, useState } from 'react';
import { CalendarCheck, CalendarDays, LockKeyhole, ShieldCheck, UserRoundCheck } from 'lucide-react';

import { AppShell } from '@/shared/components/AppShell';
import { Toast } from '@/shared/components/Toast';

import { AuthPage } from '@/pages/Auth';
import { LandingPage } from '@/pages/Landing';

import { PatientDashboard } from '@/pages/PatientDashboard';

import { PsychologistAgendaPage } from '@/pages/PsychologistAgenda';
import { PsychologistDashboard } from '@/pages/PsychologistDashboard';

import { useAuthSession } from '@/modules/auth';

export default function App() {

    const {
        activeView,
        auth,
        handleAuthenticated,
        handleLogout,
        role,
        setActiveView,
        setShowAuth,
        showAuth,
    } = useAuthSession();

    const [toast, setToast] = useState(null);

    // MENU
    const menuItems = useMemo(() => {

        if (role === 'psicologo') {

            return [
                { key: 'dashboard', label: 'Dashboard', icon: CalendarDays },
                { key: 'agenda', label: 'Agenda', icon: CalendarDays },
            ];
        }

        return [
            { key: 'schedule', label: 'Agendar consulta', icon: UserRoundCheck },
            { key: 'appointments', label: 'Minhas consultas', icon: CalendarCheck },
        ];

    }, [role]);

    const areaLabel = role === 'psicologo' ? 'Gestão do Psicólogo' : 'Área do Paciente';
    const topBarSubtitle = role === 'psicologo'
        ? 'Gerencie sua disponibilidade, consultas e rotina clínica.'
        : 'Agende consultas e acompanhe seus próximos atendimentos.';
    const profileLine = auth?.user?.crp ? `${auth.user.cargo} · ${auth.user.crp}` : auth?.user?.cargo;

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
                activeView={activeView}
                adminSection={role === 'admin' ? {
                    icon: ShieldCheck,
                    label: 'Acesso exclusivo do administrador',
                    actionLabel: 'Gerenciar acessos',
                } : null}
                areaLabel={areaLabel}
                menuItems={menuItems}
                onNavigate={setActiveView}
                onLogout={handleLogout}
                profileLine={profileLine}
                securityBanner={{
                    icon: <LockKeyhole size={22} />,
                    label: 'Ambiente seguro',
                    message: 'Seus dados clínicos são protegidos e acessados apenas por perfis autorizados.',
                }}
                topBarSubtitle={topBarSubtitle}
                userName={auth.user.nome}
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
