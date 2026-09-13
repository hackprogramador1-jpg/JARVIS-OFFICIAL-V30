const SESSION_KEY = "JARVIS_ACTIVE_SESSION_V1";

function createId() {
  return (
    "JARVIS-" +
    Date.now() +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

export function createSession() {
  const session = {
    id: createId(),
    startedAt: new Date().toISOString(),
    questions: 0,
    answers: 0,
    events: []
  };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return session;
}

export function getSession() {
  try {
    const saved =
      localStorage.getItem(SESSION_KEY);

    if (!saved) {
      return createSession();
    }

    return JSON.parse(saved);

  } catch {
    return createSession();
  }
}

export function updateSession(changes = {}) {
  const session = getSession();

  const updated = {
    ...session,
    ...changes
  };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(updated)
  );

  return updated;
}

export function addQuestion() {
  const session = getSession();

  session.questions++;

  session.events.push({
    type: "question",
    timestamp: new Date().toISOString()
  });

  return updateSession(session);
}

export function addAnswer() {
  const session = getSession();

  session.answers++;

  session.events.push({
    type: "answer",
    timestamp: new Date().toISOString()
  });

  return updateSession(session);
}

export function addEvent(type, data = {}) {
  const session = getSession();

  session.events.push({
    type,
    data,
    timestamp: new Date().toISOString()
  });

  return updateSession(session);
}

export function getSessionStats() {
  const session = getSession();

  return {
    id: session.id,
    startedAt: session.startedAt,
    questions: session.questions,
    answers: session.answers,
    events: session.events.length
  };
}

export function endSession() {
  const session = getSession();

  session.endedAt =
    new Date().toISOString();

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return session;
}
