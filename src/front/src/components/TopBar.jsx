import { Bell, CalendarDays, CircleHelp } from 'lucide-react';

export function TopBar({ user, role }) {
  const subtitle = role === 'psicologo'
    ? 'Gerencie sua disponibilidade, consultas e rotina clínica.'
    : 'Agende consultas e acompanhe seus próximos atendimentos.';
  const today = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="topbar">
      <div>
        <h1>Olá, {user.nome}! 👋</h1>
        <p>{subtitle}</p>
      </div>

      <div className="topbar__actions">
        <button className="topbar__icon-button" type="button" aria-label="Notificações">
          <Bell size={24} />
        </button>
        <button className="topbar__icon-button" type="button" aria-label="Ajuda">
          <CircleHelp size={24} />
        </button>
        <div className="date-selector" aria-label="Data atual">
          <CalendarDays size={18} />
          <span>{today}</span>
        </div>
      </div>
    </header>
  );
}
