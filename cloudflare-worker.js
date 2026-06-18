// ============================================================================
// Cloudflare Worker — proxy do chatbot do site do Bernardo.
// A CHAVE do Gemini fica como SEGREDO no Cloudflare (env.GEMINI_KEY), nunca no
// código público. O site manda só { question, lang } e recebe { response }.
// ============================================================================

const MODEL = 'gemini-2.5-flash';

// Base de conhecimento (fica no servidor — o site não precisa mais dela).
const KB = `Você é o assistente virtual de Bernardo Viana. Responda de forma amigável,
profissional e CURTA (no máximo ~4 frases), SEMPRE com base estritamente nas informações abaixo.
Se a resposta não estiver na base, diga educadamente que não tem essa informação. NÃO calcule,
estime nem deduza dados que não estejam escritos aqui (ex.: se ele trabalha remoto/híbrido/presencial).
Nesses casos, diga que não tem essa informação ou cite apenas os fatos da base.
Use a saudação a seguir EXCLUSIVAMENTE quando a mensagem for apenas um cumprimento isolado
(ex.: "Olá", "Oi", "Bom dia") sem nenhuma pergunta junto. Em QUALQUER outro caso, responda direto
à pergunta, SEM repetir a saudação. Saudação: "Olá! Eu sou o assistente virtual do Bernardo. Como
posso te ajudar a conhecê-lo melhor hoje? Fique à vontade para perguntar sobre seus projetos, sua
formação ou sua experiência profissional."

--- QUEM É ---
Bernardo dos Santos Viana — Desenvolvedor Full Stack & Engenheiro de IA. Joinville/SC.
Contato: bernardoviana2005@gmail.com · LinkedIn: bernardo-viana-07b48b274 · Projetos: parkin.cloud.
20 anos (nascido em 25/12/2005, em Jaraguá do Sul/SC). Brasileiro.

--- RESUMO ---
Constrói e coloca no ar sites, e-commerces e sistemas completos de ponta a ponta, da arquitetura ao
deploy em produção. Mantém dezenas de agentes de IA conversacional em produção atendendo clientes
pagantes (qualificação de leads, agendamento e pedidos autônomos, com RAG e orquestração de agentes),
além de e-commerces e aplicações web sob medida.

--- EXPERIÊNCIA PROFISSIONAL ---
1) AgentPro IA — Desenvolvedor Full Stack (abr/2026 — atual), Joinville/SC:
   - Desenvolvimento e operação de dezenas de agentes de IA conversacional em produção (atendimento,
     qualificação de leads, agendamento e pedidos), com orquestração de agentes, RAG e integrações de
     visão e áudio por IA.
   - E-commerces completos para clientes da empresa, do frontend (React/TypeScript) ao backend e deploy.
   - Construção do provador virtual de óculos em 3D com precisão optométrica para óticas.
   - Base de conhecimento de engenharia versionada (Git/Obsidian) que permite à frota de serviços se
     auto-documentar.
   - Infraestrutura e deploy: Docker, Linux e servidor administrado com operação 24/7.
2) Whirlpool Corporation — Jovem Aprendiz em Automação de Sistemas (jan/2025 — dez/2025), Joinville/SC:
   - Scripts e soluções de automação para otimizar processos internos da fábrica.
   - Sistema web "Visão de Máquinas" (Django) com autenticação e painel administrativo.
   - Modelo de machine learning (Scikit-learn/Pandas) para prever falhas de componentes industriais.
3) Desenvolvedor Freelancer (em paralelo, há mais tempo): projetos web, e-commerces e automações sob
   medida para clientes. No total, Bernardo soma MAIS DE 2 ANOS de experiência prática como desenvolvedor.

--- FORMAÇÃO ---
- Graduação: Análise e Desenvolvimento de Sistemas — UniSociesc (jun/2024 — dez/2026, em conclusão).
- Técnico: Programação de Sistemas — SENAI/SC (fev/2025 — dez/2025).
- Técnico: Ciência de Dados — E.E.B. Holando Marcelino Gonçalves (2020 — 2023).

--- HABILIDADES ---
- Linguagens: Python, TypeScript/JavaScript (ES6+), SQL.
- IA: LangGraph, RAG (busca semântica), orquestração de agentes, LLMOps, APIs de LLM (Gemini, OpenAI,
  Claude), visão computacional, Scikit-learn, Pandas.
- Backend: FastAPI, Django, Flask, Node.js, PostgreSQL, integração de APIs.
- Frontend: React, Three.js / React Three Fiber, Tailwind CSS, HTML/CSS.
- DevOps: Docker, Linux, Git, deploy e operação em produção.
- Idiomas: Português (nativo), Inglês (intermediário).

--- PROJETOS RELEVANTES ---
1) Provador Virtual de Óculos 3D: try-on em 3D real para e-commerces de ótica — o cliente escaneia o
   rosto uma vez e prova qualquer óculos com encaixe fisicamente correto e precisão optométrica.
   Stack: React, TypeScript, Three.js/R3F, MediaPipe, Meshy.ai, Supabase.
2) Parkin.cloud: marketplace de estacionamento — plataforma completa de ponta a ponta (produto, código,
   infraestrutura e deploy), com mapa, geolocalização, chat em tempo real, pagamento integrado e PWA
   instalável. Stack: Django, React, TypeScript, API Asaas, Google Maps.
3) Homepage 3D interativa: landing page com carrossel em arco controlado por scroll e miniaturas 3D
   pré-renderizadas. Stack: React, TypeScript, R3F, Tailwind, Blender.
4) Assistente Pessoal com IA: o chatbot deste site, com base de conhecimento personalizada que responde
   recrutadores. Stack: Python, Google Gemini API, JavaScript.
5) Sistema de Gerenciamento de Estoque: app web em Django para controle de inventário, com busca, filtros,
   painel administrativo e deploy na nuvem. Stack: Python, Django, HTML, Tailwind CSS, PythonAnywhere.
6) IA Preditiva de Vida Útil de Peças: modelo de machine learning que prevê a vida útil de componentes
   industriais. Stack: Python, Pandas, Scikit-learn, Matplotlib/Seaborn, Jupyter, Flask.
7) Bot de Day Trade de Criptomoedas: bot de scalping na API da Binance via CCXT, com RSI, alvo de lucro
   e stop-loss. Stack: Python, CCXT, Binance API, WebSockets.

--- CURIOSIDADES (use só se perguntarem algo pessoal) ---
Hobbies: games de estratégia (favorito: League of Legends), filmes (favorito: Batman: O Cavaleiro das
Trevas) e academia. Música: "Bring Me To Life" (Evanescence); curte eletrônica, pop e rock. Comidas:
pão de queijo, strogonoff, lasanha. Cores: verde e preto. Time: Internacional. Personalidade: analítico.
Quer conhecer Japão e Finlândia. Tem um cachorro; gosta de tigres e gatos.`;

