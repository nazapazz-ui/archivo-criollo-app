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
    const { guion, tipo, generar, dificultad, notas, efemeride } = req.body;

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `Eres un experto en crear scripts virales para TikTok e Instagram. Tu tarea es convertir este guion en contenido específico.

GUION:
${guion}

${efemeride ? `EFEMÉRIDE/NOTICIA A CONECTAR:
${efemeride}

INSTRUCCIÓN: Mezcla el guion con esta noticia. Crea contenido que combine ambos, haciendo que la efeméride sea relevante a la historia del guion.` : ""}

QUÉ GENERAR: ${generar}
Tipo de contenido: ${tipo}
Dificultad de edición: ${dificultad}
${notas ? `Notas especiales: ${notas}` : ""}

IMPORTANTE:
- Si pide "1video": GENERA 1 video corto (15-45 seg)
- Si pide "3": GENERA 3 videos variados (diferentes duraciones y ángulos)
- Si pide "5": GENERA 5 videos completos
- Si pide "carrusel": GENERA estructura para carrusel Instagram (5-8 slides)
- Si pide "todo": GENERA 5 videos + carrusel + checklist

DEVUELVE HTML MINIMALISTA (sin <!DOCTYPE>, sin <html>, sin <head>, solo <body>):

<div class="video-card">
  <h2>VIDEO [N]: "[TITULO]"</h2>
  <div class="video-meta">
    <div class="meta-item"><strong>⏱</strong> [DURACION] seg</div>
    <div class="meta-item"><strong>Formato:</strong> Vertical (9:16)</div>
    <div class="meta-item"><span class="difficulty ${dificultad.toLowerCase()}">${dificultad}</span></div>
  </div>
  <div class="hook-box"><strong>HOOK:</strong> "[TEXTO CORTO]"</div>
  <div class="script-container">
    <div class="script-column">
      <h3>Lo que hablas</h3>
      <div class="script-segment">
        <span class="timecode">[TIMECODE]</span>
        <span class="dialog">"[DIALOGO]"</span>
      </div>
    </div>
    <div class="script-column">
      <h3>Anotaciones de edición</h3>
      <div class="annotation-segment">
        <span class="timecode">[TIMECODE]</span>
        <ul class="annotation-list">
          <li>[Anotación]</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="instruction-box">
    <h4>Checklist:</h4>
    <ol>
      <li>[Paso]</li>
    </ol>
  </div>
</div>

Sé CONCISO. Hooks cortos (máx 10 palabras). Diálogos naturales, datos duros. Anotaciones directas, sin descripciones largas.
Para carrusels: 5-8 slides máximo, cada uno con título + texto + diseño. No escribas párrafos largos.
Incluye logo "Archivo Criollo" en último video/slide. Sin emojis en títulos.

COLORES: USA SOLO la paleta Archivo Criollo:
- Azul principal: #2E5090
- Amarillo: #FFC107
- Negro: #000000
- Blanco: #ffffff (fondo)
NO uses otros colores, tonos grises, ni variaciones. Solo estos 4.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3500,
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
