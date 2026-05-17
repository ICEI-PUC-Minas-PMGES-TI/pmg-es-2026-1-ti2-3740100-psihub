export const patientStatusLabels = {
    AGENDADA: 'Agendada',
    CONFIRMADA: 'Confirmada',
    EM_ANDAMENTO: 'Em andamento',
    CONCLUIDA: 'Concluida',
    CANCELADA: 'Cancelada',
    FALTOU: 'Faltou',
};

export function getSlotInicio(slot) {
    return slot?.inicioEm || slot?.inicio || null;
}

export function getSlotKey(slot) {
    return slot?.id ?? getSlotInicio(slot);
}
