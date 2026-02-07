// Quiz Configuration - Easy to update URLs
export const quizConfig = {
  // URLs de checkout por fluxo condicional (baseado na Questão 7)
  checkoutUrls: {
    flow1: "https://checkout.ticto.app/OAD8936CD", // Respostas A/B na Q7
    flow2: "https://checkout.ticto.app/O6DE7A453", // Respostas C/D na Q7
  },
  
  // Mapeamento de respostas da Q7 para fluxos de oferta
  // A e B = Fluxo 1 (preço mais baixo), C e D = Fluxo 2 (premium)
  question7FlowMapping: {
    a: 1,
    b: 1,
    c: 2,
    d: 2,
  } as const,
  
  // Legacy: mantido para compatibilidade (não usado diretamente)
  checkoutUrl: "https://checkout.ticto.app/O6DE7A453",
  
  // Webhook URL for email marketing integration
  webhookUrl: "",
  
  // Social proof number
  totalParticipants: 12847,
};

// Configuração de bônus por fluxo
export const bonusConfig = {
  flow1: {
    primary: '🎁 "12 Técnicas de Conversação que Hipnotizam Mulheres"',
    primaryPrice: null as string | null,
    secondary: '🎁 "25 Frases que Desarmam Qualquer Mulher"',
    secondaryPrice: 'R$ 67',
  },
  flow2: {
    primary: '🎁 "As Confissões de Arsène Lupin"',
    primaryPrice: 'R$ 97',
    secondary: '🎁 "25 Frases que Desarmam Qualquer Mulher"',
    secondaryPrice: 'R$ 67',
  },
  pricing: {
    flow1: { emoji: "🔥", label: "OFERTA ESPECIAL para seu perfil:", installments: "9x", currency: "R$", amount: "6", cents: ",18" },
    flow2: { emoji: "🔥", label: "OFERTA ESPECIAL para seu perfil:", installments: "12x", currency: "R$", amount: "10", cents: ",03" },
  },
};

