import { Router } from "express";

const router = Router();

// ── Language detection ────────────────────────────────────
function detectLang(text: string): "ar" | "en" {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  return arabicChars / text.replace(/\s/g, "").length > 0.2 ? "ar" : "en";
}

// ── Provider: MyMemory (free, no key required) ────────────
async function translateMyMemory(text: string, from: string, to: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
  const data = await res.json() as any;
  if (data.responseStatus !== 200) throw new Error(data.responseDetails || "MyMemory error");
  return data.responseData.translatedText;
}

// ── Provider: Google Translate v2 ─────────────────────────
async function translateGoogle(text: string, from: string, to: string, apiKey: string): Promise<string> {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: from, target: to, format: "text" }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json() as any;
  if (!res.ok) throw new Error(data.error?.message || "Google Translate error");
  return data.data?.translations?.[0]?.translatedText ?? (() => { throw new Error("Empty Google response"); })();
}

// ── Provider: DeepL ───────────────────────────────────────
async function translateDeepL(text: string, from: string, to: string, apiKey: string): Promise<string> {
  // Determine if free or pro API (free keys end with :fx)
  const base = apiKey.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const res = await fetch(`${base}/v2/translate`, {
    method: "POST",
    headers: {
      "Authorization": `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [text],
      source_lang: from.toUpperCase(),
      target_lang: to === "ar" ? "AR" : "EN-US",
    }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json() as any;
  if (!res.ok) throw new Error(data.message || "DeepL error");
  return data.translations?.[0]?.text ?? (() => { throw new Error("Empty DeepL response"); })();
}

// ── Route: POST /api/translate ────────────────────────────
router.post("/translate", async (req, res) => {
  try {
    const { text, from, to } = req.body as { text?: string; from?: string; to?: string };

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "text is required" });
    }
    if (!from || !to) {
      return res.status(400).json({ error: "from and to language codes are required" });
    }
    if (from === to) {
      return res.json({ translatedText: text, provider: "none", detected: from });
    }

    // If no explicit from, auto-detect
    const sourceLang = from === "auto" ? detectLang(text) : from;

    const googleKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    const deeplKey  = process.env.DEEPL_API_KEY;

    let translatedText: string;
    let provider: string;

    if (googleKey) {
      translatedText = await translateGoogle(text, sourceLang, to, googleKey);
      provider = "google";
    } else if (deeplKey) {
      translatedText = await translateDeepL(text, sourceLang, to, deeplKey);
      provider = "deepl";
    } else {
      translatedText = await translateMyMemory(text, sourceLang, to);
      provider = "mymemory";
    }

    return res.json({ translatedText, provider, detected: sourceLang });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    return res.status(500).json({ error: message });
  }
});

// ── Route: POST /api/detect-language ─────────────────────
router.post("/detect-language", (req, res) => {
  const { text } = req.body as { text?: string };
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text is required" });
  }
  return res.json({ language: detectLang(text) });
});

export default router;
