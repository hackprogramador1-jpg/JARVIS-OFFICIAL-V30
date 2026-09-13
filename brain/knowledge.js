const KNOWLEDGE_KEY = "JARVIS_KNOWLEDGE_V1";

const DEFAULT_KNOWLEDGE = {
  known: [],
  learned: [],
  unknown: [],
  learning: []
};

function load() {
  try {
    const saved =
      localStorage.getItem(KNOWLEDGE_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_KNOWLEDGE);
    }

    const data = JSON.parse(saved);

    return {
      known: Array.isArray(data.known)
        ? data.known
        : [],

      learned: Array.isArray(data.learned)
        ? data.learned
        : [],

      unknown: Array.isArray(data.unknown)
        ? data.unknown
        : [],

      learning: Array.isArray(data.learning)
        ? data.learning
        : []
    };

  } catch {
    return structuredClone(DEFAULT_KNOWLEDGE);
  }
}

function save(data) {
  localStorage.setItem(
    KNOWLEDGE_KEY,
    JSON.stringify(data)
  );

  return data;
}

/* =========================
   CONHECIMENTO CONHECIDO
========================= */

export function addKnown(topic) {
  const data = load();

  const value = String(topic).trim();

  if (!value) return data;

  const exists = data.known.some(
    item => item.topic === value
  );

  if (!exists) {
    data.known.push({
      topic: value,
      createdAt: new Date().toISOString()
    });
  }

  return save(data);
}

/* =========================
   CONHECIMENTO APRENDIDO
========================= */

export function addLearned(topic, source = "user") {
  const data = load();

  const value = String(topic).trim();

  if (!value) return data;

  data.learned.push({
    topic: value,
    source,
    createdAt: new Date().toISOString()
  });

  return save(data);
}

/* =========================
   ASSUNTO DESCONHECIDO
========================= */

export function addUnknown(topic) {
  const data = load();

  const value = String(topic).trim();

  if (!value) return data;

  const exists = data.unknown.some(
    item => item.topic === value
  );

  if (!exists) {
    data.unknown.push({
      topic: value,
      createdAt: new Date().toISOString()
    });
  }

  return save(data);
}

/* =========================
   EM APRENDIZADO
========================= */

export function addLearning(topic) {
  const data = load();

  const value = String(topic).trim();

  if (!value) return data;

  const exists = data.learning.some(
    item => item.topic === value
  );

  if (!exists) {
    data.learning.push({
      topic: value,
      startedAt: new Date().toISOString()
    });
  }

  return save(data);
}

/* =========================
   RESOLVER DESCONHECIDO
========================= */

export function resolveUnknown(topic) {
  const data = load();

  const value = String(topic).trim();

  data.unknown =
    data.unknown.filter(
      item => item.topic !== value
    );

  return save(data);
}

/* =========================
   CONSULTAR CÉREBRO
========================= */

export function getKnowledge() {
  return load();
}

/* =========================
   ESTATÍSTICAS
========================= */

export function getKnowledgeStats() {
  const data = load();

  return {
    known: data.known.length,
    learned: data.learned.length,
    unknown: data.unknown.length,
    learning: data.learning.length
  };
}

/* =========================
   EXPORTAR CONHECIMENTO
========================= */

export function exportKnowledge() {
  return load();
}

/* =========================
   LIMPAR BASE LOCAL
========================= */

export function clearKnowledge() {
  localStorage.removeItem(KNOWLEDGE_KEY);

  return structuredClone(
    DEFAULT_KNOWLEDGE
  );
                       }
