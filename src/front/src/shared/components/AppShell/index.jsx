import { Sidebar } from '@/shared/components/Sidebar';
import { TopBar } from '@/shared/components/TopBar';

export function AppShell({
    activeView,
    adminSection,
    areaLabel,
    children,
    menuItems,
    onLogout,
    onNavigate,
    profileLine,
    securityBanner,
    topBarSubtitle,
    userName,
}) {
    return (
        <div className="app-shell">
            <Sidebar
                activeView={activeView}
                adminSection={adminSection}
                areaLabel={areaLabel}
                collapsed={false}
                menuItems={menuItems}
                onNavigate={onNavigate}
                onLogout={onLogout}
                profileLine={profileLine}
                userName={userName}
            />

            <main className="app-main">
                <TopBar title={`Olá, ${userName}! 👋`} subtitle={topBarSubtitle} />
                <div className="content-area">
                    {children}

                    {securityBanner && (
                        <section className="security-banner" aria-label={securityBanner.label}>
                            {securityBanner.icon}
                            <div>
                                <strong>{securityBanner.label}</strong>
                                <span>{securityBanner.message}</span>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
