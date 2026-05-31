import { useCallback, useEffect, useState } from 'react';
import { clinicalApi } from '@/services/clinical.service';
import { schedulingApi } from '@/services/scheduling.service';

export function usePatientsManagement(onToast) {
    const [patients, setPatients] = useState([]);
    const [links, setLinks] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async (signal) => {
        setLoading(true);
        try {
            const [patientList, linkList] = await Promise.all([
                schedulingApi.listMyPatients({ signal }),
                clinicalApi.listPsychologistLinks({ status: 'SOLICITADO', signal }),
            ]);
            setPatients(patientList || []);
            setLinks(linkList || []);
            setError('');
        } catch (err) {
            if (err.name !== 'AbortError') setError(err.message || 'NÃ£o foi possÃ­vel carregar pacientes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    async function reloadBySearch(event) {
        event.preventDefault();
        setLoading(true);
        try {
            setPatients(await schedulingApi.listMyPatients({ nome: search.trim() }));
            setError('');
        } catch (err) {
            setError(err.message || 'NÃ£o foi possÃ­vel buscar pacientes.');
        } finally {
            setLoading(false);
        }
    }

    async function respond(vinculoId, action) {
        try {
            if (action === 'accept') await clinicalApi.acceptLink(vinculoId);
            if (action === 'reject') await clinicalApi.rejectLink(vinculoId);
            onToast?.({ type: 'success', message: 'SolicitaÃ§Ã£o atualizada.' });
            await load();
        } catch (err) {
            onToast?.({ type: 'error', message: err.message || 'NÃ£o foi possÃ­vel atualizar o vÃ­nculo.' });
        }
    }

    return {
        patients,
        links,
        search,
        setSearch,
        loading,
        error,
        reloadBySearch,
        respond,
    };
}
