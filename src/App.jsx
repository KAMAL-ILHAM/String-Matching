import { useMemo, useRef, useState } from 'react'
import { buildDFA, searchDFA } from './lib/dfa'
import { extractPdfText } from './lib/pdf'
import Panel from './components/Panel'
import HighlightedText from './components/HighlightedText'
import DfaDiagram from './components/DfaDiagram'
import TransitionTable from './components/TransitionTable'
import FiveTuple from './components/FiveTuple'

export default function App() {
  const [pattern, setPattern] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const fileRef = useRef(null)

  const dfa = useMemo(() => (pattern ? buildDFA(pattern, caseSensitive) : null), [pattern, caseSensitive])

  const reset = () => setResult(null)

  const run = () => {
    setError('')
    if (!pattern) return setError('Kata/frasa pencarian tidak boleh kosong.')
    if (!text) return setError('Teks dokumen kosong. Ketik teks atau unggah file .txt / .pdf.')
    const t0 = performance.now()
    const matches = searchDFA(dfa, text)
    const ms = performance.now() - t0
    setResult({ matches, ms, text, m: dfa.m })
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(''); reset()
    const ext = file.name.split('.').pop().toLowerCase()
    try {
      if (ext === 'txt' || file.type === 'text/plain') {
        setBusy('Membaca file…')
        setText(await file.text())
      } else if (ext === 'pdf' || file.type === 'application/pdf') {
        const out = await extractPdfText(file, (i, n) => setBusy(`Mengekstrak PDF: halaman ${i}/${n}`))
        if (!out.trim()) throw new Error('PDF tidak berisi teks yang dapat diekstrak (mungkin hasil scan/gambar).')
        setText(out)
      } else {
        throw new Error('Format file tidak valid. Hanya .txt dan .pdf yang didukung.')
      }
      setFileName(file.name)
    } catch (err) {
      setError(err.message || 'Gagal membaca file.')
    } finally {
      setBusy('')
    }
  }

  const example = () => { setPattern('ABABC'); setCaseSensitive(true); setText('ABABABC'); setFileName(''); reset(); setError('') }

  const btn = 'rounded-lg px-4 py-3 text-sm font-medium transition min-h-11'
  return (
    <div className="min-h-screen bg-cream text-slate-800">
      <header className="border-b border-mist bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <h1 className="text-xl font-bold text-navy sm:text-2xl">DFA <span className="text-brand">String Matching</span></h1>
          <p className="text-sm text-slate-600">Pencarian pola dengan Deterministic Finite Automaton — satu pemindaian, O(n).</p>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl items-start gap-4 px-4 py-6 lg:grid-cols-2">
        {/* Kolom kiri */}
        <div className="min-w-0 space-y-4">
          <Panel title="Pencarian">
            <label className="mb-1 block text-sm text-slate-600" htmlFor="pat">Kata / frasa</label>
            <input id="pat" value={pattern} onChange={(e) => { setPattern(e.target.value); reset() }}
              onKeyDown={(e) => e.key === 'Enter' && run()} placeholder="mis. ABABC"
              className="w-full rounded-lg border border-mist bg-white px-3 py-3 font-mono text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
            <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={caseSensitive} onChange={(e) => { setCaseSensitive(e.target.checked); reset() }} className="h-5 w-5 accent-brand" />
              Case-sensitive
            </label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button onClick={run} disabled={!!busy} className={`${btn} flex-1 bg-navy text-white hover:bg-brand disabled:opacity-50`}>Cari dengan DFA</button>
              <button onClick={example} className={`${btn} border border-mist hover:bg-sand`}>Contoh ABABC</button>
            </div>
            {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          </Panel>

          <Panel title="Dokumen">
            <input ref={fileRef} type="file" accept=".txt,.pdf,text/plain,application/pdf" onChange={onFile} className="hidden" />
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button onClick={() => fileRef.current.click()} disabled={!!busy} className={`${btn} border border-mist hover:bg-sand disabled:opacity-50`}>Unggah .txt / .pdf</button>
              {text && <button onClick={() => { setText(''); setFileName(''); reset() }} className={`${btn} text-slate-600 hover:text-navy`}>Bersihkan</button>}
              <span className="min-w-0 break-all text-xs text-slate-500">{busy || fileName}</span>
            </div>
            <textarea value={text} onChange={(e) => { setText(e.target.value); reset() }} rows={9} placeholder="Ketik/tempel teks, atau unggah file…"
              className="w-full rounded-lg border border-mist bg-white p-3 font-mono text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
            <p className="mt-1 text-xs text-slate-500">{text.length.toLocaleString()} karakter</p>
          </Panel>

          {result && (
            <Panel title="Teks dengan highlight">
              <HighlightedText text={result.text} matches={result.matches} m={result.m} />
            </Panel>
          )}
        </div>

        {/* Kolom kanan */}
        <div className="min-w-0 space-y-4">
          <Panel title="Statistik">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ['Kemunculan', result ? result.matches.length.toLocaleString() : '—'],
                ['Waktu (ms)', result ? result.ms.toFixed(3) : '—'],
                ['Jumlah state', dfa ? dfa.states : '—'],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0 rounded-lg bg-cream p-3">
                  <div className="break-all text-base font-bold text-navy sm:text-xl">{v}</div>
                  <div className="text-xs text-slate-500">{k}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Hasil pencarian">
            {!result ? <p className="text-sm text-slate-500">Jalankan pencarian untuk melihat posisi.</p>
              : result.matches.length === 0 ? <p className="text-sm text-amber-700">Pattern tidak ditemukan dalam teks.</p>
              : (<>
                <p className="mb-2 text-xs text-slate-500">Indeks awal (basis 0) tiap kemunculan{result.matches.length > 500 ? ' — 500 pertama' : ''}:</p>
                <div className="flex max-h-40 flex-wrap gap-2 overflow-auto">
                  {result.matches.slice(0, 500).map((i) => <span key={i} className="rounded bg-sand px-2 py-1 font-mono text-xs text-navy">{i}</span>)}
                </div>
              </>)}
          </Panel>

          {dfa ? (<>
            <Panel title="Diagram DFA"><DfaDiagram dfa={dfa} /></Panel>
            <Panel title="5-Tuple M = (Q, Σ, δ, q₀, F)"><FiveTuple dfa={dfa} /></Panel>
            <Panel title="Tabel transisi δ"><TransitionTable dfa={dfa} /></Panel>
          </>) : (
            <Panel><p className="text-sm text-slate-500">Masukkan pattern untuk menampilkan diagram, 5-tuple, dan tabel transisi.</p></Panel>
          )}
        </div>
      </main>
    </div>
  )
}
