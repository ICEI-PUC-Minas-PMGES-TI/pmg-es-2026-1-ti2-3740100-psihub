import { useEffect, useState } from 'react';
import { clinicalApi } from '@/services/clinical.service';
import { schedulingApi } from '@/services/scheduling.service';
import { getCurrentUserId } from '@/shared/utils/jwt.utils';

export function useReports({ initialPatientId, onToast }) {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(() =>
        initialPatientId ? String(initialPatientId) : ''
    );
    const [timeline, setTimeline] = useState([]);
    const [records, setRecords] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        schedulingApi.listMyPatients({ signal: controller.signal })
            .then((data) => {
                setPatients(data || []);
                setSelectedPatient((prev) => prev || (data?.[0]?.id ? String(data[0].id) : ''));
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message || 'Não foi possível carregar pacientes.');
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
        const psicologoId = getCurrentUserId();

        clinicalApi.getTimeline({
            pacienteId: selectedPatient,
            psicologoId: psicologoId,
            signal: controller.signal
        })
            .then((data) => {
                setTimeline(data || []);
                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'Não foi possível carregar a evolução.');
                    onToast?.({ type: 'error', message: 'Acesso clínico negado sem vínculo aceito.' });
                }
            })
            .finally(() => setLoadingTimeline(false));
        // also load emotional records for this patient (psychologist view)
        setLoadingRecords(true);
        clinicalApi.listPatientEmotionRecords({ pacienteId: selectedPatient, signal: controller.signal })
            .then((data) => {
                setRecords(data || []);
            })
            .catch((err) => {
                // ignore abort and forbidden here; the caller already sees error message when timeline access denied
                if (err.name !== 'AbortError') {
                    // if forbidden, we intentionally do not override main error: psychologist must accept vínculo
                }
            })
            .finally(() => setLoadingRecords(false));
        return () => controller.abort();
    }, [selectedPatient, onToast]);

    return {
        patients,
        selectedPatient,
        setSelectedPatient,
        timeline,
        records,
        loadingPatients,
        loadingTimeline,
        loadingRecords,
        error,
    };
}
