import { LockKeyhole, Plus } from 'lucide-react';
import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';

export function AppShell({ user, role, menuItems, activeView, onNavigate, onLogout, children }) {
  return (
    <div className="app-shell">
      <Sidebar
        collapsed={false}
        role={role}
        user={user}
        menuItems={menuItems}
        activeView={activeView}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="app-main">
        <TopBar user={user} role={role} />
        <div className="content-area">
          {children}

          <section className="security-banner" aria-label="Segurança dos dados">
            <LockKeyhole size={22} />
            <div>
              <strong>Ambiente seguro</strong>
              <span>Seus dados clínicos são protegidos e acessados apenas por perfis autorizados.</span>
            </div>
          </section>
        </div>

        <button
          className="fab"
          type="button"
          aria-label={role === 'psicologo' ? 'Adicionar horário' : 'Agendar consulta'}
          onClick={() => onNavigate(role === 'psicologo' ? 'agenda' : 'schedule')}
        >
          <Plus size={24} />
        </button>
      </main>
    </div>
  );
}
