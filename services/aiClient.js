const DEFAULT_SUMMARY = 'AI summary will appear here once configured.';

// Azure OpenAI (Cognitive Services) config
const hasOpenAI = Boolean(
  process.env.AZURE_OPENAI_ENDPOINT &&
  process.env.AZURE_OPENAI_API_KEY &&
  process.env.AZURE_OPENAI_DEPLOYMENT
);
const OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const OPENAI_KEY = process.env.AZURE_OPENAI_API_KEY || '';
const OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || '';
const OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2024-06-01';

// Azure AI Foundry (Models-as-a-Service) config
const hasMaas = Boolean(process.env.AZURE_MAAS_ENDPOINT && process.env.AZURE_MAAS_KEY);
const MAAS_ENDPOINT = process.env.AZURE_MAAS_ENDPOINT || '';
const MAAS_KEY = process.env.AZURE_MAAS_KEY || '';
const MAAS_MODEL = process.env.AZURE_MAAS_MODEL || 'gpt-4.1';
const MAAS_DEPLOYMENT = process.env.AZURE_MAAS_DEPLOYMENT || '';

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  try {
    const mod = await import('node-fetch');
    return mod.default;
  } catch (e) {
    throw new Error('Fetch is not available. Install node-fetch or use Node 18+.');
  }
}

async function chat(messages, { temperature = 0.2, max_tokens = 300 } = {}) {
  const f = await getFetch();
  if (hasOpenAI) {
    const url = `${OPENAI_ENDPOINT.replace(/\/+$/, '')}/openai/deployments/${OPENAI_DEPLOYMENT}/chat/completions?api-version=${encodeURIComponent(OPENAI_API_VERSION)}`;
    const headers = {
      'api-key': OPENAI_KEY,
      'Content-Type': 'application/json'
    };
    const body = JSON.stringify({ messages, temperature, max_tokens });
    const res = await f(url, { method: 'POST', headers, body });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Azure OpenAI error ${res.status}: ${text}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }
  if (hasMaas) {
    const url = `${MAAS_ENDPOINT.replace(/\/+$/, '')}/v1/chat/completions`;
    const headers = {
      'Authorization': `Bearer ${MAAS_KEY}`,
      'Content-Type': 'application/json'
    };
    if (MAAS_DEPLOYMENT) headers['azureml-model-deployment'] = MAAS_DEPLOYMENT;
    const body = JSON.stringify({ model: MAAS_MODEL, messages, temperature, max_tokens });
    const res = await f(url, { method: 'POST', headers, body });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Azure MAAS error ${res.status}: ${text}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }
  throw new Error('No Azure AI configuration found. Set AZURE_OPENAI_* or AZURE_MAAS_* in .env');
}

async function summarizeTicket(description) {
  if (!description || typeof description !== 'string') {
    return DEFAULT_SUMMARY;
  }
  if (!hasMaas) {
    const trimmed = description.trim();
    if (trimmed.length <= 160) return trimmed;
    const firstPeriod = trimmed.indexOf('.') !== -1 ? trimmed.indexOf('.') + 1 : 160;
    return trimmed.substring(0, Math.max(80, Math.min(firstPeriod, 200))).trim();
  }

  const system = { role: 'system', content: 'You are an IT helpdesk assistant. Summarize tickets clearly and concisely for triage.' };
  const user = { role: 'user', content: `Summarize this ticket in 1-3 sentences, highlighting problem, impact, and key details:\n\n${description}` };
  return chat([system, user], { temperature: 0.1, max_tokens: 200 });
}

async function suggestCategoryPriority(description) {
  if (!hasMaas) {
    const text = (description || '').toLowerCase();
    let category = 'Other';
    if (/(printer|keyboard|mouse|monitor|laptop|hardware)/.test(text)) category = 'Hardware';
    if (/(install|crash|bug|application|software|error)/.test(text)) category = 'Software';
    if (/(wifi|network|internet|connection|vpn|latency)/.test(text)) category = 'Network';
    let priority = 2;
    if (/(cannot|can't|down|urgent|critical|deadline|exam|testing|production)/.test(text)) priority = 4;
    else if (/(slow|degraded|intermittent|frequent)/.test(text)) priority = 3;
    else if (/(minor|cosmetic|feature request)/.test(text)) priority = 1;
    return { category, priority, rationale: 'Placeholder heuristic until Azure AI is configured.' };
  }

  const system = { role: 'system', content: 'Classify IT helpdesk tickets. Respond ONLY with strict JSON.' };
  const user = { role: 'user', content: `Classify this ticket. Return JSON with keys: category in ["Hardware","Software","Network","Other"], priority in [1,2,3,4], rationale.\n\n${description}` };
  const text = await chat([system, user], { temperature: 0.1, max_tokens: 200 });
  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch (e) {
    // fallback if model responded with non-JSON text
    return { category: 'Other', priority: 2, rationale: text };
  }
}

module.exports = { summarizeTicket, suggestCategoryPriority };
