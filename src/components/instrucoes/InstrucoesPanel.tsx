import { useState } from 'react'
import { useSettingsStore } from '../../store/settings.store'

const SECTIONS = [
  {
    icon: '⛪',
    title: 'Programa do Culto',
    content: [
      'Tem o programa do dia em dois blocos: Escola Sabatina e Culto Divino.',
      'Cada momento tem um cartão. Marca-o como feito à medida que passa.',
      'A ordem é a do programa, de cima para baixo.',
    ],
  },
  {
    icon: '⚡',
    title: 'Ações Rápidas',
    content: [
      'Muda a cena do OBS com um clique: câmara, partilha de ecrã ou os dois ao mesmo tempo.',
      'Liga e desliga o streaming sem abrir o OBS.',
      'Para os hinos, escreve o número e o VLC abre no monitor secundário.',
      'O OBS precisa de estar a correr com o WebSocket configurado nas Definições.',
    ],
  },
  {
    icon: '⬇',
    title: 'Downloads',
    content: [
      'Cola um link do YouTube ou direto, dá um nome e clica em Adicionar.',
      'O progresso aparece na fila em tempo real.',
      'Para o Boletim e a Mordomia, clica em "Actualizar lista" e os recursos do trimestre carregam sozinhos.',
      'Os ficheiros vão para a pasta que definiste nas Definições.',
    ],
  },
  {
    icon: '🤖',
    title: 'Assistente Titus',
    content: [
      'O chat fica sempre visível à direita, em qualquer ecrã.',
      'Escreve em português normal, por exemplo:',
      '"Muda para a câmara" e ele muda a cena no OBS.',
      '"Toca o hino 245" e ele abre o VLC com o ficheiro.',
      'Precisas de uma chave de API do OpenRouter nas Definições para funcionar.',
    ],
  },
  {
    icon: '⚙',
    title: 'Definições',
    content: [
      'Palavra-passe de acesso: admin / admin.',
      'Na aba OBS: host, porta, palavra-passe do WebSocket e nomes das cenas.',
      'Em Caminhos: pasta dos hinos, extensão, pasta de downloads e caminho do VLC.',
      'Em AI: a chave do OpenRouter e o modelo.',
      'Em Recursos Web: os URLs do portal adventista para o scraper.',
    ],
  },
  {
    icon: '🛑',
    title: 'Paragem de Emergência',
    content: [
      'O "STOP ALL" no canto inferior esquerdo para tudo imediatamente.',
      'Ctrl+Shift+S faz o mesmo, de qualquer ecrã.',
      'Para o VLC e corta o sinal ao OBS.',
    ],
  },
]

const TROUBLESHOOTING = [
  { problem: 'OBS não liga', solution: 'Verifica se o OBS está a correr e se o WebSocket Server está ativo (Ferramentas → Definições do Servidor WebSocket). Porta padrão: 4455.' },
  { problem: 'VLC não reproduz no segundo ecrã', solution: 'Em Definições → Caminhos, ajusta o índice do monitor. Normalmente o monitor 1 é o secundário. Confirma também o caminho do VLC.' },
  { problem: 'Assistente AI não responde', solution: 'Vai a Definições → iTitus AI e confirma que a chave está guardada. Começa com "sk-or-". Verifica também a ligação à internet.' },
  { problem: 'Hino não encontrado', solution: 'Confirma a pasta dos hinos e a extensão (ex: mp4). O ficheiro tem de ter exatamente o número do hino no nome.' },
  { problem: 'Boletim/Mordomia não carrega', solution: 'O portal pode estar em baixo. Espera uns minutos e tenta outra vez. Se continuar, verifica o URL base em Recursos Web nas Definições.' },
]

function AccordionItem({ icon, title, content }: { icon: string; title: string; content: string[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-app-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-app-surface transition-colors"
      >
        <span className="text-xl">{icon}</span>
        <span className="flex-1 font-medium text-app-high text-sm">{title}</span>
        <span className={`text-app-low text-xs transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-app-border pt-3 space-y-1.5">
          {content.map((line, i) => (
            <p key={i} className="text-sm text-app-mid leading-relaxed">
              {line.startsWith('"') ? <span className="italic text-app-low">{line}</span> : `• ${line}`}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export function InstrucoesPanel() {
  const { updateConfig } = useSettingsStore()

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-app-high">📋 Instruções de Utilização</h2>
        <p className="text-xs text-app-low mt-0.5">Clica em cada secção para expandir</p>
      </div>

      {/* Feature sections */}
      <div className="space-y-2">
        {SECTIONS.map(s => (
          <AccordionItem key={s.title} icon={s.icon} title={s.title} content={s.content} />
        ))}
      </div>

      {/* Troubleshooting */}
      <div>
        <h3 className="text-xs font-semibold text-app-mid uppercase tracking-wider mb-3">🔧 Troubleshooting Rápido</h3>
        <div className="space-y-3">
          {TROUBLESHOOTING.map(t => (
            <div key={t.problem} className="bg-app-surface border border-app-border rounded-lg px-4 py-3">
              <p className="text-sm font-medium text-app-high">{t.problem}</p>
              <p className="text-xs text-app-mid mt-0.5 leading-relaxed">{t.solution}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Re-trigger tour */}
      <div className="pt-2 pb-6 text-center">
        <button
          onClick={() => updateConfig('onboardingDone', false)}
          className="text-xs text-app-low hover:text-app-accent underline underline-offset-2 transition-colors"
        >
          Recomeçar tour de introdução
        </button>
      </div>
    </div>
  )
}
