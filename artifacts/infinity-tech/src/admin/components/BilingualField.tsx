import { useState, useCallback, useRef, useEffect } from "react";
import { Languages, Loader2, Check, AlertCircle, RefreshCw, Wand2 } from "lucide-react";
import { useTranslation, detectLang } from "@/admin/hooks/useTranslation";

interface BilingualFieldProps {
  label: string;
  sub?: string;
  enValue: string;
  arValue: string;
  onEnChange: (v: string) => void;
  onArChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  enPlaceholder?: string;
  arPlaceholder?: string;
}

const inputBase =
  "w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

type TranslateDir = "en→ar" | "ar→en";
type TranslateState = "idle" | "loading" | "done" | "error";

export default function BilingualField({
  label,
  sub,
  enValue,
  arValue,
  onEnChange,
  onArChange,
  multiline = false,
  rows = 3,
  enPlaceholder = "Write in English…",
  arPlaceholder = "اكتب بالعربية…",
}: BilingualFieldProps) {
  const { translate, error, clearError } = useTranslation();
  const [state, setState] = useState<TranslateState>("idle");
  const [provider, setProvider] = useState<string>("");
  const [lastDir, setLastDir] = useState<TranslateDir | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoMode, setAutoMode] = useState(true);

  // Auto-translate: fires 1.2 s after user stops typing in EITHER field
  function scheduleTranslate(text: string, from: "en" | "ar", to: "en" | "ar") {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doTranslate(text, from, to), 1200);
  }

  async function doTranslate(text: string, from: string, to: string) {
    if (!text.trim()) return;
    const dir: TranslateDir = `${from}→${to}` as TranslateDir;
    setState("loading");
    setLastDir(dir);
    const result = await translate(text, from, to);
    if (result) {
      if (to === "ar") onArChange(result.translatedText);
      else onEnChange(result.translatedText);
      setProvider(result.cached ? "cache" : result.provider);
      setState("done");
      setTimeout(() => setState("idle"), 2500);
    } else {
      setState("error");
    }
  }

  function handleEnChange(v: string) {
    onEnChange(v);
    if (autoMode && v.trim().length > 3) scheduleTranslate(v, "en", "ar");
  }

  function handleArChange(v: string) {
    onArChange(v);
    if (autoMode && v.trim().length > 3) scheduleTranslate(v, "ar", "en");
  }

  const isLoading = state === "loading";
  const isDone = state === "done";
  const isError = state === "error";
  const targetSide = lastDir === "en→ar" ? "ar" : "en";

  const statusBadge = (
    <div className="flex items-center gap-2 flex-wrap">
      {isLoading && (
        <span className="flex items-center gap-1 text-xs text-primary">
          <Loader2 className="w-3 h-3 animate-spin" />
          Translating…
        </span>
      )}
      {isDone && (
        <span className="flex items-center gap-1 text-xs text-emerald-400">
          <Check className="w-3 h-3" />
          Translated {provider === "cache" ? "(from cache)" : provider ? `via ${provider}` : ""}
        </span>
      )}
      {isError && error && (
        <span className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="w-3 h-3" />
          {error}
          <button onClick={() => { clearError(); setState("idle"); }} className="underline">dismiss</button>
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className="flex items-center gap-2">
          {statusBadge}
          {/* Auto-translate toggle */}
          <button
            onClick={() => setAutoMode(m => !m)}
            title={autoMode ? "Auto-translate ON — click to disable" : "Auto-translate OFF — click to enable"}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
              autoMode
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wand2 className="w-3 h-3" />
            {autoMode ? "Auto" : "Manual"}
          </button>
          {/* Manual translate buttons */}
          {!autoMode && (
            <>
              <button
                onClick={() => enValue.trim() && doTranslate(enValue, "en", "ar")}
                disabled={isLoading || !enValue.trim()}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted/30 border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Translate EN → AR"
              >
                <Languages className="w-3 h-3" />
                EN → AR
              </button>
              <button
                onClick={() => arValue.trim() && doTranslate(arValue, "ar", "en")}
                disabled={isLoading || !arValue.trim()}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted/30 border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Translate AR → EN"
              >
                <Languages className="w-3 h-3" />
                AR → EN
              </button>
            </>
          )}
        </div>
      </div>

      {/* Input grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* English side */}
        <div className="relative">
          <label className="block text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1 ml-0.5">English</label>
          <div className="relative">
            {multiline ? (
              <textarea
                className={inputBase + " resize-none"}
                rows={rows}
                value={enValue}
                onChange={e => handleEnChange(e.target.value)}
                placeholder={enPlaceholder}
                dir="ltr"
              />
            ) : (
              <input
                className={inputBase}
                value={enValue}
                onChange={e => handleEnChange(e.target.value)}
                placeholder={enPlaceholder}
                dir="ltr"
              />
            )}
            {isLoading && targetSide === "ar" && (
              <Loader2 className="absolute right-2 top-2.5 w-3.5 h-3.5 text-primary animate-spin" />
            )}
          </div>
        </div>

        {/* Arabic side */}
        <div className="relative">
          <label className="block text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1 ml-0.5 text-right">العربية</label>
          <div className="relative">
            {multiline ? (
              <textarea
                className={inputBase + " resize-none text-right"}
                rows={rows}
                value={arValue}
                onChange={e => handleArChange(e.target.value)}
                placeholder={arPlaceholder}
                dir="rtl"
              />
            ) : (
              <input
                className={inputBase + " text-right"}
                value={arValue}
                onChange={e => handleArChange(e.target.value)}
                placeholder={arPlaceholder}
                dir="rtl"
              />
            )}
            {isLoading && targetSide === "ar" && (
              <div className="absolute inset-0 rounded-lg bg-primary/5 border border-primary/20 pointer-events-none flex items-center justify-center">
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Translating…
                </div>
              </div>
            )}
            {isLoading && targetSide === "en" && (
              <div className="absolute inset-0 rounded-lg bg-primary/5 border border-primary/20 pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
