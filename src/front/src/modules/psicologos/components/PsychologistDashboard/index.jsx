import { useEffect, useMemo, useRef, useState } from 'react';
import {
    CalendarDays, CalendarPlus, ChevronLeft, ChevronRight,
    Clock3, Loader2, Save, Trash2, X,
    CalendarClock, Users, FolderOpen, BarChart2,
    ChevronRight as ChevronRightIcon, Link2, UserPlus, FileText, ShieldCheck,
    Pencil,
} from 'lucide-react';
import { schedulingApi } from '@/services/scheduling.service';
import { addDays, formatDate, formatDateTime, formatTime, toIsoDate } from '@/shared/utils/date.utils';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';

/* ─── constantes ────────────────────────────────────────────────── */

const days = [
    { value: 'SEGUNDA', label: 'Segunda' },
    { value: 'TERCA', label: 'Terça' },
    { value: 'QUARTA', label: 'Quarta' },
    { value: 'QUINTA', label: 'Quinta' },
    { value: 'SEXTA', label: 'Sexta' },
    { value: 'SABADO', label: 'Sábado' },
    { value: 'DOMINGO', label: 'Domingo' },
];

const statusLabels = {
    DISPONIVEL: 'Disponível',
    RESERVADO: 'Reservado',
    BLOQUEADO: 'Indisponível',
    CANCELADO: 'Removido',
};

const consultationStatusLabels = {
    AGENDADA: 'Agendada',
    CONFIRMADA: 'Confirmada',
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDA: 'Concluída',
    CANCELADA: 'Cancelada',
    FALTOU: 'Faltou',
};

const WEEK_START_HOUR = 7;
const WEEK_END_HOUR = 22;
const WEEK_SLOT_MINUTES = 30;
const LIST_RANGE_DAYS = 60;

const CONSULTATION_RANGE_PAST_DAYS = 90;
const CONSULTATION_RANGE_FUTURE_DAYS = 180;
const ACTIVE_STATUSES = new Set(['AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO']);

/* ─── utilitários ───────────────────────────────────────────────── */

