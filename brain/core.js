import {
  loadMemory,
  saveMemory,
  rememberPersonal,
  learn,
  registerKnown,
  registerUnknown,
  startSession,
  registerQuestion,
  registerAnswer,
  getBrainStats
} from "./memory.js";

/* =========================================================
   JARVIS BRAIN CORE
========================================================= */

let currentSession = null;

export function initializeBrain() {
  currentSession = startSession();

  return {
    session: currentSession,
    stats: getBrainStats()
  };
}

/* =========================================================
   PROCESSAR NOVA PERGUNTA
========================================================= */

export function processQuestion(question) {

  const text = String(question || "").trim();

  if (!text) {
    return {
      valid: false,
      type: "unknown"
    };
  }

  if (!currentSession) {
    currentSession = startSession();
  }

  registerQuestion(currentSession.id);

  return {
    valid: true,
    question: text,
    sessionId: currentSession.id,
    timestamp: new Date().toISOString()
  };
}

/* =========================================================
   REGISTRAR RESPOSTA
========================================================= */

export function processAnswer(answer) {

  const text = String(answer || "").trim();

  if (!currentSession) {
    currentSession = startSession();
  }

  if (text) {
    registerAnswer(currentSession.id);
  }

  return {
    answer: text,
    sessionId: currentSession.id,
    timestamp: new Date().toISOString()
  };
}

/* =========================================================
   APRENDER INFORMAÇÃO
========================================================= */

export function learnFromUser(text) {

  const value = String(text || "").trim();

  if (!value) return false;

  learn(value);

  return true;
}

/* =========================================================
   MEMÓRIA PESSOAL
========================================================= */

export function remember(text) {

  const value = String(text || "").trim();

  if (!value) return false;

  rememberPersonal(value);

  return true;
}

/* =========================================================
   CONHECIMENTO
========================================================= */

export function markKnown(topic) {

  const value = String(topic || "").trim();

  if (!value) return false;

  registerKnown(value);

  return true;
}

/* =========================================================
   NÃO RESOLVIDO
========================================================= */

export function markUnknown(topic) {

  const value = String(topic || "").trim();

  if (!value) return false;

  registerUnknown(value);

  return true;
}

/* =========================================================
   CONTEXTO PARA A IA
========================================================= */

export function getBrainContext() {

  const memory = loadMemory();

  return {

    personal: memory.personal.slice(-50),

    learned: memory.learned.slice(-50),

    known: memory.known.slice(-50),

    unknown: memory.unknown.slice(-50),

    sessions: memory.sessions.slice(-20),

    stats: getBrainStats()

  };
}

/* =========================================================
   ESTATÍSTICAS
========================================================= */

export function getBrainState() {

  const stats = getBrainStats();

  return {

    status: "ACTIVE",

    sessions: stats.sessions,

    questions: stats.questions,

    answers: stats.answers,

    known: stats.known,

    learned: stats.learned,

    unknown: stats.unknown,

    personal: stats.personal,

    updatedAt: stats.updatedAt

  };
}

/* =========================================================
   EXPORTAÇÃO
========================================================= */

export function exportBrain() {

  return {
    context: getBrainContext(),
    state: getBrainState()
  };
}

/* =========================================================
   LIMPEZA
========================================================= */

export function resetBrain() {

  const memory = loadMemory();

  const clean = {
    ...memory,
    personal: [],
    learned: [],
    known: [],
    unknown: [],
    sessions: []
  };

  saveMemory(clean);

  currentSession = startSession();

  return getBrainState();
                       }
