import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Copy, Check, RefreshCw, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BANGLA_API = 'http://localhost:8001';

type ConversionMode = 'english-to-bangla' | 'bijoy-to-unicode' | 'unicode-to-bijoy';

const MODES = [
  { id: 'english-to-bangla' as ConversionMode, label: 'English → Bangla', placeholder: 'Type romanized Bangla…  e.g. amar nam' },
  { id: 'bijoy-to-unicode' as ConversionMode, label: 'Bijoy → Unicode',    placeholder: 'Paste Bijoy-encoded text here…' },
  { id: 'unicode-to-bijoy' as ConversionMode, label: 'Unicode → Bijoy',    placeholder: 'আপনার Unicode টেক্সট এখানে লিখুন…' },
];

export default function BanglaConverter() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ConversionMode>('english-to-bangla');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [copied, setCopied] = useState(false);
  const convertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Health check on mount
  useEffect(() => {
    fetch(`${BANGLA_API}/health`)
      .then(r => r.ok ? setApiStatus('online') : setApiStatus('offline'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const doConvert = useCallback(async (text: string, m: ConversionMode) => {
    if (!text.trim()) { setOutput(''); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BANGLA_API}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode: m }),
      });
      const data = await res.json();
      setOutput(data.output_text ?? '');
    } catch {
      setOutput('⚠️ Could not reach the Bangla API at localhost:8001');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (mode !== 'english-to-bangla') { setSuggestions([]); return; }
    const words = text.trim().split(/\s+/);
    const last = words[words.length - 1];
    if (!last || last.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`${BANGLA_API}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partial: last, max_results: 6 }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch {
      setSuggestions([]);
    }
  }, [mode]);

  // Debounced auto-convert
  useEffect(() => {
    if (convertTimer.current) clearTimeout(convertTimer.current);
    convertTimer.current = setTimeout(() => doConvert(input, mode), 350);
    return () => { if (convertTimer.current) clearTimeout(convertTimer.current); };
  }, [input, mode, doConvert]);

  // Debounced suggestions
  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => fetchSuggestions(input), 400);
    return () => { if (suggestTimer.current) clearTimeout(suggestTimer.current); };
  }, [input, fetchSuggestions]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    if (mode === 'bijoy-to-unicode') setMode('unicode-to-bijoy');
    else if (mode === 'unicode-to-bijoy') setMode('bijoy-to-unicode');
  };

  const handleClear = () => { setInput(''); setOutput(''); setSuggestions([]); };

  const applySuggestion = (bangla: string) => {
    // Replace last word in output with chosen suggestion
    const outputWords = output.split(/(\s+)/);
    for (let i = outputWords.length - 1; i >= 0; i--) {
      if (outputWords[i].trim()) { outputWords[i] = bangla; break; }
    }
    setOutput(outputWords.join(''));
    setSuggestions([]);
  };

  const currentMode = MODES.find(m2 => m2.id === mode)!;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold tracking-tight"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-800">Bangla Converter</span>
            <span className="text-xs text-slate-400 font-medium tracking-tight">Test Page</span>
          </div>

          {/* API status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight ${
            apiStatus === 'online'   ? 'bg-green-50 text-green-700 border border-green-200' :
            apiStatus === 'offline'  ? 'bg-red-50 text-red-600 border border-red-200' :
                                       'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            {apiStatus === 'online'  ? <Wifi size={13} />    :
             apiStatus === 'offline' ? <WifiOff size={13} /> :
             <Loader2 size={13} className="animate-spin" />}
            {apiStatus === 'online' ? 'API online' : apiStatus === 'offline' ? 'API offline' : 'Checking…'}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
        {/* Offline warning */}
        {apiStatus === 'offline' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 tracking-tight">
            <strong>Bangla API is not running.</strong> Start it with{' '}
            <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">
              cd bangla-backend &amp;&amp; python -m uvicorn main:app --port 8001
            </code>
          </div>
        )}

        {/* Mode tabs */}
        <div className="flex flex-wrap gap-2">
          {MODES.map(m2 => (
            <button
              key={m2.id}
              onClick={() => setMode(m2.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-tight transition-all border-2 ${
                mode === m2.id
                  ? 'bg-violet-600 border-violet-600 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-violet-400'
              }`}
            >
              {m2.label}
            </button>
          ))}
        </div>

        {/* Text areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input */}
          <div className="bg-white rounded-xl border-2 border-slate-200 flex flex-col overflow-hidden focus-within:border-violet-400 transition-colors">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Input</span>
              <span className="text-xs text-slate-400 tracking-tight">{input.length} chars</span>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={currentMode.placeholder}
              className="flex-1 p-4 text-lg resize-none outline-none bg-transparent text-slate-900 placeholder-slate-300 min-h-[200px]"
              style={{ fontFamily: "'Noto Sans Bengali', 'DM Sans', sans-serif" }}
            />
          </div>

          {/* Output */}
          <div className="bg-white rounded-xl border-2 border-slate-200 flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Output</span>
              <div className="flex items-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin text-violet-500" />}
                <span className="text-xs text-slate-400 tracking-tight">{output.length} chars</span>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Converted text appears here…"
              className="flex-1 p-4 text-lg resize-none outline-none bg-slate-50/50 text-slate-900 placeholder-slate-300 min-h-[200px]"
              style={{ fontFamily: "'Noto Sans Bengali', 'DM Sans', sans-serif" }}
            />
            {output && (
              <button
                onClick={handleCopy}
                className={`absolute top-10 right-3 p-2 rounded-lg border-2 transition-all ${
                  copied
                    ? 'border-green-400 bg-green-50 text-green-600'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-violet-400 hover:text-violet-600'
                }`}
                title="Copy output"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-violet-100 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Suggestions for last word</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => applySuggestion(s)}
                  className="px-4 py-1.5 bg-violet-50 border-2 border-violet-200 rounded-full text-violet-700 font-semibold text-base hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all"
                  style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSwap}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-lg text-sm font-semibold tracking-tight text-slate-700 hover:border-violet-400 hover:text-violet-600 transition-all"
          >
            <RefreshCw size={15} />
            Swap
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-lg text-sm font-semibold tracking-tight text-slate-700 hover:border-red-300 hover:text-red-500 transition-all"
          >
            Clear
          </button>
        </div>

        {/* Quick test examples */}
        <div className="bg-white rounded-xl border-2 border-slate-100 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Quick test examples</p>
          <div className="flex flex-wrap gap-2">
            {[
              { text: 'amar nam rahim', m: 'english-to-bangla' as ConversionMode },
              { text: 'tumi kemon acho', m: 'english-to-bangla' as ConversionMode },
              { text: 'bangladesh amader desh', m: 'english-to-bangla' as ConversionMode },
              { text: 'bhalo theko', m: 'english-to-bangla' as ConversionMode },
              { text: 'shubho shokal', m: 'english-to-bangla' as ConversionMode },
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => { setMode(ex.m); setInput(ex.text); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium tracking-tight hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all font-mono"
              >
                {ex.text}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
