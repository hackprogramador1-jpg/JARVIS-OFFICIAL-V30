const STORAGE_KEY = "JARVIS_BRAIN_MEMORY_V1";

const DEFAULT_MEMORY = {
  personal: [],
  learned: [],
  known: [],
  unknown: [],
  sessions: [],
  updatedAt: null
};

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_MEMORY));
}

export function loadMemory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return cloneDefault();
    }

    const parsed = JSON.parse(saved);

    return {
      ...cloneDefault(),
      ...parsed,
      personal: Array.isArray(parsed.personal)
        ? parsed.personal
        : [],
      learned: Array.isArray(parsed.learned)
        ? parsed.learned
        : [],
      known: Array.isArray(parsed.known)
        ? parsed.known
        : [],
      unknown: Array.isArray(parsed.unknown)
        ? parsed.unknown
        : [],
      sessions: Array.isArray(parsed.sessions)
        ? parsed.sessions
        : []
    };

  } catch (error) {
    console.error(
      "Erro ao carregar memória do JARVIS:",
      error
    );

    return cloneDefault();
  }
}

export function saveMemory(memory) {
  const data = {
    ...cloneDefault(),
    ...memory,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  return data;
}

export function rememberPersonal(text) {
  const memory = loadMemory();

  memory.personal.push({
    text: String(text).trim(),
    createdAt: new Date().toISOString()
  });

  return saveMemory(memory);
}

export function learn(text) {
  const memory = loadMemory();

  memory.learned.push({
    text: String(text).trim(),
    createdAt: new Date().toISOString()
  });

  return saveMemory(memory);
}

export function registerKnown(topic) {
  const memory = loadMemory();

  memory.known.push({
    topic: String(topic).trim(),
    createdAt: new Date().toISOString()
  });

  return saveMemory(memory);
}

export function registerUnknown(topic) {
  const memory = loadMemory();

  memory.unknown.push({
    topic: String(topic).trim(),
    createdAt: new Date().toISOString()
  });

  return saveMemory(memory);
}

export function startSession() {
  const memory = loadMemory();

  const session = {
    id:
      "session_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 8),

    startedAt:
      new Date().toISOString(),

    questions: 0,
    answers: 0
  };

  memory.sessions.push(session);

  saveMemory(memory);

  return session;
}

export function registerQuestion(sessionId) {
  const memory = loadMemory();

  const session =
    memory.sessions.find(
      item => item.id === sessionId
    );

  if (session) {
    session.questions++;
  }

  return saveMemory(memory);
}

export function registerAnswer(sessionId) {
  const memory = loadMemory();

  const session =
    memory.sessions.find(
      item => item.id === sessionId
    );

  if (session) {
    session.answers++;
  }

  return saveMemory(memory);
}

export function getBrainStats() {
  const memory = loadMemory();

  return {
    personal: memory.personal.length,
    learned: memory.learned.length,
    known: memory.known.length,
    unknown: memory.unknown.length,
    sessions: memory.sessions.length,

    questions: memory.sessions.reduce(
      (total, session) =>
        total + Number(session.questions || 0),
      0
    ),

    answers: memory.sessions.reduce(
      (total, session) =>
        total + Number(session.answers || 0),
      0
    ),

    updatedAt: memory.updatedAt
  };
}

export function exportMemory() {
  return loadMemory();
}

export function clearMemory() {
  localStorage.removeItem(STORAGE_KEY);

  return cloneDefault();
}
