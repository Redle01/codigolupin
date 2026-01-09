// Quiz Configuration - Easy to update URLs
export const quizConfig = {
  // External checkout URL - replace with your actual checkout link
  checkoutUrl: "https://pay.hotmart.com/YOUR_PRODUCT_ID",
  
  // Webhook URL for email marketing integration
  webhookUrl: "",
  
  // Social proof number
  totalParticipants: 12847,
};

// Quiz Questions Data
export const quizQuestions = [
  {
    id: 1,
    question: "Quando você entra numa festa ou evento social, qual situação descreve melhor o que acontece?",
    options: [
      { id: "a", text: "As pessoas me cumprimentam educadamente, mas eu fico mais observando", points: { gentleman: 3, estrategista: 1, diamante: 0, guerreiro: 1 } },
      { id: "b", text: "Converso naturalmente, mas raramente sou o centro das atenções", points: { gentleman: 2, estrategista: 2, diamante: 1, guerreiro: 0 } },
      { id: "c", text: "Algumas mulheres demonstram interesse, mas eu nunca sei como interpretar", points: { gentleman: 1, estrategista: 3, diamante: 2, guerreiro: 0 } },
      { id: "d", text: "Eu me sinto confiante, mas algo sempre \"trava\" na hora H", points: { gentleman: 0, estrategista: 2, diamante: 3, guerreiro: 1 } },
    ],
  },
  {
    id: 2,
    question: "Em relacionamentos passados, qual feedback você mais ouviu de mulheres?",
    options: [
      { id: "a", text: "\"Você é um amor, mas...\" / \"Você merece alguém especial\"", points: { gentleman: 3, estrategista: 1, diamante: 0, guerreiro: 1 } },
      { id: "b", text: "\"Você é muito bom para mim\" / \"Não quero te magoar\"", points: { gentleman: 2, estrategista: 2, diamante: 1, guerreiro: 1 } },
      { id: "c", text: "\"Somos muito diferentes\" / \"Você não entende mulheres\"", points: { gentleman: 1, estrategista: 3, diamante: 1, guerreiro: 0 } },
      { id: "d", text: "\"Você é perfeito no papel\" / \"Não sinto química\"", points: { gentleman: 2, estrategista: 1, diamante: 2, guerreiro: 2 } },
    ],
  },
  {
    id: 3,
    question: "Qual situação te frustra MAIS em eventos sociais?",
    options: [
      { id: "a", text: "Ver caras \"menos qualificados\" saindo com as mulheres que eu quero", points: { gentleman: 3, estrategista: 2, diamante: 0, guerreiro: 1 } },
      { id: "b", text: "Ser sempre o \"confidente\" que escuta sobre os problemas com outros homens", points: { gentleman: 3, estrategista: 1, diamante: 0, guerreiro: 1 } },
      { id: "c", text: "Não saber quando e como \"partir para cima\" sem parecer inconveniente", points: { gentleman: 1, estrategista: 3, diamante: 2, guerreiro: 0 } },
      { id: "d", text: "Conseguir conversar bem, mas nunca evoluir para algo romântico", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 0 } },
    ],
  },
  {
    id: 4,
    question: "Se pudesse ter uma transformação completa até o Carnaval 2026, qual seria sua maior conquista?",
    options: [
      { id: "a", text: "Ser o homem mais desejado dos blocos e camarotes que frequento", points: { gentleman: 1, estrategista: 1, diamante: 3, guerreiro: 0 } },
      { id: "b", text: "Reconquistar minha ex e mostrar que me tornei irresistível", points: { gentleman: 0, estrategista: 1, diamante: 1, guerreiro: 3 } },
      { id: "c", text: "Ter múltiplas opções românticas e poder escolher com quem ficar", points: { gentleman: 2, estrategista: 2, diamante: 3, guerreiro: 0 } },
      { id: "d", text: "Nunca mais passar por situações constrangedoras de rejeição", points: { gentleman: 2, estrategista: 3, diamante: 0, guerreiro: 2 } },
    ],
  },
  {
    id: 5,
    question: "Como você se vê atualmente em termos de sucesso com mulheres?",
    options: [
      { id: "a", text: "Tenho potencial, mas algo fundamental está faltando", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 1 } },
      { id: "b", text: "Sou um bom partido, mas mulheres não me veem romanticamente", points: { gentleman: 3, estrategista: 1, diamante: 0, guerreiro: 1 } },
      { id: "c", text: "Entendo teoria, mas travo na prática", points: { gentleman: 1, estrategista: 3, diamante: 1, guerreiro: 0 } },
      { id: "d", text: "Já tive alguns sucessos, mas nada consistente ou duradouro", points: { gentleman: 0, estrategista: 1, diamante: 3, guerreiro: 2 } },
    ],
  },
  {
    id: 6,
    question: "Qual ambiente você se sente MAIS confiante atualmente?",
    options: [
      { id: "a", text: "Trabalho e ambientes profissionais", points: { gentleman: 2, estrategista: 2, diamante: 1, guerreiro: 1 } },
      { id: "b", text: "Entre amigos próximos e família", points: { gentleman: 1, estrategista: 1, diamante: 1, guerreiro: 3 } },
      { id: "c", text: "Conversas intelectuais e culturais", points: { gentleman: 2, estrategista: 3, diamante: 1, guerreiro: 0 } },
      { id: "d", text: "Atividades que domino (esportes, hobbies, etc.)", points: { gentleman: 1, estrategista: 0, diamante: 3, guerreiro: 2 } },
    ],
  },
  {
    id: 7,
    question: "Se um método comprovado pudesse transformar sua vida romântica em 30 dias, quanto você estaria disposto a investir?",
    options: [
      { id: "a", text: "Até R$ 30 - o mínimo possível", points: { gentleman: 1, estrategista: 1, diamante: 1, guerreiro: 1 } },
      { id: "b", text: "Entre R$ 30 e R$ 50 - algo acessível", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 2 } },
      { id: "c", text: "Entre R$ 50 e R$ 100 - se realmente funcionar", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 2 } },
      { id: "d", text: "Mais de R$ 100 - resultado vale qualquer investimento", points: { gentleman: 3, estrategista: 3, diamante: 3, guerreiro: 3 } },
    ],
  },
  {
    id: 8,
    question: "Se tivesse acesso hoje a um método comprovado de transformação, quando começaria?",
    options: [
      { id: "a", text: "Imediatamente - não aguento mais a situação atual", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 3 } },
      { id: "b", text: "Esta semana - só preciso organizar minha agenda", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 2 } },
      { id: "c", text: "Este mês - quero me preparar mentalmente primeiro", points: { gentleman: 2, estrategista: 3, diamante: 2, guerreiro: 1 } },
      { id: "d", text: "Eventualmente - quando for \"a hora certa\"", points: { gentleman: 1, estrategista: 1, diamante: 1, guerreiro: 1 } },
    ],
  },
];

