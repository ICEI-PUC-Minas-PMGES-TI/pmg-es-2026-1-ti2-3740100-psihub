import { useEffect, useState } from 'react';
import { clinicalApi } from '@/services/clinical.service';

export function useAdminPsychologists(onToast) {
    const [status, setStatus] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        clinicalApi.listAdminPsychologists({ status, signal: controller.signal })
            .then((data) => {
                setItems(data || []);
                setError('');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message || 'Nao foi possivel carregar psicologos.');
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, [status]);

    async function changeAccess(psicologoId, action) {
        try {
            if (action === 'approve') await clinicalApi.approvePsychologist(psicologoId);
            if (action === 'revoke') await clinicalApi.revokePsychologist(psicologoId, 'Revogado via painel administrativo');
            onToast?.({ type: 'success', message: 'Acesso atualizado.' });
            setItems(await clinicalApi.listAdminPsychologists({ status }));
        } catch (err) {
            onToast?.({ type: 'error', message: err.message || 'Nao foi possivel atualizar o acesso.' });
        }
    }

    return {
        status,
        setStatus,
        items,
        loading,
        error,
        changeAccess,
    };
}
