export const DAY_ORDER = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];

export const DAY_LABELS = {
    SEGUNDA: 'Seg',
    TERCA: 'Ter',
    QUARTA: 'Qua',
    QUINTA: 'Qui',
    SEXTA: 'Sex',
    SABADO: 'Sab',
    DOMINGO: 'Dom',
};

export const DAY_FULL_LABELS = {
    SEGUNDA: 'Segunda',
    TERCA: 'Terca',
    QUARTA: 'Quarta',
    QUINTA: 'Quinta',
    SEXTA: 'Sexta',
    SABADO: 'Sabado',
    DOMINGO: 'Domingo',
};

export const DAY_OPTIONS = DAY_ORDER.map((value) => ({ value, label: DAY_FULL_LABELS[value] }));
export const ACTIVE_STATUSES = new Set(['AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO']);
export const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Todos' },
    { value: 'AGENDADA', label: 'Agendada' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
    { value: 'CONCLUIDA', label: 'Concluida' },
    { value: 'CANCELADA', label: 'Cancelada' },
];
export const STATUS_OPTIONS_ACTIVE = [
    { value: 'ALL', label: 'Ativos' },
    { value: 'AGENDADA', label: 'Agendada' },
    { value: 'EM_ANDAMENTO', label: 'Em andamento' },
];
export const TYPE_OPTIONS = [
    { value: 'ALL', label: 'Todos' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'PRESENCIAL', label: 'Presencial' },
];
export const GRID_CONSULTATION_STATUSES = new Set(['AGENDADA', 'EM_ANDAMENTO']);
export const DEFAULT_DURATION = 50;
export const CALENDAR_START_HOUR = 7;
export const CALENDAR_END_HOUR = 22;
export const CALENDAR_SLOT_MINUTES = 30;
export const CONSULTATION_PAGE_SIZE = 8;
export const MANUAL_SLOT_RANGE_DAYS = 60;
export const CONSULTATION_RANGE_PAST_DAYS = 90;
export const CONSULTATION_RANGE_FUTURE_DAYS = 180;
