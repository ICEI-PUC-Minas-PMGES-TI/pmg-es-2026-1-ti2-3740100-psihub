import { useMemo, useState } from 'react';
import { AppShell } from './components/AppShell.jsx';
import { AuthPage } from './features/auth/AuthPage.jsx';
import { PatientDashboard } from './features/patient/PatientDashboard.jsx';
import { PsychologistDashboard } from './features/psychologist/PsychologistDashboard.jsx';
import { Toast } from './components/Toast.jsx';
import { clearAuthSession, getStoredAuthSession, storeAuthSession } from './utils/auth.js';

export default function App() {
  const [auth, setAuth] = useState(() => getStoredAuthSession());
  const [activeView, setActiveView] = useState(() => getInitialView(getStoredAuthSession()?.tipo));
  const [toast, setToast] = useState(null);

  const role = auth?.tipo;
  const menuItems = useMemo(() => {
    if (role === 'psicologo') {
      return [
        { key: 'availability', label: 'Disponibilidade' },
        { key: 'agenda', label: 'Agenda' },
      ];
    }

    return [
      { key: 'schedule', label: 'Agendar consulta' },
      { key: 'appointments', label: 'Minhas consultas' },
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
          <PsychologistDashboard activeView={activeView} onToast={setToast} />
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

function getInitialView(role) {
  if (role === 'psicologo') return 'availability';
  if (role === 'paciente') return 'schedule';
  return null;
}
