import { formatDate, formatTime, toIsoDate } from '@/shared/utils/date.utils';
import { consultationStatusLabel } from '../utils/agenda.utils';

/**
 * Gera exportacao CSV da lista filtrada de consultas.
 *
 * @param {{ filteredConsultations: Array, onToast?: Function }} params
 * @returns {{ exportFilteredConsultations: Function }}
 */
export function useAgendaExport({ filteredConsultations, onToast }) {
    function exportFilteredConsultations() {
        if (filteredConsultations.length === 0) {
            onToast?.({ type: 'error', message: 'Nao ha consultas para exportar.' });
            return;
        }

        const rows = [
            ['Paciente', 'Data', 'Horario', 'Tipo', 'Status', 'Observacoes'],
            ...filteredConsultations.map((consultation) => [
                consultation.pacienteNome,
                formatDate(consultation.inicioEm),
                `${formatTime(consultation.inicioEm)} - ${formatTime(consultation.fimEm)}`,
                consultation.tipoAtendimento === 'PRESENCIAL' ? 'Presencial' : 'Online',
                consultationStatusLabel(consultation.status),
                consultation.observacoes || '',
            ]),
        ];

        const csv = rows
            .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `agenda-psihub-${toIsoDate(new Date())}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    return { exportFilteredConsultations };
}
