import { useEffect, useState } from 'react';
import { clinicalApi } from '@/services/clinical.service';
import { schedulingApi } from '@/services/scheduling.service';

export function useReports({ initialPatientId, onToast }) {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(() =>
        initialPatientId ? String(initialPatientId) : ''
    );
    const [timeline, setTimeline] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        schedulingApi.listMyPatients({ signal: controller.signal })
            .then((data) => {
                setPatients(data || []);
                setSelectedPatient((prev) => prev || (data?.[0]?.id ? String(data[0].id) : ''));
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message || 'NÃ£o foi possÃ­vel carregar pacientes.');
            })
            .finally(() => setLoadingPatients(false));
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!selectedPatient) {
            setTimeline([]);
            return undefined;
        }
        const controller = new AbortController();
        setLoadingTimeline(true);
        clinicalApi.getTimeline({ pacienteId: selectedPatient, signal: controller.signal })
            .then((data) => {
                setTimeline(data || []);
                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'NÃ£o foi possÃ­vel carregar a evoluÃ§Ã£o.');
                    onToast?.({ type: 'error', message: 'Acesso clÃ­nico negado sem vÃ­nculo aceito.' });
                }
            })
            .finally(() => setLoadingTimeline(false));
        return () => controller.abort();
    }, [selectedPatient, onToast]);

    return {
        patients,
        selectedPatient,
        setSelectedPatient,
        timeline,
        loadingPatients,
        loadingTimeline,
        error,
    };
}
