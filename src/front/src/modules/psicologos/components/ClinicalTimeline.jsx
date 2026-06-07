import {
    Brain,
    HeartPulse,
    Minus,
    PenLine,
    TrendingDown,
    TrendingUp,
    UserRound,
} from 'lucide-react';
import { formatDateTime } from '@/shared/utils/date.utils';

const TREND_CONFIG = {
    melhora: {
        label: 'Melhora',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        icon: TrendingUp,
    },
    estabilidade: {
        label: 'Estabilidade',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
        icon: Minus,
    },
    piora: {
        label: 'Piora',
        className: 'border-red-200 bg-red-50 text-red-700',
        icon: TrendingDown,
    },
};

const ENGAGEMENT_CONFIG = {
    BAIXO: 'border-orange-200 bg-orange-50 text-orange-700',
    MEDIO: 'border-amber-200 bg-amber-50 text-amber-700',
    ALTO: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const ENGAGEMENT_LABELS = {
    BAIXO: 'Baixo',
    MEDIO: 'Médio',
    ALTO: 'Alto',
};

function normalizeTags(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value !== 'string' || value.trim() === '') return [];

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [];
}

function clampMetric(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return Math.min(Math.max(number, min), max);
}

function getEvolutionDate(data) {
    return data?.criadoEm || data?.inicioEm || data?.registradoEm || data?.atualizadoEm;
}

function getRecordDate(data) {
    return data?.registradoEm || data?.criadoEm || data?.atualizadoEm;
}

function getEvolutionTitle(data) {
    return data?.titulo || 'Evolução clínica';
}

function getEvolutionNotes(data) {
    return data?.anotacoesClinicas || data?.evolucaoClinica || '';
}

function formatEngagement(value) {
    return ENGAGEMENT_LABELS[value] || 'Não informado';
}

function getEventKey(event) {
    const data = event.data || {};
    const id = data.evolucaoId
        ? `evolucao-${data.evolucaoId}`
        : data.prontuarioId
            ? `prontuario-${data.prontuarioId}`
            : data.registroId
                ? `registro-${data.registroId}`
                : data.id
                    ? `id-${data.id}`
                    : event.date?.toISOString();

    return `${event.type}-${id}`;
}

function Tags({ label, items, tone }) {
    if (!items.length) return null;

    const tagClass = tone === 'registro'
        ? 'border-teal-100 bg-teal-50 text-teal-700'
        : 'border-violet-100 bg-violet-50 text-violet-700';

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-slate-500">{label}:</span>
            {items.map((item, index) => (
                <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-bold ${tagClass}`}
                    key={`${item}-${index}`}
                >
                    {item}
                </span>
            ))}
        </div>
    );
}

function TrendIndicator({ tendencia }) {
    const config = tendencia ? TREND_CONFIG[tendencia] : null;
    const Icon = config?.icon || Minus;

    return (
        <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-extrabold text-slate-700">Tendência recente</span>
            <span
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm font-extrabold ${
                    config?.className || 'border-slate-200 bg-white text-slate-500'
                }`}
            >
                <Icon size={16} aria-hidden="true" />
                {config?.label || 'Dados insuficientes'}
            </span>
        </div>
    );
}

function ProgressBar({ value }) {
    const progress = clampMetric(value, 1, 10);

    if (progress === null) {
        return <span className="text-sm font-bold text-slate-500">Progresso não informado</span>;
    }

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-extrabold text-slate-500">Progresso</span>
                <span className="text-xs font-extrabold text-slate-700">{progress}/10</span>
            </div>
            <div
                className="h-2.5 overflow-hidden rounded-full bg-slate-200"
                aria-label={`Progresso ${progress} de 10`}
                aria-valuemax={10}
                aria-valuemin={1}
                aria-valuenow={progress}
                role="progressbar"
            >
                <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${progress * 10}%` }}
                />
            </div>
        </div>
    );
}

function EngagementBadge({ value }) {
    const className = ENGAGEMENT_CONFIG[value] || 'border-slate-200 bg-slate-50 text-slate-600';

    return (
        <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-extrabold ${className}`}>
            {formatEngagement(value)}
        </span>
    );
}

