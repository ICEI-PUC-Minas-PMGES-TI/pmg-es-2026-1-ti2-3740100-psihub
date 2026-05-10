import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Loader2, Save, Trash2 } from 'lucide-react';
import { schedulingApi } from '../../api/schedulingApi.js';
import { addDays, formatDateTime, formatTime, toIsoDate } from '../../utils/date.js';

const days = [
  { value: 'SEGUNDA', label: 'Segunda' },
  { value: 'TERCA', label: 'Terca' },
  { value: 'QUARTA', label: 'Quarta' },
  { value: 'QUINTA', label: 'Quinta' },
  { value: 'SEXTA', label: 'Sexta' },
  { value: 'SABADO', label: 'Sabado' },
  { value: 'DOMINGO', label: 'Domingo' },
];

const statusLabels = {
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Ocupado',
  BLOQUEADO: 'Indisponível',
  CANCELADO: 'Removido',
};

export function PsychologistDashboard({ activeView, onToast }) {
  if (activeView === 'agenda') {
    return <AgendaManagement onToast={onToast} />;
  }

  return <AvailabilityForm onToast={onToast} />;
}

function AvailabilityForm({ onToast }) {
  const [selectedDays, setSelectedDays] = useState(['SEGUNDA']);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('12:00');
  const [duracao, setDuracao] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  const isValid = selectedDays.length > 0 && horaInicio && horaFim && horaFim > horaInicio && Number(duracao) > 0;

  function toggleDay(day) {
    setSelectedDays((current) => {
      if (current.includes(day)) {
        return current.filter((item) => item !== day);
      }
      return [...current, day];
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isValid) {
      onToast({ type: 'error', message: 'Preencha uma disponibilidade valida.' });
      return;
    }

    const today = new Date();
    setSubmitting(true);

    try {
      await schedulingApi.saveAvailability({
        diasSemana: selectedDays,
        horaInicio: `${horaInicio}:00`,
        horaFim: `${horaFim}:00`,
        duracaoSlotMinutos: Number(duracao),
        validoAPartirDe: toIsoDate(today),
        gerarAte: toIsoDate(addDays(today, 60)),
      });
      onToast({ type: 'success', message: 'Horários salvos e agenda atualizada.' });
    } catch {
      onToast({ type: 'error', message: 'Não foi possível salvar esses horários.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel narrow-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Disponibilidade</p>
          <h2>Definir horários</h2>
        </div>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <fieldset className="checkbox-group">
          <legend>Dias disponiveis</legend>
          <div>
            {days.map((day) => (
              <label className="check-card" key={day.value}>
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day.value)}
                  onChange={() => toggleDay(day.value)}
                />
                <span>{day.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-grid">
          <label>
            Horário de início
            <input type="time" value={horaInicio} onChange={(event) => setHoraInicio(event.target.value)} required />
          </label>
          <label>
            Horario de fim
            <input type="time" value={horaFim} onChange={(event) => setHoraFim(event.target.value)} required />
          </label>
        </div>

        <label className="field">
          Duracao da consulta
          <input
            type="number"
            min="10"
            step="5"
            value={duracao}
            onChange={(event) => setDuracao(event.target.value)}
          />
        </label>

        <div className="inline-actions inline-actions--spread">
          <button className="ghost-button" type="button" onClick={() => {
            setSelectedDays(['SEGUNDA']);
            setHoraInicio('08:00');
            setHoraFim('12:00');
            setDuracao(50);
          }}>
            Cancelar
          </button>
          <button className="primary-button primary-button--fit" type="submit" disabled={!isValid || submitting}>
            {submitting ? <Loader2 className="spin" size={17} /> : <Save size={17} />}
            Salvar horários
          </button>
        </div>
      </form>
    </section>
  );
}

function AgendaManagement({ onToast }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [manualSlot, setManualSlot] = useState({
    data: toIsoDate(new Date()),
    horaInicio: '14:00',
    horaFim: '14:50',
  });

  const sortedSlots = useMemo(() => {
    return [...slots].sort((first, second) => new Date(first.inicioEm) - new Date(second.inicioEm));
  }, [slots]);

  useEffect(() => {
    const controller = new AbortController();
    const today = new Date();

    setLoading(true);
    schedulingApi.listMySlots({
      inicio: `${toIsoDate(today)}T00:00:00`,
      fim: `${toIsoDate(addDays(today, 60))}T23:59:59`,
      signal: controller.signal,
    })
      .then((data) => setSlots(data || []))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          onToast({ type: 'error', message: 'Não foi possível carregar a agenda.' });
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [onToast, refreshKey]);

  async function addSlot(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await schedulingApi.createManualSlot({
        data: manualSlot.data,
        horaInicio: `${manualSlot.horaInicio}:00`,
        horaFim: `${manualSlot.horaFim}:00`,
      });
      setRefreshKey((current) => current + 1);
      onToast({ type: 'success', message: 'Horario adicionado.' });
    } catch {
      onToast({ type: 'error', message: 'Não foi possível adicionar esse horário.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function removeSlot(slot) {
    setSubmitting(true);
    try {
      await schedulingApi.removeMySlot(slot.id);
      setRefreshKey((current) => current + 1);
      onToast({ type: 'success', message: 'Horário removido da agenda.' });
    } catch {
      onToast({ type: 'error', message: 'Não foi possível remover esse horário.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack-layout">
      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Agenda</p>
            <h2>Adicionar horário</h2>
          </div>
        </div>

        <form className="inline-form" onSubmit={addSlot}>
          <label>
            Data
            <input
              type="date"
              min={toIsoDate(new Date())}
              value={manualSlot.data}
              onChange={(event) => setManualSlot((current) => ({ ...current, data: event.target.value }))}
              required
            />
          </label>
          <label>
            Inicio
            <input
              type="time"
              value={manualSlot.horaInicio}
              onChange={(event) => setManualSlot((current) => ({ ...current, horaInicio: event.target.value }))}
              required
            />
          </label>
          <label>
            Fim
            <input
              type="time"
              value={manualSlot.horaFim}
              onChange={(event) => setManualSlot((current) => ({ ...current, horaFim: event.target.value }))}
              required
            />
          </label>
          <button className="primary-button primary-button--fit" type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="spin" size={17} /> : <CalendarPlus size={17} />}
            Adicionar horário
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Horários</p>
            <h2>Gerenciar agenda</h2>
          </div>
        </div>

        {loading && <LoadingState />}

        {!loading && sortedSlots.length === 0 && (
          <div className="empty-state">Nenhum horário cadastrado.</div>
        )}

        {!loading && sortedSlots.length > 0 && (
          <div className="data-table" role="table">
            <div className="data-table__row data-table__row--head" role="row">
              <span>Data</span>
              <span>Horario</span>
              <span>Status</span>
              <span />
            </div>
            {sortedSlots.map((slot) => {
              const occupied = slot.status === 'RESERVADO';
              return (
                <div className="data-table__row" role="row" key={slot.id}>
                  <span>{formatDateTime(slot.inicioEm).split(',')[0]}</span>
                  <span>{formatTime(slot.inicioEm)} - {formatTime(slot.fimEm)}</span>
                  <span>{statusLabels[slot.status] || slot.status}</span>
                  <button className="ghost-button" type="button" disabled={occupied || submitting} onClick={() => removeSlot(slot)}>
                    <Trash2 size={16} />
                    Remover horário
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="loading-rows">
      <span />
      <span />
      <span />
    </div>
  );
}
