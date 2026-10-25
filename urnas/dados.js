/* Rota das Urnas: todos os números da página ficam aqui.
   Para atualizar: preencha "t2" (2º turno) com {f: votos do Flávio, l: votos do Lula}
   e troque o "status". Quando t2 é null, a página mostra "aguardando".
   f = Flávio Bolsonaro (PL), l = Lula (PT).
   status: "doc" = Documentado (TSE ou resultado completo), "aberto" = Em aberto (parcial),
           "alegacao" = Alegação (número ainda não confirmado). */
window.URNAS = {
  atualizado: "25 de outubro de 2026, 19h15 no Japão (7h15 em Brasília)",

  brasil: {
    t1: { f: 56104503, l: 53879538, validos: 119300788 },
    t2: null
  },

  // 1º turno: votos de quem ficou de fora (TSE). Esses votos estão "em disputa" no 2º turno.
  outros: [
    ["Augusto Cury (Avante)", 3448569],
    ["Renan Santos (Missão)", 2675887],
    ["Ronaldo Caiado (PSD)", 2605148],
    ["Romeu Zema (Novo)", 326488],
    ["Samara Martins (UP)", 122911],
    ["Outros 5 candidatos", 137744]
  ],

  // 1º turno por região: votos e % dos válidos (TSE, 100% apurado).
  regioes: [
    { nome: "Nordeste",     estados: 9, t1: { f: 10398973, fp: 30.9, l: 21494584, lp: 63.8 }, t2: null },
    { nome: "Sudeste",      estados: 4, t1: { f: 24899609, fp: 51.4, l: 19237398, lp: 39.7 }, t2: null },
    { nome: "Sul",          estados: 3, t1: { f: 10519148, fp: 60.1, l: 5476524,  lp: 31.3 }, t2: null },
    { nome: "Norte",        estados: 7, t1: { f: 5009437,  fp: 49.2, l: 4550602,  lp: 44.6 }, t2: null },
    { nome: "Centro-Oeste", estados: 4, t1: { f: 5133436,  fp: 56.5, l: 2963043,  lp: 32.6 }, t2: null }
  ],

  exterior: {
    t1: { f: 143900, l: 157387, fp: 43.49, lp: 47.57 },
    t2: null
  },

  // Lugares do exterior. t1 sem votos (só %) é aceito: use {fp, lp}.
  lugares: [
    { nome: "Japão · Nagoia", grupo: "Japão",
      t1: { f: 11480, l: 2022 }, t2: { f: 13284, l: 2877 }, status: "aberto",
      nota: "2º turno: 58 boletins, todos os da jurisdição. Soma feita a partir dos boletins de urna, antes da totalização do TSE." },
    { nome: "Japão · Hamamatsu", grupo: "Japão",
      t1: { f: 4698, l: 884 }, t2: { f: 5484, l: 1226 }, status: "aberto",
      nota: "2º turno: 18 boletins, o mesmo número do 1º turno. Soma dos boletins de urna." },
    { nome: "Japão · Tóquio", grupo: "Japão",
      t1: { f: 8423, l: 2328 }, t2: null, status: "aberto",
      nota: "2º turno: boletins ainda não somados nas fontes consultadas." },
    { nome: "Nova Zelândia", grupo: "Oceania",
      t1: { f: 64, l: 234 }, t2: { f: 101, l: 418 }, status: "aberto",
      nota: "Seção de Wellington. Primeiro país a fechar as urnas." },
    { nome: "Austrália · Sydney", grupo: "Oceania",
      t1: { fp: 32.04, lp: 55.71 }, t2: { f: 1745, l: 2871 }, status: "alegacao",
      nota: "2º turno: número de 13 boletins postado em rede social e ainda não confirmado. 1º turno só em %." },
    { nome: "Coreia do Sul", grupo: "Ásia",
      t1: { f: 72, l: 123 }, t2: { f: 82, l: 148 }, status: "doc",
      nota: "Seção de Seul, apuração concluída." },
    { nome: "China", grupo: "Ásia",
      t1: { f: 203, l: 367 }, t2: { f: 267, l: 502 }, status: "aberto",
      nota: "Comparação aproximada: o 1º turno soma os boletins de Pequim, Xangai, Cantão e Hong Kong divulgados no dia; a fonte do 2º turno não detalha as cidades." },
    { nome: "Filipinas", grupo: "Ásia",
      t1: { f: 33, l: 26 }, t2: { f: 39, l: 27 }, status: "aberto", nota: "Seção de Manila." },
    { nome: "Singapura", grupo: "Ásia",
      t1: null, t2: { f: 121, l: 213 }, status: "aberto", nota: "Sem número completo do 1º turno nas fontes consultadas." },
    { nome: "Malásia", grupo: "Ásia",
      t1: null, t2: { f: 44, l: 41 }, status: "aberto", nota: "No 1º turno as fontes só trazem os 44 votos de Lula." },
    { nome: "Estados Unidos", grupo: "Américas",
      t1: { f: 45004, l: 23335 }, t2: null, status: "doc", nota: "Maior eleitorado no exterior: 265 mil aptos." },
    { nome: "Canadá", grupo: "Américas",
      t1: { f: 7043, l: 12508 }, t2: null, status: "doc", nota: "" },
    { nome: "Portugal", grupo: "Europa",
      t1: { f: 19412, l: 26401 }, t2: null, status: "doc", nota: "2º maior eleitorado no exterior." }
  ]
};
