import { SYSTEM_PROMPT } from './knowledge.mjs';

// Modèle du palier gratuit de Gemini ; modifiable sans toucher au code via la variable GEMINI_MODEL.
const MODEL = 'gemini-3.5-flash-lite';
const MAX_MESSAGES = 10;
const MAX_CHARS = 500;
const MAX_REQUESTS_PER_MINUTE = 8;

// Limite de débit simple par IP (par instance de la fonction ; suffisant pour un portfolio).
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) for (const [key, times] of hits) if (!times.some(t => now - t < 60_000)) hits.delete(key);
  return recent.length > MAX_REQUESTS_PER_MINUTE;
}

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export default async (request, context) => {
  if (request.method !== 'POST') return json(405, { error: 'Méthode non permise.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json(500, { error: "L'assistant n'est pas configuré." });

  if (rateLimited(context.ip || 'inconnu')) {
    return json(429, { error: 'Trop de messages. Réessayez dans une minute.' });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: 'Requête invalide.' });
  }

  const messages = (Array.isArray(payload.messages) ? payload.messages : [])
    .filter(m => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_MESSAGES)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return json(400, { error: 'Message manquant.' });
  }
  // L'API exige que la conversation commence par un message utilisateur.
  while (messages[0].role !== 'user') messages.shift();

  try {
    const model = process.env.GEMINI_MODEL || MODEL;
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
      }),
    });
    if (upstream.status === 429) return json(429, { error: "L'assistant est très sollicité. Réessayez dans un moment." });
    if (!upstream.ok) {
      console.error('Erreur API Gemini', upstream.status, await upstream.text());
      return json(502, { error: "L'assistant est indisponible pour le moment." });
    }
    const data = await upstream.json();
    const reply = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
    return json(200, { reply: reply || "Je n'ai pas de réponse pour cette question." });
  } catch (error) {
    console.error('Erreur réseau', error);
    return json(502, { error: "L'assistant est indisponible pour le moment." });
  }
};

export const config = { path: '/api/chat' };
