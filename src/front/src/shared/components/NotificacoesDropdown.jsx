import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/modules/psicologos/hooks/useNotifications';

function relativeTime(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `há ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `há ${days}d`;
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(dateStr));
}

function truncate(text, max) {
    if (!text || text.length <= max) return text;
    return `${text.slice(0, max)}…`;
}

export function NotificacoesDropdown() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh } = useNotifications();
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return undefined;
        function handleClick(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    function handleToggle() {
        if (!open) refresh();
        setOpen((prev) => !prev);
    }

    const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);
    const visible = notifications.slice(0, 10);

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex' }}>
            <button
                className="topbar__icon-button"
                type="button"
                aria-label="Notificações"
                aria-expanded={open}
                onClick={handleToggle}
                style={{ position: 'relative' }}
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span
                        aria-label={`${unreadCount} notificações não lidas`}
                        style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            minWidth: 18,
                            height: 18,
                            padding: '0 4px',
                            borderRadius: 9999,
                            background: '#EF4444',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 700,
                            lineHeight: '18px',
                            textAlign: 'center',
                            pointerEvents: 'none',
                        }}
                    >
                        {badgeLabel}
                    </span>
                )}
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label="Notificações"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: 340,
                        maxHeight: 420,
                        overflowY: 'auto',
                        background: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: 10,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        zIndex: 9999,
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderBottom: '1px solid #F3F4F6',
                        position: 'sticky',
                        top: 0,
                        background: '#fff',
                    }}>
                        <strong style={{ fontSize: 14 }}>Notificações</strong>
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            style={{
                                fontSize: 12,
                                color: unreadCount === 0 ? '#9CA3AF' : '#0E7490',
                                background: 'none',
                                border: 'none',
                                cursor: unreadCount === 0 ? 'default' : 'pointer',
                                padding: 0,
                                fontWeight: 600,
                            }}
                        >
                            Marcar todas como lidas
                        </button>
                    </div>

                    {/* Body */}
                    {loading ? (
                        <p style={{ padding: '16px', fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
                            Carregando…
                        </p>
                    ) : visible.length === 0 ? (
                        <p style={{ padding: '16px', fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
                            Nenhuma notificação
                        </p>
                    ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {visible.map((n) => (
                                <li key={n.id}>
                                    <button
                                        type="button"
                                        onClick={() => { if (!n.lida) markAsRead(n.id); }}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '12px 16px',
                                            background: n.lida ? 'transparent' : '#F0F9FF',
                                            border: 'none',
                                            borderBottom: '1px solid #F3F4F6',
                                            cursor: n.lida ? 'default' : 'pointer',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: n.lida ? 400 : 700, color: '#111827' }}>
                                                {n.titulo}
                                            </span>
                                            <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', marginLeft: 8 }}>
                                                {relativeTime(n.criadoEm)}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>
                                            {truncate(n.mensagem, 60)}
                                        </p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
