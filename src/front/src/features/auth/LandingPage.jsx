import { useRef } from "react";

export function LandingPage({ onLogin, onRegister }) {

    const sectionRef = useRef(null);

    const scrollToSection = () => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-[#f5f5f7] text-[#1f2937] overflow-hidden">

            {/* BACKGROUND EFFECTS */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[120px] rounded-full" />

            {/* NAVBAR */}
            <header className="relative z-10 border-b border-zinc-200 shadow-sm backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <span className="font-bold text-xl text-white">Ψ</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">PsiHub</h1>
                            <p className="text-xs text-zinc-400">Plataforma psicológica</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Entrar → tela de login (única para todos os perfis) */}
                        <button
                            onClick={onLogin}
                            className="px-5 py-2.5 rounded-xl border border-zinc-200 shadow-sm bg-white hover:bg-zinc-50 transition"
                        >
                            Entrar
                        </button>

                        {/* Criar conta → scroll suave até a seção de escolha de perfil */}
                        <button
                            onClick={scrollToSection}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 transition shadow-lg shadow-violet-500/30 text-white"
                        >
                            Criar conta
                        </button>
                    </div>

                </div>
            </header>

            {/* HERO */}
            <section className="relative z-10">
                <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT */}
                    <div>
                        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-600 px-4 py-2 rounded-full mb-8">
                            <div className="w-2 h-2 rounded-full bg-violet-400" />
                            <span className="text-sm">Plataforma moderna para psicologia</span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-black leading-tight">
                            Conectando
                            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                                {" "}psicólogos{" "}
                            </span>
                            e pacientes
                        </h2>

                        <p className="text-zinc-500 text-xl mt-8 leading-relaxed max-w-2xl">
                            O PsiHub é uma plataforma desenvolvida para facilitar
                            consultas, comunicação, agendamentos e acompanhamento
                            psicológico em um único lugar.
                        </p>

                        {/* FEATURES */}
                        <div className="grid sm:grid-cols-2 gap-4 mt-10">
                            <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-5">
                                <h3 className="font-semibold text-lg mb-2">Agendamentos Online</h3>
                                <p className="text-zinc-400 text-sm">Marque consultas rapidamente.</p>
                            </div>
                            <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-5">
                                <h3 className="font-semibold text-lg mb-2">Comunicação Segura</h3>
                                <p className="text-zinc-400 text-sm">Converse com privacidade.</p>
                            </div>
                            <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-5">
                                <h3 className="font-semibold text-lg mb-2">Gestão Profissional</h3>
                                <p className="text-zinc-400 text-sm">Organize sua agenda e pacientes.</p>
                            </div>
                            <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-5">
                                <h3 className="font-semibold text-lg mb-2">Acompanhamento</h3>
                                <p className="text-zinc-400 text-sm">Histórico e evolução do paciente.</p>
                            </div>
                        </div>

                        {/* BUTTONS — também descem até a seção de escolha */}
                        <div className="flex flex-wrap gap-4 mt-10">
                            <button
                                onClick={scrollToSection}
                                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 transition font-semibold text-lg shadow-xl shadow-violet-500/30 text-white"
                            >
                                Encontrar psicólogo
                            </button>
                            <button
                                onClick={scrollToSection}
                                className="px-7 py-4 rounded-2xl border border-zinc-200 shadow-sm bg-white hover:bg-zinc-50 transition font-semibold text-lg"
                            >
                                Sou psicólogo
                            </button>
                        </div>
                    </div>

                    {/* RIGHT — apresentação das funcionalidades do PsiHub */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 blur-3xl rounded-full" />

                        <div className="relative bg-white border border-zinc-200 rounded-[32px] p-8 shadow-2xl">

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-lg">Ψ</div>
                                <div>
                                    <p className="font-semibold text-base">PsiHub</p>
                                    <p className="text-xs text-zinc-400">Plataforma psicológica completa</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {[
                                    { icon: "👥", title: "Conexão psicólogo–paciente", desc: "Pacientes encontram profissionais qualificados. Psicólogos ampliam sua carteira de clientes." },
                                    { icon: "📅", title: "Agendamento integrado", desc: "Agenda online com confirmações automáticas, sem vai-e-vem de mensagens." },
                                    { icon: "📈", title: "Linha do tempo do paciente", desc: "Histórico de sessões, evoluções e anotações em ordem cronológica." },
                                    { icon: "🗂️", title: "Gestão de dados clínicos", desc: "Prontuários e registros organizados e seguros em um só lugar." },
                                    { icon: "💬", title: "Comunicação segura", desc: "Canal direto entre psicólogo e paciente, com privacidade garantida." },
                                ].map((f) => (
                                    <div key={f.title} className="flex items-start gap-3 bg-zinc-50 rounded-2xl p-4">
                                        <span className="text-xl">{f.icon}</span>
                                        <div>
                                            <p className="font-medium text-sm">{f.title}</p>
                                            <p className="text-zinc-400 text-xs mt-0.5">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                </div>
            </section>

            {/* SEÇÃO DE ESCOLHA DE PERFIL — âncora do scroll da navbar */}
            <section ref={sectionRef} className="relative z-10 py-20 border-t border-zinc-200">
                <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold">Como podemos ajudar?</h2>
                        <p className="text-zinc-400 text-xl mt-5">Escolha a melhor opção para você</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">

                        {/* PACIENTE — onRegister("paciente") direciona ao cadastro de paciente */}
                        <div className="bg-white border border-zinc-200 shadow-sm rounded-[32px] p-10 hover:border-violet-300 transition">
                            <div className="inline-flex px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 mb-6">
                                Sou paciente
                            </div>
                            <h3 className="text-4xl font-bold mb-6">Quero encontrar um psicólogo</h3>
                            <div className="space-y-4 text-zinc-500 mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                                    Especialistas qualificados
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                                    Consultas online
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                                    Agendamento simples
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                                    Acompanhamento contínuo
                                </div>
                            </div>
                            <button
                                onClick={() => onRegister("paciente")}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 transition font-semibold text-lg text-white"
                            >
                                Encontrar psicólogo
                            </button>
                        </div>

                        {/* PSICÓLOGO — onRegister("psicologo") direciona ao cadastro de psicólogo */}
                        <div className="bg-white border border-zinc-200 shadow-sm rounded-[32px] p-10 hover:border-fuchsia-300 transition">
                            <div className="inline-flex px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-600 mb-6">
                                Sou psicólogo
                            </div>
                            <h3 className="text-4xl font-bold mb-6">Quero me cadastrar na plataforma</h3>
                            <div className="space-y-4 text-zinc-500 mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
                                    Gerencie sua agenda
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
                                    Organize pacientes
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
                                    Plataforma profissional
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-fuchsia-400" />
                                    Expanda sua presença online
                                </div>
                            </div>
                            <button
                                onClick={() => onRegister("psicologo")}
                                className="w-full py-4 rounded-2xl border border-zinc-200 shadow-sm bg-white hover:bg-zinc-50 transition font-semibold text-lg"
                            >
                                Criar perfil profissional
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative z-10 border-t border-zinc-200 py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-500">© 2026 PsiHub — Todos os direitos reservados</p>
                    <div className="flex items-center gap-6 text-zinc-400">
                        <span>Privacidade</span>
                        <span>Segurança</span>
                        <span>Termos</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}
