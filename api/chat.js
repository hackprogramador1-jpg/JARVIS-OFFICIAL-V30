export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido."
    });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY não configurada no Vercel."
      });
    }

    const body = req.body || {};

    const message = String(body.message || "").trim();

    const memory = Array.isArray(body.memory)
      ? body.memory.slice(-50)
      : [];

    const brain = body.brain || {};

    if (!message) {
      return res.status(400).json({
        error: "Nenhuma mensagem foi enviada."
      });
    }

    const model =
      process.env.OPENAI_MODEL || "gpt-5.6-luna";

    const memoryText =
      memory.length > 0
        ? memory
            .map((item, index) => `${index + 1}. ${String(item)}`)
            .join("\n")
        : "Nenhuma memória registrada.";

    const brainText = `
Sessões: ${brain.sessions || 0}
Perguntas: ${brain.questions || 0}
Respostas: ${brain.answers || 0}
Conhecimentos conhecidos: ${brain.known || 0}
Conhecimentos aprendidos: ${brain.learned || 0}
Itens não resolvidos: ${brain.unknown || 0}
Memórias pessoais: ${brain.personal || 0}
`;

    const instructions = `
Você é JARVIS, um assistente pessoal avançado.

PERSONALIDADE:
- Inteligente.
- Objetivo.
- Natural.
- Educado.
- Responda em português do Brasil quando o usuário falar português.
- Fale como um assistente tecnológico pessoal.
- Não fique repetindo "JARVIS" em todas as frases.
- Não invente informações.
- Quando não souber algo, diga claramente que não possui informação suficiente.

OBJETIVO:
Você deve responder perguntas, explicar assuntos, analisar problemas,
ajudar em programação, tecnologia, matemática, ciência, estudos,
projetos e tarefas gerais.

MEMÓRIA:
As informações abaixo são memórias fornecidas anteriormente pelo usuário.
Use-as como contexto, mas não trate automaticamente toda informação
como verdade absoluta.

MEMÓRIA DO USUÁRIO:
${memoryText}

ESTADO DO CÉREBRO:
${brainText}

APRENDIZADO:
Se o usuário disser algo como:
"memorize que..."
"aprenda que..."
"lembre que..."
"guarde que..."

Você deve responder normalmente e, no final da resposta, adicionar:

MEMORY_TO_SAVE: informação que deve ser armazenada

Não use MEMORY_TO_SAVE para informações temporárias,
senhas, chaves de API ou dados extremamente sensíveis.

RESPOSTA:
A resposta será convertida em voz pelo sistema.
Portanto:
- Não use HTML.
- Não use Markdown excessivo.
- Não coloque tabelas enormes.
- Não escreva instruções sobre o funcionamento interno.
- Seja natural para ser falado em voz alta.

IDENTIDADE:
A interface pode usar reconhecimento de voz para detectar comandos,
mas esta API não considera a transcrição de voz como prova de identidade.
Não afirme que uma pessoa foi biometricamente autenticada.
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          instructions,
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Erro ao consultar o motor de inteligência."
      });
    }

    let answer = "";

    if (typeof data.output_text === "string") {
      answer = data.output_text;
    }

    if (!answer && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (!Array.isArray(item.content)) continue;

        for (const content of item.content) {
          if (
            content.type === "output_text" &&
            typeof content.text === "string"
          ) {
            answer += content.text;
          }
        }
      }
    }

    answer = answer.trim();

    if (!answer) {
      return res.status(500).json({
        error: "O JARVIS não retornou uma resposta."
      });
    }

    let memoryToSave = null;

    const marker = "MEMORY_TO_SAVE:";
    const markerIndex = answer.indexOf(marker);

    if (markerIndex !== -1) {
      memoryToSave = answer
        .substring(markerIndex + marker.length)
        .trim();

      answer = answer
        .substring(0, markerIndex)
        .trim();
    }

    return res.status(200).json({
      success: true,
      answer,
      memoryToSave,
      model
    });

  } catch (error) {
    console.error("JARVIS API ERROR:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Erro interno no servidor do JARVIS."
    });
  }
        }
