import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '@/shared/components/AppShell';
import { AuthRoute } from '@/shared/components/AuthRoute';
import { PrivateRoute } from '@/shared/components/PrivateRoute';
import { Toast } from '@/shared/components/Toast';
import {
    clearAuthSession,
    getMenuItems,
    getStoredAuthSession,
    storeAuthSession,
} from '@/modules/auth';
import { trackUiEvent } from '@/shared/utils/metrics.utils';

const AdminPsychologistsPage = lazy(() => import('@/pages/AdminPsychologists').then(m => ({ default: m.AdminPsychologistsPage })));
const AuthPage = lazy(() => import('@/pages/Auth').then(m => ({ default: m.AuthPage })));
const LandingPage = lazy(() => import('@/pages/Landing').then(m => ({ default: m.LandingPage })));
const PatientDashboard = lazy(() => import('@/pages/PatientDashboard').then(m => ({ default: m.PatientDashboard })));
const PatientEmotionPage = lazy(() => import('@/pages/PatientEmotion').then(m => ({ default: m.PatientEmotionPage })));
const PatientProfilePage = lazy(() => import('@/pages/PatientProfile').then(m => ({ default: m.PatientProfilePage })));
const PatientsManagementPage = lazy(() => import('@/pages/PatientsManagement').then(m => ({ default: m.PatientsManagementPage })));
const PsychologistAgendaPage = lazy(() => import('@/pages/PsychologistAgenda').then(m => ({ default: m.PsychologistAgendaPage })));
const PsychologistDashboard = lazy(() => import('@/pages/PsychologistDashboard').then(m => ({ default: m.PsychologistDashboard })));
const PsychologistProfilePage = lazy(() => import('@/pages/PsychologistProfile').then(m => ({ default: m.PsychologistProfilePage })));
const PsychologistRegisterPage = lazy(() => import('@/pages/PsychologistRegister').then(m => ({ default: m.PsychologistRegisterPage })));
const ReportsPage = lazy(() => import('@/pages/Reports').then(m => ({ default: m.ReportsPage })));
const PsychologistFinancialPage = lazy(() => import('@/pages/PsychologistFinancial').then(m => ({ default: m.PsychologistFinancialPage })));
const PatientPaymentsPage = lazy(() => import('@/pages/PatientPayments').then(m => ({ default: m.PatientPaymentsPage })));

const PATIENT_APPOINTMENTS_SEARCH = '?view=consultas';

const ROUTES_BY_VIEW = {
    schedule: '/paciente/dashboard',
    appointments: `/paciente/dashboard${PATIENT_APPOINTMENTS_SEARCH}`,
    emotions: '/paciente/emocoes',
    'patient-profile': '/paciente/perfil',
    dashboard: '/psicologo/dashboard',
    agenda: '/psicologo/agenda',
    patients: '/psicologo/pacientes',
    pacientes: '/psicologo/pacientes',
    reports: '/psicologo/relatorios',
    relatorios: '/psicologo/relatorios',
    'psychologist-profile': '/psicologo/perfil',
    perfil: '/psicologo/perfil',
    notificacoes: '/psicologo/pacientes',
    'admin-psychologists': '/admin/psicologos',
    psicologos: '/admin/psicologos',
    financeiro: '/psicologo/financeiro',
    'meus-pagamentos': '/paciente/pagamentos',
};