// Quiz Questions Data
export const quizQuestions = [
  {
    id: 1,
    question: "Qual dessas situações te deixa mais frustrado com mulheres?",
    options: [
      { id: "a", text: "Ver caras \"inferiores\" conquistando mulheres que você nem consegue abordar", points: { gentleman: 3, estrategista: 2, diamante: 0, guerreiro: 1 } },
      { id: "b", text: "Ser sempre o \"confidente\" que escuta sobre outros homens", points: { gentleman: 3, estrategista: 1, diamante: 0, guerreiro: 1 } },
      { id: "c", text: "Mulheres te elogiarem como \"homem ideal\" mas nunca se interessarem sexualmente", points: { gentleman: 2, estrategista: 1, diamante: 2, guerreiro: 2 } },
      { id: "d", text: "Conseguir números e conversas, mas elas sempre \"esfriam\" misteriosamente", points: { gentleman: 1, estrategista: 3, diamante: 2, guerreiro: 0 } },
    ],
  },
  {
    id: 2,
    question: "Qual frase você já ouviu demais de mulheres?",
    options: [
      { id: "a", text: "\"Você é um amor, mas...\" / \"Você merece alguém especial\"", points: { gentleman: 3, estrategista: 1, diamante: 0, guerreiro: 1 } },
      { id: "b", text: "\"Você é perfeito demais para mim\" / \"Não quero te machucar\"", points: { gentleman: 2, estrategista: 2, diamante: 1, guerreiro: 1 } },
      { id: "c", text: "\"Somos muito diferentes\" / \"Você não me entende\"", points: { gentleman: 1, estrategista: 3, diamante: 1, guerreiro: 0 } },
      { id: "d", text: "\"Você é o homem ideal no papel\" / \"Não rola química\"", points: { gentleman: 2, estrategista: 1, diamante: 2, guerreiro: 2 } },
    ],
  },
  {
    id: 3,
    question: "O que mais te incomoda em festas e eventos?",
    options: [
      { id: "a", text: "Ver homens \"menos qualificados\" saindo com as mulheres que você quer", points: { gentleman: 3, estrategista: 2, diamante: 0, guerreiro: 1 } },
      { id: "b", text: "Ficar sempre observando sem coragem de abordar", points: { gentleman: 1, estrategista: 2, diamante: 1, guerreiro: 2 } },
      { id: "c", text: "Não saber quando e como \"partir para cima\" sem parecer desesperado", points: { gentleman: 1, estrategista: 3, diamante: 2, guerreiro: 0 } },
      { id: "d", text: "Conversar bem mas nunca evoluir para algo romântico", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 0 } },
    ],
  },
  {
    id: 4,
    question: "Se pudesse ter uma transformação completa, qual seria sua maior conquista?",
    options: [
      { id: "a", text: "Ser o homem mais desejado dos ambientes que frequento", points: { gentleman: 1, estrategista: 1, diamante: 3, guerreiro: 0 } },
      { id: "b", text: "Ter múltiplas opções românticas e poder escolher", points: { gentleman: 2, estrategista: 2, diamante: 3, guerreiro: 0 } },
      { id: "c", text: "Reconquistar minha ex com um magnetismo irresistível", points: { gentleman: 0, estrategista: 1, diamante: 1, guerreiro: 3 } },
      { id: "d", text: "Nunca mais passar por situações humilhantes de rejeição", points: { gentleman: 2, estrategista: 3, diamante: 0, guerreiro: 2 } },
    ],
  },
  {
    id: 5,
    question: "Como você se vê hoje em termos de sucesso com mulheres?",
    options: [
      { id: "a", text: "Tenho potencial, mas algo crucial está faltando", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 1 } },
      { id: "b", text: "Sou um bom partido, mas mulheres não me veem romanticamente", points: { gentleman: 3, estrategista: 1, diamante: 0, guerreiro: 1 } },
      { id: "c", text: "Entendo teoria, mas travo na prática", points: { gentleman: 1, estrategista: 3, diamante: 1, guerreiro: 0 } },
      { id: "d", text: "Já tive sucessos, mas nada consistente ou duradouro", points: { gentleman: 0, estrategista: 1, diamante: 3, guerreiro: 2 } },
    ],
  },
  {
    id: 6,
    question: "Onde você se sente mais confiante atualmente?",
    options: [
      { id: "a", text: "Trabalho e ambientes profissionais", points: { gentleman: 2, estrategista: 2, diamante: 1, guerreiro: 1 } },
      { id: "b", text: "Entre amigos próximos e família", points: { gentleman: 1, estrategista: 1, diamante: 1, guerreiro: 3 } },
      { id: "c", text: "Conversas intelectuais e culturais", points: { gentleman: 2, estrategista: 3, diamante: 1, guerreiro: 0 } },
      { id: "d", text: "Atividades que domino completamente", points: { gentleman: 1, estrategista: 0, diamante: 3, guerreiro: 2 } },
    ],
  },
  {
    id: 7,
    question: "Para resolver definitivamente sua vida romântica, quanto você investiria?",
    options: [
      { id: "a", text: "Até R$ 50 - o mínimo possível", points: { gentleman: 1, estrategista: 1, diamante: 1, guerreiro: 1 } },
      { id: "b", text: "Entre R$ 50 e R$ 70 - algo acessível", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 2 } },
      { id: "c", text: "Entre R$ 70 e R$ 100 - se realmente funcionar", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 2 } },
      { id: "d", text: "Mais de R$ 100 - resultado vale qualquer investimento", points: { gentleman: 3, estrategista: 3, diamante: 3, guerreiro: 3 } },
    ],
  },
  {
    id: 8,
    question: "Se tivesse acesso hoje a um método comprovado, quando começaria?",
    options: [
      { id: "a", text: "Imediatamente - não aguento mais essa situação", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 3 } },
      { id: "b", text: "Esta semana - só preciso me organizar", points: { gentleman: 2, estrategista: 2, diamante: 2, guerreiro: 2 } },
      { id: "c", text: "Este mês - quero me preparar mentalmente", points: { gentleman: 2, estrategista: 3, diamante: 2, guerreiro: 1 } },
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
  result: string;
  potential: string;
  nextStep: string;
  ctaText: string;
}

