import { CalendarDays, LogOut, ShieldCheck } from 'lucide-react';

export function Sidebar({
    activeView,
    adminSection,
    areaLabel,
    collapsed,
    menuItems,
    onLogout,
    onNavigate,
    profileLine,
    userName,
}) {
    const initials = getInitials(userName);

    return (
        <aside className={collapsed ? 'sidebar sidebar--collapsed' : 'sidebar'} aria-label="Menu principal">
            <div className="sidebar__brand">
                <div className="brand-mark" aria-hidden="true">
                    <ShieldCheck size={20} />
                </div>
                {!collapsed && (
                    <div>
                        <strong>PsiHub</strong>
                        <span>{areaLabel}</span>
                    </div>
                )}
            </div>

            <nav className="sidebar__nav">
                {menuItems.map((item) => {
                    const Icon = item.icon || CalendarDays;
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

            {adminSection && !collapsed && (
                <section className="sidebar__admin" aria-label={adminSection.label}>
                    <span>{adminSection.label}</span>
                    <button className="sidebar__admin-item" type="button">
                        {adminSection.icon ? <adminSection.icon size={18} /> : <ShieldCheck size={18} />}
                        <span>{adminSection.actionLabel}</span>
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
                            <strong>{userName}</strong>
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
