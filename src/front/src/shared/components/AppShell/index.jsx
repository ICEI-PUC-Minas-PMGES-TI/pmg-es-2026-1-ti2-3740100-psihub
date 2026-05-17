import { LockKeyhole } from 'lucide-react';
import { Sidebar } from '@/shared/components/Sidebar';
import { TopBar } from '@/shared/components/TopBar';

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

                    <section className="security-banner" aria-label="Seguranca dos dados">
                        <LockKeyhole size={22} />
                        <div>
                            <strong>Ambiente seguro</strong>
                            <span>Seus dados clinicos sao protegidos e acessados apenas por perfis autorizados.</span>
                        </div>
                    </section>
                </div>

            </main>
        </div>
    );
}
