import { Save, X, User } from 'lucide-react';

export function PsychologistProfilePage() {
  return (
    <div className="psihome">
      <h1>Perfil Profissional</h1>
      <p>Atualize suas informações profissionais.</p>

      <section className="card">
        <div className="card__header">
          <h2>
            <User size={20} /> Dados do Psicólogo
          </h2>
        </div>

        <form className="form-grid">
          <div className="form-group">
            <label>Nome Completo</label>
            <input
              type="text"
              defaultValue="Dr. João Silva"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="form-group">
            <label>CRP</label>
            <input
              type="text"
              defaultValue="04/123456"
              placeholder="04/123456"
            />
          </div>

          <div className="form-group">
            <label>Especialidades</label>
            <input
              type="text"
              defaultValue="Terapia Cognitivo-Comportamental, Ansiedade"
              placeholder="Especialidades"
            />
          </div>

          <div className="form-group">
            <label>Valor da Consulta (R$)</label>
            <input
              type="number"
              defaultValue="180"
              placeholder="180"
            />
          </div>

          <div className="form-group form-group--full">
            <label>Biografia</label>
            <textarea
              rows="5"
              defaultValue="Psicólogo clínico com experiência em ansiedade e depressão."
              placeholder="Escreva uma breve apresentação profissional"
            />
          </div>

          <div className="form-group form-group--full">
            <label>Foto de Perfil</label>
            <input type="file" accept="image/png, image/jpeg" />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--primary">
              <Save size={18} /> Salvar
            </button>

            <button type="button" className="btn btn--secondary">
              <X size={18} /> Cancelar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}