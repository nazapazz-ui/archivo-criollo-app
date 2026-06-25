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

    const prompt = `Eres un experto en crear scripts virales para TikTok. Tu tarea es convertir este guion en videos cortos con hooks pegadizos.

GUION:
${guion}

Tipo de contenido: ${tipo}
Dificultad de edición: ${dificultad}
${notas ? `Notas especiales: ${notas}` : ""}

DEVUELVE HTML formateado (sin <!DOCTYPE>, sin <html>, sin <head>, solo <body>). Estructura de cada video:

<div class="video-card">
  <h2>📱 VIDEO [N]: "[TITULO]"</h2>
  <div class="video-meta">
    <div class="meta-item"><strong>⏱</strong> [DURACION] segundos</div>
    <div class="meta-item"><strong>📐</strong> Vertical (9:16)</div>
    <div class="meta-item"><strong>⭐</strong> <span class="difficulty ${dificultad.toLowerCase()}">${dificultad}</span></div>
  </div>
  <div class="hook-box">💭 <strong>HOOK:</strong> "[TEXTO ATRAPADOR CORTO]"</div>
  <div class="script-container">
    <div class="script-column">
      <h3>📝 Lo que hablas (GUION)</h3>
      <div class="script-segment">
        <span class="timecode">[TIMECODE]</span>
        <span class="dialog">"[TEXTO DEL DIALOGO]"</span>
      </div>
      [REPETIR PARA CADA SEGMENTO]
    </div>
    <div class="script-column">
      <h3>🎨 Anotaciones de edición</h3>
      <div class="annotation-segment">
        <span class="timecode">[TIMECODE]</span>
        <ul class="annotation-list">
          <li>[ANOTACION 1]</li>
          <li>[ANOTACION 2]</li>
        </ul>
      </div>
      [REPETIR PARA CADA SEGMENTO]
    </div>
  </div>
  <div class="instruction-box">
    <h4>🎯 Checklist de edición en CapCut:</h4>
    <ol>
      <li>[PASO 1]</li>
      <li>[PASO 2]</li>
    </ol>
  </div>
</div>

Genera 3-5 videos seguidos (sin repetir estructura, variar en duración y complejidad).
Hooks deben ser CORTOS, directos, inquietantes.
Textos en diálogos: naturales, conversacionales, con datos duros.
Anotaciones: específicas (nombre de efectos CapCut, tipos de zoom, música descriptiva).
Branding: menciona "Archivo Criollo" al final de algunos videos.
Sin iconos de emojis en los titulos, solo en etiquetas de sección.`;

    const message = await client.messages.create({
      model: "claude-opus-4-8",
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
