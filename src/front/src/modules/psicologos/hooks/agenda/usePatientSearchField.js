import { useCallback, useRef, useState } from 'react';
import { schedulingApi } from '@/services/scheduling.service';

/**
 * Busca pacientes por nome com debounce para o campo de agendamento do psicologo.
 *
 * @param {{ value: string, selectedId: number|null, onSelect: Function, onClear: Function }} params
 * @returns {{ query: string, results: Array, loading: boolean, open: boolean, containerRef: Object, search: Function, handleChange: Function, handleSelect: Function, handleBlur: Function }}
 */
export function usePatientSearchField({ value, selectedId, onSelect, onClear }) {
    const [query, setQuery] = useState(value || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    const search = useCallback((term) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!term.trim()) {
            setResults([]);
            setOpen(false);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await schedulingApi.listMyPatients({ nome: term.trim() });
                setResults(data || []);
                setOpen(true);
            } catch (error) {
                console.error('[PsiHub] Erro ao buscar pacientes:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, []);

    function handleChange(event) {
        const term = event.target.value;
        setQuery(term);
        if (selectedId) {
            onClear();
        }
        search(term);
    }

    function handleSelect(paciente) {
        setQuery(paciente.nome);
        setResults([]);
        setOpen(false);
        onSelect(paciente);
    }

    function handleBlur(event) {
        if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
            setOpen(false);
            if (!selectedId) {
                setQuery('');
            }
        }
    }

    return {
        query,
        results,
        loading,
        open,
        containerRef,
        search,
        handleChange,
        handleSelect,
        handleBlur,
    };
}