function MoodIndicator({ value }) {
    const humor = clampMetric(value, 1, 5);

    if (humor === null) {
        return <span className="text-sm font-bold text-slate-500">Humor não informado</span>;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-slate-500">Humor</span>
            <span className="inline-flex items-center gap-1" aria-label={`Humor ${humor} de 5`} role="img">
                {Array.from({ length: 5 }, (_, index) => (
                    <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 rounded-full ${
                            index < humor ? 'bg-teal-500' : 'bg-slate-200'
                        }`}
                        key={index}
                    />
                ))}
            </span>
            <span className="text-xs font-extrabold text-slate-700">{humor}/5</span>
        </div>
    );
}

function TimelineMarker({ type }) {
    const isEvolution = type === 'evolucao';
    const Icon = isEvolution ? Brain : UserRound;

    return (
        <span
            className={`absolute -left-10 top-5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white ${
                isEvolution ? 'border-violet-500 text-violet-600' : 'border-teal-500 text-teal-600'
            }`}
            aria-hidden="true"
        >
            <Icon size={15} />
        </span>
    );
}

function EvolutionCard({ event }) {
    const data = event.data || {};
    const date = getEvolutionDate(data) || event.date;
    const title = getEvolutionTitle(data);
    const themes = normalizeTags(data.temasSessao);
    const notes = getEvolutionNotes(data);

    return (
        <article
            className="rounded-lg border border-violet-100 bg-white p-4 shadow-sm"
            role="article"
            aria-label={`Evolução clínica de ${formatDateTime(date)}: ${title}`}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase text-violet-700">
                        <Brain size={16} aria-hidden="true" />
                        Evolução clínica
                    </div>
                    <h3 className="m-0 text-base font-extrabold text-slate-900">{title}</h3>
                    <p className="m-0 text-sm font-bold text-slate-500">{formatDateTime(date)}</p>
                </div>
                <EngagementBadge value={data.nivelEngajamento} />
            </div>

            <div className="mt-4 grid gap-3">
                <Tags label="Temas" items={themes} tone="evolucao" />
                <ProgressBar value={data.nivelProgresso} />
                {notes && <p className="m-0 text-sm text-slate-700">{notes}</p>}
                {data.intercorrencias && (
                    <p className="m-0 text-sm text-slate-600">
                        <strong className="font-extrabold text-slate-700">Intercorrências:</strong> {data.intercorrencias}
                    </p>
                )}
                {data.tarefasEncaminhamentos && (
                    <p className="m-0 text-sm text-slate-600">
                        <strong className="font-extrabold text-slate-700">Tarefas e encaminhamentos:</strong> {data.tarefasEncaminhamentos}
                    </p>
                )}
            </div>
        </article>
    );
}

function RecordCard({ event, onAnnotateRecord }) {
    const data = event.data || {};
    const date = getRecordDate(data) || event.date;
    const emotions = normalizeTags(data.emocoes);

    return (
        <article
            className="rounded-lg border border-teal-100 bg-white p-4 shadow-sm"
            role="article"
            aria-label={`Registro emocional de ${formatDateTime(date)} com humor ${data.humorDia || 'não informado'}`}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase text-teal-700">
                        <HeartPulse size={16} aria-hidden="true" />
                        Registro emocional
                    </div>
                    <h3 className="m-0 text-base font-extrabold text-slate-900">{formatDateTime(date)}</h3>
                    <p className="m-0 text-sm font-bold text-slate-500">Registrado pelo paciente</p>
                </div>
                {onAnnotateRecord && (
                    <button
                        className="secondary-button"
                        type="button"
                        onClick={() => onAnnotateRecord(data)}
                    >
                        <PenLine size={16} aria-hidden="true" />
                        Anotar
                    </button>
                )}
            </div>

            <div className="mt-4 grid gap-3">
                <MoodIndicator value={data.humorDia} />
                <Tags label="Emoções" items={emotions} tone="registro" />
                {data.descricao && <p className="m-0 text-sm text-slate-700">"{data.descricao}"</p>}
            </div>
        </article>
    );
}

export function ClinicalTimeline({ events = [], tendencia, loading, hasSelectedPatient, onAnnotateRecord }) {
    if (!hasSelectedPatient) {
        return <p className="empty-state">Selecione um paciente para visualizar a linha do tempo clínica.</p>;
    }

    if (loading) {
        return null;
    }

    if (!events.length) {
        return (
            <>
                <TrendIndicator tendencia={tendencia} />
                <p className="empty-state">Nenhum evento clínico ou emocional disponível para este paciente.</p>
            </>
        );
    }

    return (
        <div>
            <TrendIndicator tendencia={tendencia} />
            <div className="relative">
                <span className="absolute bottom-0 left-3 top-0 w-px bg-slate-200" aria-hidden="true" />
                <ol className="grid gap-5 pl-10">
                    {events.map((event) => (
                        <li className="relative" key={getEventKey(event)}>
                            <TimelineMarker type={event.type} />
                            {event.type === 'evolucao' ? (
                                <EvolutionCard event={event} />
                            ) : (
                                <RecordCard event={event} onAnnotateRecord={onAnnotateRecord} />
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
