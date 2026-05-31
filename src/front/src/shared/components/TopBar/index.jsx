import { CalendarDays, CircleHelp } from 'lucide-react';
import { NotificacoesDropdown } from '@/shared/components/NotificacoesDropdown';

export function TopBar({ user, role }) {
  const subtitle = role === 'admin'
    ? 'Controle acesso de psicologos sem abrir dados clinicos.'
    : role === 'psicologo'
      ? 'Gerencie sua disponibilidade, consultas e rotina clinica.'
      : 'Agende consultas e acompanhe seus proximos atendimentos.';
  const today = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="topbar">
      <div>
        <h1>Ola, {user.nome}!</h1>
        <p>{subtitle}</p>
      </div>

      <div className="topbar__actions">
        <NotificacoesDropdown />
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