export default function App() {
    const [auth, setAuth] = useState(() => getStoredAuthSession());
    const [toast, setToast] = useState(null);
    const [preselectedPatient, setPreselectedPatient] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const lastTrackedRoute = useRef('');

    const session = auth || getStoredAuthSession();
    const role = normalizeRole(session?.tipo);
    const menuItems = useMemo(() => getMenuItems(role), [role]);

    useEffect(() => {
        const routeKey = `${role || 'public'}:${location.pathname}${location.search}`;
        if (lastTrackedRoute.current === routeKey) return;
        lastTrackedRoute.current = routeKey; // Evita duplicar evento de rota em StrictMode/hot reload.
        trackUiEvent('route_change', { role: role || 'public', path: location.pathname, search: location.search || undefined }); // Registra navegacao para medir abandono e uso por perfil sem depender de ferramenta externa.
    }, [location.pathname, location.search, role]);

    function handleAuthenticated(session) {
        storeAuthSession(session);
        setAuth(session);
        navigate(getDefaultRoute(session.tipo), { replace: true });
    }

    function handleLogout() {
        clearAuthSession();
        setAuth(null);
        navigate('/', { replace: true });
    }

    function navigateByView(view) {
        navigate(ROUTES_BY_VIEW[view] || getDefaultRoute(role));
    }

    function renderShell(activeView, children) {
        const session = auth || getStoredAuthSession();

        if (!session) {
            return <Navigate to="/auth/login" replace />;
        }

        return (
            <AppShell
                user={session.user}
                role={normalizeRole(session.tipo)}
                menuItems={menuItems}
                activeView={activeView}
                onNavigate={navigateByView}
                onLogout={handleLogout}
            >
                {children}
            </AppShell>
        );
    }

    return (
        <>
            <Suspense fallback={<div className="page-loading-fallback" aria-hidden="true" />}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route
                        path="/auth/login"
                        element={(
                            <AuthRoute
                                session={session}
                                redirectTo={getDefaultRoute(session?.tipo)}
                            >
                                <AuthPage
                                    key="login-paciente"
                                    onAuthenticated={handleAuthenticated}
                                    onToast={setToast}
                                    initialMode="login"
                                    initialTipo="paciente"
                                />
                            </AuthRoute>
                        )}
                    />
                    <Route
                        path="/auth/cadastro/paciente"
                        element={(
                            <AuthRoute
                                session={session}
                                redirectTo={getDefaultRoute(session?.tipo)}
                            >
                                <AuthPage
                                    key="register-paciente"
                                    onAuthenticated={handleAuthenticated}
                                    onToast={setToast}
                                    initialMode="register"
                                    initialTipo="paciente"
                                />
                            </AuthRoute>
                        )}
                    />
                    <Route
                        path="/auth/cadastro/psicologo"
                        element={(
                            <AuthRoute
                                session={session}
                                redirectTo={getDefaultRoute(session?.tipo)}
                            >
                                <PsychologistRegisterRoute
                                    onAuthenticated={handleAuthenticated}
                                    onToast={setToast}
                                />
                            </AuthRoute>
                        )}
                    />

                    <Route
                        path="/paciente/dashboard"
                        element={(
                            <PrivateRoute session={session} allowedRoles={['paciente']}>
                                <PatientDashboardRoute
                                    auth={auth}
                                    onNavigate={navigateByView}
                                    onToast={setToast}
                                    renderShell={renderShell}
                                />
                            </PrivateRoute>
                        )}
                    />
                    <Route
                        path="/paciente/emocoes"
                        element={(
                            <PrivateRoute session={session} allowedRoles={['paciente']}>
                                {renderShell('emotions', <PatientEmotionPage onToast={setToast} />)}
                            </PrivateRoute>
                        )}
                    />
                    <Route
                        path="/paciente/pagamentos"
                        element={(
                            <PrivateRoute session={session} allowedRoles={['paciente']}>
                                {renderShell('meus-pagamentos', <PatientPaymentsPage onToast={setToast} />)}
                            </PrivateRoute>
                        )}
                    />
                    <Route
                        path="/paciente/perfil"
                        element={(
                            <PrivateRoute session={session} allowedRoles={['paciente']}>
                                {renderShell('patient-profile', <PatientProfilePage onToast={setToast} />)}
                            </PrivateRoute>
                        )}
                    />

                    <Route
                        path="/psicologo/dashboard"
                        element={(
                            <PrivateRoute session={session} allowedRoles={['psicologo']}>
                                {renderShell(
                                    'dashboard',
                                    <PsychologistDashboard activeView="dashboard" onToast={setToast} onNavigate={navigateByView} />,
                                )}
                            </PrivateRoute>
                        )}
                    />
                    <Route
                        path="/psicologo/agenda"
                        element={(
                            <PrivateRoute session={session} allowedRoles={['psicologo']}>
                                {renderShell('agenda', <PsychologistAgendaPage onToast={setToast} />)}
                            </PrivateRoute>
                        )}
                    />
                    <Route
                        path="/psicologo/pacientes"
                        element={(
                            <PrivateRoute session={session} allowedRoles={['psicologo']}>
                                {renderShell(
                                    'patients',
                                    <PatientsManagementPage
                                        onToast={setToast}
                                        onSelectPatient={(id) => {
                                            setPreselectedPatient(id);
                                            navigate('/psicologo/relatorios');
                                        }}
                                    />,
                                )}
                            </PrivateRoute>
                        )}
                    />
                    <Route
                        path="/psicologo/relatorios"
                        element={(
                            <PrivateRoute session={session} allowedRoles={['psicologo']}>
                                {renderShell('reports', <ReportsPage onToast={setToast} initialPatientId={preselectedPatient} />)}
                            </PrivateRoute>
                        )}
                    />
                    <Route
                        path="/psicologo/financeiro"
                        element={(
                            <PrivateRoute session={session} allowedRoles={['psicologo']}>
                                {renderShell('financeiro', <PsychologistFinancialPage onToast={setToast} />)}
                            </PrivateRoute>
                        )}
                    />
                    <Route
                        path="/psicologo/perfil"
                        element={(
                            <PrivateRoute session={session} allowedRoles={['psicologo']}>
                                {renderShell('psychologist-profile', <PsychologistProfilePage onToast={setToast} />)}
                            </PrivateRoute>
                        )}
                    />

                    <Route
                        path="/admin/psicologos"
                        element={(
                            <PrivateRoute session={session} allowedRoles={['admin']}>
                                {renderShell('admin-psychologists', <AdminPsychologistsPage onToast={setToast} />)}
                            </PrivateRoute>
                        )}
                    />

                    <Route path="/forbidden" element={<ForbiddenPage auth={auth} />} />
                    <Route path="*" element={<Navigate to={auth ? getDefaultRoute(auth.tipo) : '/'} replace />} />
                </Routes>
            </Suspense>

            <Toast
                toast={toast}
                onClose={() => setToast(null)}
            />
        </>
    );
}