export const quizResults: Record<ResultType, ResultData> = {
  gentleman: {
    type: "gentleman",
    title: "O Gentleman Invisível",
    subtitle: "40%",
    percentage: "40%",
    result: "Você é o clássico 'Gentleman Invisível' - um homem de valor excepcional que mulheres respeitam profundamente, mas que não desperta o fogo da paixão que elas sentem secretamente por outros homens.",
    potential: "Transformar sua elegância natural em magnetismo sexual irresistível. Você já tem 80% do que precisa - falta apenas despertar a aura de mistério e perigo controlado que faz mulheres fantasiarem sobre você.",
    nextStep: "O Código de Arsène Lupin foi criado especificamente para homens como você. Através da Técnica da Elegância Perigosa, você manterá toda sua sofisticação mas adicionará o elemento de imprevisibilidade que transforma 'respeito' em 'obsessão romântica'.",
    ctaText: "SIM, QUERO DESPERTAR MEU MAGNETISMO",
  },
  estrategista: {
    type: "estrategista",
    title: "O Estrategista Paralisado",
    subtitle: "30%",
    percentage: "30%",
    result: "Você é o 'Estrategista Paralisado' - possui inteligência superior e entende teoricamente sedução, mas seu próprio intelecto virou sua prisão. Você analisa demais e quando chega a hora H, trava.",
    potential: "Transformar seu intelecto de obstáculo em arma de sedução letal. Sua capacidade analítica pode se tornar seu maior trunfo para criar mistério e tensão sexual calculada.",
    nextStep: "O Código de Arsène Lupin vai te ensinar as 12 Técnicas de Conversação Hipnótica que transformam pensamentos demais em charme irresistível. Você aprenderá a canalizar sua inteligência para criar fascinação ao invés de análise paralela.",
    ctaText: "SIM, QUERO TRANSFORMAR ANÁLISE EM ATRAÇÃO",
  },
  diamante: {
    type: "diamante",
    title: "O Diamante Bruto",
    subtitle: "20%",
    percentage: "20%",
    result: "Você é o 'Diamante Bruto' - possui carisma natural e já teve sucessos, mas falta consistência e sofisticação para atrair mulheres de alto valor. Às vezes funciona, às vezes não.",
    potential: "Sistematizar seu sucesso natural e elevar seu nível para conquistar as mulheres mais sofisticadas e desejadas. Você tem o raw material - precisa apenas do refinamento aristocrático.",
    nextStep: "O Código de Arsène Lupin vai polir seu diamante através do Protocolo de Conquista Parisiense. Você aprenderá a escalar elegantemente e manter o mistério que transforma atração em obsessão.",
    ctaText: "SIM, QUERO REFINAR MEU DIAMANTE",
  },
  guerreiro: {
    type: "guerreiro",
    title: "O Guerreiro Ferido",
    subtitle: "10%",
    percentage: "10%",
    result: "Você é o 'Guerreiro Ferido' - já foi confiante romanticamente, mas experiências dolorosas (traição, rejeição humilhante) abalaram sua autoestima masculina. Agora se protege através do isolamento.",
    potential: "Reconstruir sua confiança e se tornar mais poderoso do que jamais foi. Suas feridas podem se transformar em força magnética se você souber como canalizar essa experiência.",
    nextStep: "O Código de Arsène Lupin vai reconstruir sua confiança através da Metamorfose do Gentleman Ladrão. Você não apenas recuperará sua confiança anterior - se tornará blindado contra rejeição.",
    ctaText: "SIM, QUERO RECONSTRUIR MINHA CONFIANÇA",
  },
};
