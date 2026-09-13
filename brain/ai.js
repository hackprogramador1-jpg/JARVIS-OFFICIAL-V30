import {
  processQuestion,
  processAnswer,
  learnFromUser,
  remember,
  markKnown,
  markUnknown,
  getBrainContext
} from "./core.js";

/*
  ============================================================
  JARVIS AI BRIDGE
  ============================================================

  Este arquivo conecta:

  VOZ
    ↓
  CÉREBRO
    ↓
  API
    ↓
  INTELIGÊNCIA
    ↓
  MEMÓRIA
*/

export async function askJarvis(message) {

  const question = processQuestion(message);

  if (!question.valid) {
    return {
      success: false,
      error: "Pergunta vazia."
    };
  }

  try {

    const context = getBrainContext();

    const response = await fetch("/api/chat", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        message: question.question,

        memory: context.personal
          .map(item => item.text),

        brain: {

          personal: context.stats.personal,

          learned: context.stats.learned,

          known: context.stats.known,

          unknown: context.stats.unknown,

          sessions: context.stats.sessions,

          questions: context.stats.questions,

          answers: context.stats.answers

        }

      })

    });

    const data = await response.json();

    if (!response.ok) {

      markUnknown(question.question);

      return {
        success: false,
        error:
          data.error ||
          "O cérebro não conseguiu processar a pergunta."
      };
    }

    const answer =
      String(data.answer || "").trim();

    if (!answer) {

      markUnknown(question.question);

      return {
        success: false,
        error:
          "O JARVIS não retornou uma resposta."
      };
    }

    /*
      Resposta processada com sucesso.
    */

    processAnswer(answer);

    markKnown(question.question);

    /*
      Caso a API tenha identificado uma
      informação para guardar.
    */

    if (data.memoryToSave) {

      const memory =
        String(data.memoryToSave).trim();

      if (memory) {
        remember(memory);
        learnFromUser(memory);
      }
    }

    return {

      success: true,

      answer,

      memoryToSave:
        data.memoryToSave || null,

      brain:
        getBrainContext()

    };

  } catch (error) {

    console.error(
      "JARVIS AI ERROR:",
      error
    );

    markUnknown(question.question);

    return {

      success: false,

      error:
        "Não foi possível conectar ao motor de inteligência."

    };
  }
}
