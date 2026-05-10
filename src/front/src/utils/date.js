const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
});

export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

export function formatDate(value) {
    if (!value) return '--';
    return dateFormatter.format(toDate(value));
}

export function formatDateTime(value) {
    if (!value) return '--';
    return dateTimeFormatter.format(toDate(value));
}

export function formatTime(value) {
    if (!value) return '--';
    return timeFormatter.format(toDate(value));
}

export function formatMonth(value) {
    const label = monthFormatter.format(value);
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function addMonths(value, amount) {
    return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

export function startOfMonth(value) {
    return new Date(value.getFullYear(), value.getMonth(), 1);
}

export function endExclusiveOfMonth(value) {
    return new Date(value.getFullYear(), value.getMonth() + 1, 1);
}

export function addDays(value, amount) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate() + amount);
}

export function toIsoDate(value) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function toDateKey(value) {
    return typeof value === 'string' ? value.slice(0, 10) : toIsoDate(value);
}

export function isSameDate(date, dateKey) {
    return toIsoDate(date) === dateKey;
}

export function isBeforeToday(date) {
    const today = new Date();
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return normalizedDate < normalizedToday;
}

export function isDateInMonth(date, monthDate) {
    return date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear();
}

export function isPastDateTime(value) {
    return toDate(value).getTime() <= Date.now();
}

export function buildCalendarDays(monthDate) {
    const firstDay = startOfMonth(monthDate);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    // Monday-based offset: Monday=0 blanks, Tuesday=1, ..., Sunday=6
    const leadingBlankCount = (firstDay.getDay() + 6) % 7;
    const cells = Array.from({ length: leadingBlankCount }, () => null);

    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
    }

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    return cells;
}

function toDate(value) {
    return value instanceof Date ? value : new Date(value);
}