function PsychologistRegisterRoute({ onAuthenticated, onToast }) {
    const navigate = useNavigate();

    return (
        <PsychologistRegisterPage
            onAuthenticated={onAuthenticated}
            onToast={onToast}
            onBack={() => navigate('/')}
        />
    );
}

function PatientDashboardRoute({ auth, onNavigate, onToast, renderShell }) {
    const location = useLocation();
    const activeView = location.search === PATIENT_APPOINTMENTS_SEARCH ? 'appointments' : 'schedule';
    const session = auth || getStoredAuthSession();

    return renderShell(
        activeView,
        <PatientDashboard
            activeView={activeView}
            patientName={session?.user?.nome}
            onNavigate={onNavigate}
            onToast={onToast}
        />,
    );
}

function ForbiddenPage({ auth }) {
    const session = auth || getStoredAuthSession();

    return (
        <main className="auth-page">
            <section className="auth-panel">
                <div className="auth-panel__intro">
                    <div className="brand-mark" aria-hidden="true"></div>
                    <h1>Acesso negado</h1>
                    <p>Seu perfil não tem permissão para acessar esta página.</p>
                </div>
                <Link className="primary-button" to={session ? getDefaultRoute(session.tipo) : '/auth/login'}>
                    Voltar
                </Link>
            </section>
        </main>
    );
}

function getDefaultRoute(role) {
    const normalized = normalizeRole(role);

    if (normalized === 'admin') return '/admin/psicologos';
    if (normalized === 'psicologo') return '/psicologo/dashboard';
    if (normalized === 'paciente') return '/paciente/dashboard';
    return '/';
}

function normalizeRole(role = '') {
    return String(role || '').toLowerCase();
}
