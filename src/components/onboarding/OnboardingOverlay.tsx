import { useState, useEffect } from "react";
import { useSettingsStore } from "../../store/settings.store";

const STEPS = [
  {
    icon: "👋",
    title: "Bem-vindo ao iTitus",
    body: "Feito para a IASD Paivas. OBS, VLC, downloads e o iTitus AI numa só janela, para não andares a saltar entre programas durante o culto.",
  },
  {
    icon: "⛪",
    title: "Programa do Culto",
    body: 'O ecrã "Culto" tem o programa do dia dividido em Escola Sabatina e Culto Divino. Vai marcando os momentos à medida que o culto avança.',
  },
  {
    icon: "⚡",
    title: "Ações Rápidas",
    body: "Muda a cena do OBS com um clique e dá play nos hinos direto para um segundo monitor via VLC. Tudo sem tocar no OBS.",
  },
  {
    icon: "⬇",
    title: "Downloads",
    body: "Descarrega vídeos do YouTube ou por link direto. O Boletim Missionário e a Mordomia têm um botão para buscar os recursos do trimestre atual automaticamente.",
  },
  {
    icon: "🤖",
    title: "Assistente AI",
    body: 'O chat à direita está sempre visível. Escreve em português normal, tipo "muda  para a câmara" ou "toca o hino 245", e ele faz.',
  },
  {
    icon: "⚙",
    title: "Definições",
    body: "Aqui configuras a ligação ao OBS, o caminho do VLC, a pasta dos hinos e a chave de API. Protegido por palavra-passe — admin / admin para entrares.",
  },
  {
    icon: "🛑",
    title: "Pronto para começar!",
    body: 'Uma coisa a não esquecer: Ctrl+Shift+S para tudo de imediato. O "STOP ALL" no  canto inferior esquerdo faz o mesmo. Para quando algo corre mal ao vivo.',
  },
];

export function OnboardingOverlay() {
  const [step, setStep] = useState(0);
  const { updateConfig } = useSettingsStore();

  const finish = () => updateConfig("onboardingDone", true);
  const next = () =>
    step < STEPS.length - 1 ? setStep((s) => s + 1) : finish();
  const back = () => setStep((s) => Math.max(0, s - 1));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
      else if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-app-surface border border-app-border rounded-2xl shadow-2xl w-[480px] flex flex-col overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-app-border">
          <div
            className="h-1 bg-app-accent transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center gap-4">
          <div className="text-6xl">{current.icon}</div>
          <h2 className="text-xl font-bold text-app-high">{current.title}</h2>
          <p className="text-app-mid text-sm leading-relaxed">
            {current.body}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 pb-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-app-accent" : "bg-app-border"}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-8 pb-8 pt-4">
          <button
            onClick={finish}
            className="text-xs text-app-low hover:text-app-mid transition-colors"
          >
            Saltar
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={back}
                className="px-4 py-2 text-sm border border-app-border rounded-lg text-app-mid hover:bg-app-border transition-colors"
              >
                Anterior
              </button>
            )}
            <button
              onClick={next}
              className="px-5 py-2 text-sm bg-app-accent hover:bg-app-accent-hover text-app-on-accent rounded-lg font-medium transition-colors"
            >
              {isLast ? "Começar" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
