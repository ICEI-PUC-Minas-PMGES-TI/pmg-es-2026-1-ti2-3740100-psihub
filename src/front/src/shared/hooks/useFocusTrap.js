import { useEffect, useRef } from 'react';

const FOCUSABLE_QUERY = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Prende o foco dentro do elemento referenciado enquanto o componente estiver montado
 * (ou seja, enquanto o modal estiver aberto). Restaura o foco ao elemento previamente
 * ativo quando o componente desmonta. Pressionar Escape chama onClose.
 *
 * @param {React.RefObject} containerRef - ref para o elemento raiz do modal (modal-panel)
 * @param {Function} [onClose] - callback chamado ao pressionar Escape
 */
export function useFocusTrap(containerRef, onClose) {
    const returnFocusRef = useRef(null);

    useEffect(() => {
        returnFocusRef.current = document.activeElement; // Salva o elemento com foco antes do modal abrir.

        const container = containerRef.current;
        if (!container) return;

        // Move foco para o primeiro elemento interativo ao abrir o modal.
        const focusables = Array.from(container.querySelectorAll(FOCUSABLE_QUERY));
        focusables[0]?.focus();

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose?.(); // Fecha o modal via Escape, mantendo acessibilidade por teclado.
                return;
            }

            if (event.key !== 'Tab') return;

            // Re-consulta ao navegar para considerar elementos que mudam (ex.: editMode no ConsultationDetails).
            const alive = Array.from(container.querySelectorAll(FOCUSABLE_QUERY));
            if (!alive.length) return;

            const first = alive[0];
            const last = alive[alive.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus(); // Shift+Tab no primeiro elemento volta para o ultimo.
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus(); // Tab no ultimo elemento vai para o primeiro.
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            returnFocusRef.current?.focus(); // Restaura foco ao elemento anterior ao fechar o modal.
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- executa no mount/unmount; modal so esta montado quando aberto.
}