// Result Types
export type ResultType = "gentleman" | "estrategista" | "diamante" | "guerreiro";

export interface ResultData {
  type: ResultType;
  title: string;
  subtitle: string;
  percentage: string;
  diagnosis: string;
  transformation: string;
  ctaText: string;
}

export const quizResults: Record<ResultType, ResultData> = {
  gentleman: {
    type: "gentleman",
    title: "O Gentleman Adormecido",
    subtitle: "O homem de qualidade que mulheres respeitam mas não desejam",
    percentage: "40%",
    diagnosis: `Você é o clássico "Gentleman Adormecido" - um homem de caráter excepcional que possui todas as qualidades que mulheres dizem querer, mas que não desperta o desejo ardente que elas realmente sentem por outros homens.

Seu problema não é falta de valor - é falta de magnetismo sexual. Você foi condicionado a ser o "homem ideal no papel", mas nunca desenvolveu a aura de mistério e perigo controlado que faz mulheres fantasiarem sobre você.`,
    transformation: `O Código de Arsène Lupin vai despertar o Sedutor Aristocrata que existe dentro de você. Através da Técnica da Elegância Perigosa, você manterá toda sua sofisticação mas adicionará o elemento de imprevisibilidade que transforma "respeito" em "obsessão romântica".`,
    ctaText: "ACESSAR MEU PLANO DE TRANSFORMAÇÃO",
  },
  estrategista: {
    type: "estrategista",
    title: "O Estrategista Inseguro",
    subtitle: "O homem inteligente que pensa demais e autossabota",
    percentage: "30%",
    diagnosis: `Você é o "Estrategista Inseguro" - possui inteligência superior e entende teoricamente como sedução funciona, mas seu próprio intelecto se tornou sua prisão.

Você analisa demais, planeja excessivamente e quando chega o momento da ação, sua mente consciente interfere nos seus instintos naturais. Mulheres percebem sua hesitação como falta de confiança masculina.`,
    transformation: `O Código de Arsène Lupin vai ensinar as 12 Técnicas de Conversação Hipnótica que transformam seu intelecto de obstáculo em arma de sedução. Você aprenderá a canalizar sua inteligência para criar mistério ao invés de análise paralela.`,
    ctaText: "TRANSFORMAR MEU INTELECTO EM CHARME",
  },
  diamante: {
    type: "diamante",
    title: "O Diamante Bruto",
    subtitle: "O homem com potencial que precisa de refinamento",
    percentage: "20%",
    diagnosis: `Você é o "Diamante Bruto" - possui carisma natural e já teve alguns sucessos românticos, mas falta consistência e sofisticação para atrair mulheres de alto valor.

Você consegue despertar interesse inicial, mas não sabe como escalar elegantemente ou manter o mistério que transforma atração em obsessão. Às vezes funciona, às vezes não - e você não entende exatamente por quê.`,
    transformation: `O Código de Arsène Lupin vai polir seu diamante através do Protocolo de Conquista Parisiense. Você aprenderá a sistematizar seu sucesso e elevar seu nível para conquistar as mulheres mais sofisticadas e desejadas.`,
    ctaText: "POLIR MEU DIAMANTE AGORA",
  },
  guerreiro: {
    type: "guerreiro",
    title: "O Guerreiro Ferido",
    subtitle: "O homem que teve traumas românticos e perdeu a confiança",
    percentage: "10%",
    diagnosis: `Você é o "Guerreiro Ferido" - já foi confiante e bem-sucedido romanticamente, mas experiências dolorosas (traição, rejeição humilhante, relacionamento tóxico) abalaram sua autoestima masculina.

Agora você se protege através do isolamento ou relacionamentos "seguros" que não desafiam sua zona de conforto. Seu medo de se expor novamente está impedindo você de reconquistar seu poder natural.`,
    transformation: `O Código de Arsène Lupin vai reconstruir sua confiança através da Metamorfose do Gentleman Ladrão. Você não apenas recuperará sua confiança anterior - se tornará mais poderoso do que jamais foi.`,
    ctaText: "RECONSTRUIR MINHA CONFIANÇA",
  },
};
