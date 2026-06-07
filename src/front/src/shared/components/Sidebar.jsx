import { BarChart2, CalendarCheck, CalendarDays, ClipboardList, HeartPulse, LogOut, ShieldCheck, User, UserRoundCheck, Users } from 'lucide-react';

const icons = {
    agenda: CalendarDays,
    dashboard: ClipboardList,
    schedule: UserRoundCheck,
    appointments: CalendarCheck,
    patients: Users,
    reports: BarChart2,
    emotions: HeartPulse,
    'patient-profile': User,
    'psychologist-profile': User,
    'admin-psychologists': ShieldCheck,
};

export function Sidebar({ collapsed, role, user, menuItems, activeView, onNavigate, onLogout }) {
    const roleLabel = role === 'admin' ? 'Administracao' : role === 'psicologo' ? 'Gestao do Psicologo' : 'Area do Paciente';
    const initials = getInitials(user?.nome);
    const profileLine = user?.crp ? `${user.cargo} - ${user.crp}` : user?.cargo;

    return (
        <aside className={collapsed ? 'sidebar sidebar--collapsed' : 'sidebar'} aria-label="Menu principal">
            <div className="sidebar__brand">
                <div className="brand-mark" aria-hidden="true">
                    <ShieldCheck size={20} />
                </div>
                {!collapsed && (
                    <div>
                        <strong>PsiHub</strong>
                        <span>{roleLabel}</span>
                    </div>
                )}
            </div>

            <nav className="sidebar__nav">
                {menuItems.map((item) => {
                    const Icon = icons[item.key] || CalendarDays;
                    const active = item.key === activeView;

                    return (
                        <button
                            className={active ? 'sidebar__link sidebar__link--active' : 'sidebar__link'}
                            type="button"
                            key={item.key}
                            onClick={() => onNavigate(item.key)}
                            aria-current={active ? 'page' : undefined}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={18} />
                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {role === 'admin' && !collapsed && (
                <section className="sidebar__admin" aria-label="Administracao">
                    <span>Acesso exclusivo do administrador</span>
                    <button className="sidebar__admin-item" type="button" onClick={() => onNavigate('admin-psychologists')}>
                        <ShieldCheck size={18} />
                        <span>Gerenciar acessos</span>
                    </button>
                </section>
            )}

            <div className="sidebar__footer">
                <div className="sidebar__user">
                    <div className="sidebar__avatar" aria-hidden="true">
                        {initials}
                        <span className="sidebar__status-dot" />
                    </div>
                    {!collapsed && (
                        <div>
                            <strong>{user?.nome}</strong>
                            <span>{profileLine}</span>
                        </div>
                    )}
                </div>

                <button className="sidebar__logout" type="button" onClick={onLogout}>
                    <LogOut size={18} />
                    {!collapsed && <span>Sair</span>}
                </button>
            </div>
        </aside>
    );
}

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}