function initials(name = '') {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function timeAgo(isoString) {
    if (!isoString) return '';
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return 'Agora';
    if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Há ${Math.floor(diff / 3600)}h`;
    return `Há ${Math.floor(diff / 86400)} dia(s)`;
}

function consultationBadgeClass(status) {
    const map = {
        AGENDADA: 'psihome__badge--agendada',
        CONFIRMADA: 'psihome__badge--confirmada',
        EM_ANDAMENTO: 'psihome__badge--em_andamento',
        CONCLUIDA: 'psihome__badge--concluida',
        CANCELADA: 'psihome__badge--cancelada',
    };
    return map[status] || 'psihome__badge--default';
}

/* ─── PsychologistHome ──────────────────────────────────────────── */

function PsychologistHome({ onNavigate }) {
    const [consultations, setConsultations] = useState([]);
    const [loadingConsultations, setLoadingC] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const today = new Date();

        schedulingApi.listConsultations({
            inicio: toIsoDate(addDays(today, -CONSULTATION_RANGE_PAST_DAYS)),
            fim: toIsoDate(addDays(today, CONSULTATION_RANGE_FUTURE_DAYS)),
            historico: true,
            signal: controller.signal,
        })
            .then((data) => setConsultations(data || []))
            .catch((err) => { if (err.name !== 'AbortError') console.error(err); })
            .finally(() => setLoadingC(false));

        return () => controller.abort();
    }, []);

    const todayKey = toIsoDate(new Date());
    const currentMonthKey = todayKey.slice(0, 7);
    const lastMonthKey = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return toIsoDate(d).slice(0, 7);
    })();

    /* métricas */
    const todayConsultations = useMemo(() =>
        consultations
            .filter((c) => c.inicioEm.slice(0, 10) === todayKey)
            .sort((a, b) => new Date(a.inicioEm) - new Date(b.inicioEm)),
        [consultations, todayKey]);

    const completedToday = useMemo(() =>
        todayConsultations.filter((c) => c.status === 'CONCLUIDA').length,
        [todayConsultations]);

    const activePatients = useMemo(() => {
        const ids = new Set(consultations.filter((c) => ACTIVE_STATUSES.has(c.status)).map((c) => c.pacienteId));
        return ids.size;
    }, [consultations]);

    const totalPatients = useMemo(() => new Set(consultations.map((c) => c.pacienteId)).size, [consultations]);

    const sessionsThisMonth = useMemo(() =>
        consultations.filter((c) => c.inicioEm.slice(0, 7) === currentMonthKey && c.status === 'CONCLUIDA').length,
        [consultations, currentMonthKey]);

    const sessionsLastMonth = useMemo(() =>
        consultations.filter((c) => c.inicioEm.slice(0, 7) === lastMonthKey && c.status === 'CONCLUIDA').length,
        [consultations, lastMonthKey]);

    const sessionGrowth = sessionsLastMonth > 0
        ? Math.round(((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth) * 100)
        : null;

    /* notificações derivadas */
    const notifications = useMemo(() => {
        const list = [];

        const pendingLinks = consultations.filter((c) => c.status === 'PENDENTE_VINCULO');
        if (pendingLinks.length > 0)
            list.push({
                id: 'links', icon: 'link',
                title: `${pendingLinks.length} solicitação(ões) de vínculo`,
                sub: 'Pacientes aguardando aceite',
                time: null,
            });

        const newToday = consultations.filter((c) => c.criadoEm?.slice(0, 10) === todayKey && c.status === 'AGENDADA');
        if (newToday.length > 0)
            list.push({
                id: 'new', icon: 'user',
                title: `${newToday.length} nova(s) consulta(s) agendada(s)`,
                sub: 'Aguardando confirmação',
                time: newToday[0].criadoEm,
            });

        /* fallback quando não há eventos reais */
        if (list.length === 0 && !loadingConsultations)
            list.push({
                id: 'ok', icon: 'ok',
                title: 'Tudo em dia!',
                sub: 'Sem notificações pendentes.',
                time: null,
            });

        return list;
    }, [consultations, todayKey, loadingConsultations]);

    /* ícones de notificação */
    function NotifIcon({ type }) {
        const styles = {
            link: { bg: '#E6F1FB', color: '#378ADD', icon: <Link2 size={17} /> },
            user: { bg: '#EAF3DE', color: '#3B6D11', icon: <UserPlus size={17} /> },
            file: { bg: '#FAEEDA', color: '#854F0B', icon: <FileText size={17} /> },
            ok: { bg: '#EAF3DE', color: '#3B6D11', icon: <CalendarClock size={17} /> },
        };
        const s = styles[type] || styles.ok;
        return (
            <div className="psihome__notif-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
            </div>
        );
    }

    const Skeleton = () => (
        <div className="psihome__skeleton">
            <span style={{ width: '100%' }} />
            <span />
            <span />
        </div>
    );

    return (
        <>
            {/* Mantem os estilos do dashboard no CSS global para evitar injecao de CSS em runtime. */}

            <div className="psihome">

                {/* HEADER */}
                <header className="agenda-page__header panel psihome__header">
                    <div>
                        <p className="eyebrow">Dashboard</p>
                        <h1>Dashboard</h1>
                        <p className="agenda-page__subtitle">
                            Gerencie sua prática, acompanhe seus pacientes e otimize seu tempo.
                        </p>
                    </div>
                </header>

                {/* STAT CARDS — fundo colorido no card inteiro, igual à imagem */}
                <section className="psihome__cards">

                    <div className="psihome__stat psihome__stat--blue">
                        <div className="psihome__stat-icon">
                            <CalendarClock size={22} />
                        </div>
                        <div className="psihome__stat-body">
                            <span className="psihome__stat-label">Próximas consultas hoje</span>
                            <strong className="psihome__stat-value">
                                {loadingConsultations ? '—' : todayConsultations.length}
                            </strong>
                            <span className="psihome__stat-sub">
                                {loadingConsultations ? '' : `${completedToday} concluída(s)`}
                            </span>
                        </div>
                    </div>

                    <div className="psihome__stat psihome__stat--green">
                        <div className="psihome__stat-icon">
                            <Users size={22} />
                        </div>
                        <div className="psihome__stat-body">
                            <span className="psihome__stat-label">Pacientes ativos</span>
                            <strong className="psihome__stat-value">
                                {loadingConsultations ? '—' : activePatients}
                            </strong>
                            <span className="psihome__stat-sub">Em acompanhamento</span>
                        </div>
                    </div>

                    <div className="psihome__stat psihome__stat--amber">
                        <div className="psihome__stat-icon">
                            <FolderOpen size={22} />
                        </div>
                        <div className="psihome__stat-body">
                            <span className="psihome__stat-label">Prontuários</span>
                            <strong className="psihome__stat-value">
                                {loadingConsultations ? '—' : totalPatients}
                            </strong>
                            <span className="psihome__stat-sub">Total cadastrados</span>
                        </div>
                    </div>

                    <div className="psihome__stat psihome__stat--pink">
                        <div className="psihome__stat-icon">
                            <BarChart2 size={22} />
                        </div>
                        <div className="psihome__stat-body">
                            <span className="psihome__stat-label">Sessões (mês)</span>
                            <strong className="psihome__stat-value">
                                {loadingConsultations ? '—' : sessionsThisMonth}
                            </strong>
                            {sessionGrowth !== null && (
                                <span className={`psihome__stat-sub ${sessionGrowth >= 0 ? 'psihome__stat-sub--up' : 'psihome__stat-sub--down'}`}>
                                    {sessionGrowth >= 0 ? '+' : ''}{sessionGrowth}% que mês anterior
                                </span>
                            )}
                            {sessionGrowth === null && !loadingConsultations && (
                                <span className="psihome__stat-sub">Sem dados anteriores</span>
                            )}
                        </div>
                    </div>

                </section>

                {/* GRID INFERIOR — um único painel branco com 3 colunas separadas por divisor */}
                <section className="panel dashboard-box psihome__bottom-panel">

                    {/* CONSULTAS DO DIA */}
                    <div className="panel dashboard-box">
                        <div className="psihome__box-header">
                            <span className="eyebrow">Próximas consultas de hoje</span>
                            <button className="psihome__link" onClick={() => onNavigate?.('agenda')}>
                                Ver agenda completa
                            </button>
                        </div>

                        {loadingConsultations && <Skeleton />}

                        {!loadingConsultations && todayConsultations.length === 0 && (
                            <p className="psihome__empty">Nenhuma consulta para hoje.</p>
                        )}

                        {!loadingConsultations && todayConsultations.map((c, i) => (
                            <div className="psihome__consult" key={c.id}>
                                <span className="psihome__consult-time">{formatTime(c.inicioEm)}</span>
                                <div className="psihome__avatar" style={avatarStyle(i)} aria-hidden="true">
                                    {initials(c.pacienteNome)}
                                </div>
                                <div className="psihome__consult-info">
                                    <strong>{c.pacienteNome}</strong>
                                    <span>{c.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}</span>
                                </div>
                                <span className={`psihome__badge ${consultationBadgeClass(c.status)}`}>
                                    {consultationStatusLabels[c.status] || c.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* NOTIFICAÇÕES */}
                    <div className="panel dashboard-box">
                        <div className="panel__header">
                            <span className="eyebrow">Notificações pendentes</span>
                            <button className="psihome__link" onClick={() => onNavigate?.('notificacoes')}>
                                Ver todas
                            </button>
                        </div>

                        {loadingConsultations && <Skeleton />}

                        {!loadingConsultations && notifications.map((n) => (
                            <div className="dashboard-notification" key={n.id}>
                                <NotifIcon type={n.icon} />
                                <div className="psihome__notif-body">
                                    <strong>{n.title}</strong>
                                    <span>{n.sub}</span>
                                </div>
                                {n.time && (
                                    <span className="psihome__notif-time">{timeAgo(n.time)}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ATALHOS */}
                    <div className="panel dashboard-box">
                        <div className="psihome__box-header">
                            <span className="eyebrow">Atalhos rápidos</span>
                        </div>

                        {[
                            { label: 'Editar perfil profissional', view: 'perfil', icon: <Pencil size={15} /> },
                            { label: 'Gerenciar agenda', view: 'agenda', icon: <CalendarDays size={15} /> },
                            { label: 'Gerenciar pacientes', view: 'pacientes', icon: <Users size={15} /> },
                            { label: 'Visualizar relatórios', view: 'relatorios', icon: <BarChart2 size={15} /> },
                        ].map((s) => (
                            <button key={s.view} className="psihome__shortcut" onClick={() => onNavigate?.(s.view)}>
                                <span className="psihome__shortcut-left">
                                    {s.icon}
                                    {s.label}
                                </span>
                                <ChevronRightIcon size={15} className="psihome__shortcut-chevron" />
                            </button>
                        ))}

                        <button className="psihome__shortcut" onClick={() => onNavigate?.('psicologos')}>
                            <span className="psihome__shortcut-left">
                                <ShieldCheck size={15} />
                                Gerenciar psicólogos
                            </span>
                            <span className="psihome__admin-badge">Apenas admin</span>
                        </button>
                    </div>

                </section>
            </div>
        </>
    );
}

/* paleta de avatares */
const AVATAR_PALETTES = [
    { bg: '#E6F1FB', color: '#185FA5' },
    { bg: '#EAF3DE', color: '#3B6D11' },
    { bg: '#FAEEDA', color: '#854F0B' },
    { bg: '#FBEAF0', color: '#993556' },
    { bg: '#FAECE7', color: '#993C1D' },
];
function avatarStyle(index) {
    const p = AVATAR_PALETTES[index % AVATAR_PALETTES.length];
    return { background: p.bg, color: p.color };
}

/* ─── restante do arquivo (inalterado) ─────────────────────────── */

export function PsychologistDashboard({ activeView, onToast, onNavigate }) {
    if (activeView === 'dashboard') return <PsychologistHome onNavigate={onNavigate} />;
    if (activeView === 'agenda') return <AgendaManagement onToast={onToast} />;
    if (activeView === 'pacientes') return <AvailabilityForm onToast={onToast} />;
    return <PsychologistHome onNavigate={onNavigate} />;
}

/* ─── AvailabilityForm (inalterado) ────────────────────────────── */

function AvailabilityForm({ onToast }) {
    const [selectedDays, setSelectedDays] = useState(['SEGUNDA']);
    const [horaInicio, setHoraInicio] = useState('08:00');
    const [horaFim, setHoraFim] = useState('12:00');
    const [duracao, setDuracao] = useState(50);
    const [submitting, setSubmitting] = useState(false);

    const isValid = selectedDays.length > 0 && horaInicio && horaFim && horaFim > horaInicio && Number(duracao) > 0;

    function toggleDay(day) {
        setSelectedDays((cur) => cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day]);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!isValid) { onToast({ type: 'error', message: 'Preencha uma disponibilidade válida.' }); return; }
        const today = new Date();
        setSubmitting(true);
        try {
            await schedulingApi.saveAvailability({
                diasSemana: selectedDays,
                horaInicio: `${horaInicio}:00`,
                horaFim: `${horaFim}:00`,
                duracaoSlotMinutos: Number(duracao),
                validoAPartirDe: toIsoDate(today),
                gerarAte: toIsoDate(addDays(today, 60)),
            });
            onToast({ type: 'success', message: 'Horários salvos e agenda atualizada.' });
        } catch {
            onToast({ type: 'error', message: 'Não foi possível salvar esses horários.' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="panel narrow-panel">
            <div className="panel__header">
                <div><p className="eyebrow">Disponibilidade</p><h2>Definir horários</h2></div>
            </div>
            <form className="stack-form" onSubmit={handleSubmit}>
                <fieldset className="checkbox-group">
                    <legend>Dias disponíveis</legend>
                    <div>
                        {days.map((day) => (
                            <label className="check-card" key={day.value}>
                                <input type="checkbox" checked={selectedDays.includes(day.value)} onChange={() => toggleDay(day.value)} />
                                <span>{day.label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
                <div className="form-grid">
                    <label>Horário de início<input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required /></label>
                    <label>Horário de fim<input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} required /></label>
                </div>
                <label className="field">Duração da consulta
                    <input type="number" min="10" step="5" value={duracao} onChange={(e) => setDuracao(e.target.value)} />
                </label>
                <div className="inline-actions inline-actions--spread">
                    <button className="ghost-button" type="button" onClick={() => { setSelectedDays(['SEGUNDA']); setHoraInicio('08:00'); setHoraFim('12:00'); setDuracao(50); }}>Cancelar</button>
                    <button className="primary-button primary-button--fit" type="submit" disabled={!isValid || submitting}>
                        {submitting ? <Loader2 className="spin" size={17} /> : <Save size={17} />}
                        Salvar horários
                    </button>
                </div>
            </form>
        </section>
    );
}

/* ─── AgendaManagement (inalterado) ────────────────────────────── */

function AgendaManagement({ onToast }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [refreshKey, setRefreshKey] = useState(0);
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [selectedSlotDetails, setSelectedSlotDetails] = useState(null);
    const [manualSlot, setManualSlot] = useState({ data: toIsoDate(new Date()), horaInicio: '14:00', horaFim: '14:50' });

    useEffect(() => {
        const controller = new AbortController();
        const today = new Date();
        setLoading(true);
        schedulingApi.listMySlots({
            inicio: `${toIsoDate(today)}T00:00:00`,
            fim: `${toIsoDate(addDays(today, LIST_RANGE_DAYS))}T23:59:59`,
            signal: controller.signal,
        })
            .then((data) => setSlots(data || []))
            .catch((err) => { if (err.name !== 'AbortError') onToast({ type: 'error', message: 'Não foi possível carregar a agenda.' }); })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, [onToast, refreshKey]);

    const sortedSlots = useMemo(() => [...slots].sort((a, b) => new Date(a.inicioEm) - new Date(b.inicioEm)), [slots]);
    const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);
    const weekTimeRows = useMemo(() => buildTimeRows(WEEK_START_HOUR, WEEK_END_HOUR, WEEK_SLOT_MINUTES), []);
    const weekSlots = useMemo(() => filterSlotsForRange(sortedSlots, weekStart, addDays(weekStart, 7)), [sortedSlots, weekStart]);
    const slotsByStart = useMemo(() => groupSlotsByStartTime(weekSlots), [weekSlots]);
    const weekRangeLabel = `${formatDate(weekStart)} - ${formatDate(addDays(weekStart, 6))}`;

    async function addSlot(event) {
        event.preventDefault();
        setSubmitting(true);
        try {
            await schedulingApi.createManualSlot({ data: manualSlot.data, horaInicio: `${manualSlot.horaInicio}:00`, horaFim: `${manualSlot.horaFim}:00` });
            setRefreshKey((c) => c + 1);
            onToast({ type: 'success', message: 'Horário adicionado.' });
        } catch {
            onToast({ type: 'error', message: 'Não foi possível adicionar esse horário.' });
        } finally {
            setSubmitting(false);
        }
    }

    async function removeSlot(slot) {
        setSubmitting(true);
        try {
            await schedulingApi.removeMySlot(slot.id);
            setRefreshKey((c) => c + 1);
            onToast({ type: 'success', message: 'Horário removido da agenda.' });
        } catch {
            onToast({ type: 'error', message: 'Não foi possível remover esse horário.' });
        } finally {
            setSubmitting(false);
        }
    }

    function selectWeekSlot(slot) {
        if (slot.status === 'DISPONIVEL') {
            setManualSlot({ data: toIsoDate(new Date(slot.inicioEm)), horaInicio: formatTime(slot.inicioEm), horaFim: formatTime(slot.fimEm) });
            setViewMode('list');
            onToast({ type: 'success', message: 'Horário preenchido no formulário.' });
            return;
        }
        setSelectedSlotDetails(slot);
    }

    return (
        <div className="stack-layout">
            <section className="panel">
                <div className="panel__header agenda-toolbar">
                    <div><p className="eyebrow">Agenda</p><h2>Adicionar horário</h2></div>
                    <div className="agenda-toggle" role="tablist">
                        <button className={viewMode === 'list' ? 'agenda-toggle__button agenda-toggle__button--active' : 'agenda-toggle__button'} type="button" onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'}><CalendarDays size={16} />Lista</button>
                        <button className={viewMode === 'week' ? 'agenda-toggle__button agenda-toggle__button--active' : 'agenda-toggle__button'} type="button" onClick={() => setViewMode('week')} aria-pressed={viewMode === 'week'}><Clock3 size={16} />Semana</button>
                    </div>
                </div>
                <form className="inline-form" onSubmit={addSlot}>
                    <label>Data<input type="date" min={toIsoDate(new Date())} value={manualSlot.data} onChange={(e) => setManualSlot((c) => ({ ...c, data: e.target.value }))} required /></label>
                    <label>Início<input type="time" value={manualSlot.horaInicio} onChange={(e) => setManualSlot((c) => ({ ...c, horaInicio: e.target.value }))} required /></label>
                    <label>Fim<input type="time" value={manualSlot.horaFim} onChange={(e) => setManualSlot((c) => ({ ...c, horaFim: e.target.value }))} required /></label>
                    <button className="primary-button primary-button--fit" type="submit" disabled={submitting}>
                        {submitting ? <Loader2 className="spin" size={17} /> : <CalendarPlus size={17} />}
                        Adicionar horário
                    </button>
                </form>
            </section>

            <section className="panel">
                <div className="panel__header">
                    <div><p className="eyebrow">Horários</p><h2>{viewMode === 'list' ? 'Gerenciar agenda' : `Semana de ${weekRangeLabel}`}</h2></div>
                    {viewMode === 'week' && (
                        <div className="week-nav">
                            <button className="ghost-button" type="button" onClick={() => setWeekStart((c) => addDays(c, -7))}><ChevronLeft size={16} />Semana anterior</button>
                            <button className="ghost-button" type="button" onClick={() => setWeekStart(startOfWeek(new Date()))}>Hoje</button>
                            <button className="ghost-button" type="button" onClick={() => setWeekStart((c) => addDays(c, 7))}>Próxima semana<ChevronRight size={16} /></button>
                        </div>
                    )}
                </div>

                {loading && <LoadingState />}

                {!loading && viewMode === 'list' && sortedSlots.length === 0 && <div className="empty-state">Nenhum horário cadastrado.</div>}

                {!loading && viewMode === 'list' && sortedSlots.length > 0 && (
                    <div className="data-table" role="table">
                        <div className="data-table__row data-table__row--head" role="row">
                            <span>Data</span><span>Horário</span><span>Status</span><span />
                        </div>
                        {sortedSlots.map((slot) => {
                            const isReserved = slot.status === 'RESERVADO';
                            return (
                                <div className="agenda-row data-table__row" role="row" key={slot.id}>
                                    <span>{formatDateTime(slot.inicioEm).split(',')[0]}</span>
                                    <span>{formatTime(slot.inicioEm)} - {formatTime(slot.fimEm)}</span>
                                    <span>
                                        <span className={isReserved ? 'status-badge status-badge--reserved' : 'status-badge status-badge--available'}>
                                            {statusLabels[slot.status] || slot.status}
                                        </span>
                                        {isReserved && <span className="agenda-row__meta"><strong>{slot.pacienteNome}</strong><span>{slot.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}</span></span>}
                                    </span>
                                    <button className="ghost-button" type="button" disabled={isReserved || submitting} onClick={() => removeSlot(slot)}><Trash2 size={16} />Remover</button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && viewMode === 'week' && (
                    <WeekAgendaGrid weekStart={weekStart} days={weekDays} timeRows={weekTimeRows} slotsByStart={slotsByStart} onSlotClick={selectWeekSlot} />
                )}
            </section>

            {selectedSlotDetails && <SlotDetailsModal slot={selectedSlotDetails} onClose={() => setSelectedSlotDetails(null)} />}
        </div>
    );
}

function LoadingState() {
    return <div className="loading-rows"><span /><span /><span /></div>;
}

function WeekAgendaGrid({ days, timeRows, slotsByStart, onSlotClick }) {
    return (
        <div className="week-agenda">
            <div className="week-agenda__header">
                <span className="week-agenda__time-label" />
                {days.map((date) => {
                    const isToday = isSameDate(date, toIsoDate(new Date()));
                    return (
                        <div className={isToday ? 'week-agenda__day week-agenda__day--today' : 'week-agenda__day'} key={toIsoDate(date)}>
                            <strong>{weekdayLabel(date)}</strong>
                            <span>{formatDate(date).slice(0, 5)}</span>
                        </div>
                    );
                })}
            </div>
            <div className="week-agenda__body">
                <div className="week-agenda__times">
                    {timeRows.map((row) => <div className="week-agenda__time-cell" key={row.label}>{row.label}</div>)}
                </div>
                {days.map((date) => {
                    const dateKey = toIsoDate(date);
                    const daySlots = slotsByStart.get(dateKey) || [];
                    return (
                        <div className="week-agenda__column" key={dateKey}>
                            {timeRows.map((row, index) => {
                                const slot = daySlots.find((item) => item.startKey === row.key);
                                const clickable = Boolean(slot && (slot.status === 'DISPONIVEL' || slot.consultaStatus));
                                return (
                                    <button
                                        className={['week-agenda__slot', clickable ? 'week-agenda__slot--interactive' : 'week-agenda__slot--unavailable', slot ? getAgendaToneClass(slot) : ''].filter(Boolean).join(' ')}
                                        type="button" key={row.key}
                                        onClick={() => slot && clickable && onSlotClick(slot)}
                                        disabled={!clickable}
                                        style={{ top: `${index * 44}px`, height: slot ? `${Math.max(44, Math.ceil(slot.durationMinutes / 30) * 44)}px` : '44px' }}
                                    >
                                        {slot ? (
                                            <>
                                                <span className="agenda-block">{slot.pacienteNome || 'Disponível'}</span>
                                                <strong>{formatTime(slot.inicioEm)} - {formatTime(slot.fimEm)}</strong>
                                                {slot.tipoAtendimento && <span className="status-badge status-badge--type">{slot.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}</span>}
                                                <span className={slot.status === 'DISPONIVEL' ? 'status-badge status-badge--available' : 'status-badge status-badge--reserved'}>{slot.status === 'DISPONIVEL' ? 'Disponível' : 'Reservado'}</span>
                                            </>
                                        ) : (
                                            <span className="week-agenda__unavailable-label">Indisponível</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function SlotDetailsModal({ slot, onClose }) {
    const panelRef = useRef(null);
    useFocusTrap(panelRef, onClose);
    return (
        <div className="modal-backdrop" role="presentation" onClick={onClose}>
            <div ref={panelRef} className="modal-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <div className="modal-panel__header">
                    <div><p className="eyebrow">Consulta</p><h3>{slot.pacienteNome}</h3></div>
                    <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
                </div>
                <dl className="details-list">
                    <div><dt>Status</dt><dd>{consultationStatusLabels[slot.consultaStatus] || slot.consultaStatus || 'Reservado'}</dd></div>
                    <div><dt>Tipo</dt><dd>{slot.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online'}</dd></div>
                    <div><dt>Horário</dt><dd>{formatTime(slot.inicioEm)} - {formatTime(slot.fimEm)}</dd></div>
                    <div><dt>Observações</dt><dd>{slot.observacoes || 'Sem observações.'}</dd></div>
                    {slot.motivoCancelamento && <div><dt>Motivo do cancelamento</dt><dd>{slot.motivoCancelamento}</dd></div>}
                </dl>
            </div>
        </div>
    );
}

/* ─── helpers ───────────────────────────────────────────────────── */

function getAgendaToneClass(slot) {
    if (slot.consultaStatus === 'EM_ANDAMENTO') return 'week-agenda__slot--in-progress';
    if (slot.consultaStatus === 'CONCLUIDA') return 'week-agenda__slot--completed';
    if (slot.status === 'RESERVADO') return 'week-agenda__slot--scheduled';
    if (slot.status === 'BLOQUEADO' || slot.status === 'CANCELADO') return 'week-agenda__slot--blocked';
    return 'week-agenda__slot--available';
}

function buildWeekDays(startDate) {
    return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
}

function buildTimeRows(startHour, endHour, minutesStep) {
    const rows = [];
    const base = new Date(); base.setHours(startHour, 0, 0, 0);
    const end = new Date(); end.setHours(endHour, 0, 0, 0);
    let cursor = new Date(base);
    while (cursor < end) {
        rows.push({ key: toIsoDate(cursor) + 'T' + formatHoursMinutes(cursor), label: formatHoursMinutes(cursor), span: minutesStep / 30 });
        cursor = new Date(cursor);
        cursor.setMinutes(cursor.getMinutes() + minutesStep);
    }
    return rows;
}

function filterSlotsForRange(slots, startDate, endDate) {
    return slots.filter((slot) => { const d = new Date(slot.inicioEm); return d >= startDate && d < endDate; });
}

function groupSlotsByStartTime(slots) {
    const grouped = new Map();
    slots.forEach((slot) => {
        const dateKey = toIsoDate(new Date(slot.inicioEm));
        const startKey = dateKey + 'T' + formatHoursMinutes(new Date(slot.inicioEm));
        const entry = { ...slot, startKey, durationMinutes: Math.max(30, Math.round((new Date(slot.fimEm) - new Date(slot.inicioEm)) / 60000)) };
        if (!grouped.has(dateKey)) grouped.set(dateKey, []);
        grouped.get(dateKey).push(entry);
    });
    return grouped;
}

function startOfWeek(date) {
    const v = new Date(date);
    v.setDate(v.getDate() - v.getDay());
    v.setHours(0, 0, 0, 0);
    return v;
}

function isSameDate(first, secondKey) { return toIsoDate(first) === secondKey; }

function weekdayLabel(date) {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', '').replace(/^./, (l) => l.toUpperCase());
}

function formatHoursMinutes(date) {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
}