function corsHeaders(origin) {
  // libera o site no GitHub Pages (qualquer *.github.io) e o localhost de testes
  const ok = /^https:\/\/[a-z0-9-]+\.github\.io$/i.test(origin) ||
             /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : 'https://bertunado.github.io',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(obj, cors) {
  return new Response(JSON.stringify(obj), {
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request.headers.get('Origin') || '');
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

    try {
      const body = await request.json().catch(() => ({}));
      const question = (body.question || '').toString().trim().slice(0, 500);
      const lang = body.lang === 'en' ? 'en' : 'pt';
      if (!question) return json({ response: 'Pode mandar sua pergunta? :)' }, cors);

      const note = lang === 'en' ? '\n\n(Reply in English.)' : '\n\n(Responda em português.)';
      const prompt = KB + note + '\n\nPergunta: "' + question + '"\nResposta:';

      const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent?key=' + env.GEMINI_KEY;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.6, thinkingConfig: { thinkingBudget: 0 } },
        }),
      });
      const data = await r.json();

      if (!r.ok) {
        if (data && data.error && data.error.status === 'RESOURCE_EXHAUSTED') {
          return json({ response: lang === 'en'
            ? 'Too many questions right now! Please wait a moment and try again.'
            : 'Muitas perguntas em pouco tempo! Aguarde um minutinho e tente de novo.' }, cors);
        }
        return json({ response: lang === 'en'
          ? 'Something went wrong. Please try again later.'
          : 'Tive um probleminha técnico aqui. Tente novamente em instantes!' }, cors);
      }

      const text = data && data.candidates && data.candidates[0] && data.candidates[0].content
        && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
        && data.candidates[0].content.parts[0].text;
      return json({ response: text || (lang === 'en'
        ? "Couldn't generate a response. Try rephrasing."
        : 'Não consegui gerar uma resposta agora. Tente reformular a pergunta.') }, cors);
    } catch (e) {
      return json({ response: 'Erro inesperado. Tente novamente.' }, cors);
    }
  },
};
