function normalizeMenuRole(role = '') {
    return String(role || '').toLowerCase();
}

export function getMenuItems(role) {
    const normalizedRole = normalizeMenuRole(role);

    if (normalizedRole === 'admin') {
        return [{ key: 'admin-psychologists', label: 'Psicologos' }];
    }

    if (normalizedRole === 'psicologo') {
        return [
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'agenda', label: 'Agenda' },
            { key: 'patients', label: 'Pacientes' },
            { key: 'reports', label: 'Relatorios' },
            { key: 'financeiro', label: 'Financeiro' },
            { key: 'psychologist-profile', label: 'Perfil Profissional' },
        ];
    }

    return [
        { key: 'schedule', label: 'Agendar consulta' },
        { key: 'appointments', label: 'Minhas consultas' },
        { key: 'emotions', label: 'Registro emocional' },
        { key: 'meus-pagamentos', label: 'Meus Pagamentos' },
        { key: 'patient-profile', label: 'Perfil' },
    ];
}
