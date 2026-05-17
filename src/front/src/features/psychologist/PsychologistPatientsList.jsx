import React from "react";

export default function PsychologistPatientsList() {
  const patients = [
    {
      id: 1,
      name: "Maria Souza",
      lastAppointment: "10/05/2026",
      status: "Ativo",
    },
    {
      id: 2,
      name: "João Silva",
      lastAppointment: null,
      status: "Sem consulta",
    },
  ];

  return (
    <div>
      <h2>Pacientes</h2>

      {patients.map((p) => (
        <div key={p.id}>
          <h3>{p.name}</h3>

          <p>
            Última consulta: {p.lastAppointment || "Nunca atendido"}
          </p>

          <p>Status: {p.status}</p>

          <button>Ver prontuário</button>
        </div>
      ))}
    </div>
  );
}