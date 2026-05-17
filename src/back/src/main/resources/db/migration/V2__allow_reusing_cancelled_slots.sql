CREATE INDEX idx_consultas_slot_status ON consultas (slot_consulta_id, status);

ALTER TABLE consultas DROP INDEX uk_consultas_slot;
