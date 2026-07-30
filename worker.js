// 13:20 Bar — leaderboard Worker (Cloudflare Workers + KV)
// Endpoints:
//   GET  /scores           -> top 10 [{name, score}]
//   POST /scores {name,score} -> saves if it's a personal/board improvement, returns top 10
// Bind a KV namespace named  SCORES  (see wrangler.toml).

const TOP_N = 10;
const KEY = "leaderboard";
const MAX_NAME = 12;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

async function getBoard(env) {
  const raw = await env.SCORES.get(KEY);
  return raw ? JSON.parse(raw) : [];
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (url.pathname === "/scores" && request.method === "GET") {
      const board = await getBoard(env);
      return json(board.slice(0, TOP_N));
    }

    if (url.pathname === "/scores" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return json({ error: "bad json" }, 400); }

      let name = String(body.name ?? "").trim().slice(0, MAX_NAME);
      let score = Math.floor(Number(body.score));
      if (!name) name = "—";
      if (!Number.isFinite(score) || score < 0 || score > 1e7) {
        return json({ error: "bad score" }, 400);
      }
      // strip control chars / keep it clean
      name = name.replace(/[\u0000-\u001F<>]/g, "");

      const board = await getBoard(env);
      board.push({ name, score, t: Date.now() });
      board.sort((a, b) => b.score - a.score);
      const trimmed = board.slice(0, 50); // keep a buffer, expose top 10
      await env.SCORES.put(KEY, JSON.stringify(trimmed));

      return json(trimmed.slice(0, TOP_N));
    }

    return json({ error: "not found" }, 404);
  },
};
