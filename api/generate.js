import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { guion, tipo, dificultad, notas } = req.body;

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `Eres experto en crear contenido viral para TikTok e Instagram. Tono: conversacional, datos duros, hooks fuertes.

GUION:
${guion}

Tipo: ${tipo}
Dificultad: ${dificultad}
${notas ? `Notas: ${notas}` : ""}

Genera en formato doble columna:

[TITULO]

GUION (lo que habla):
[timecode] [dialog]

EDICION (anotaciones):
[timecode] [imagen], [texto], [efecto], [música]

Sin iconos, solo texto limpio. Branding Archivo Criollo.`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    res.status(200).json({
      content: message.content[0].text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
