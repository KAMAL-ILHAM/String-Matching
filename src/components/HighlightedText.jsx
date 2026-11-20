const MAX_CHARS = 200000
const MAX_MARKS = 5000

export default function HighlightedText({ text, matches, m }) {
  const shown = text.slice(0, MAX_CHARS)
  // Gabungkan interval overlapping agar highlight tidak bertumpuk.
  const iv = []
  for (const s of matches.slice(0, MAX_MARKS)) {
    if (s >= shown.length) break
    const e = Math.min(s + m, shown.length)
    if (iv.length && s <= iv[iv.length - 1][1]) iv[iv.length - 1][1] = Math.max(iv[iv.length - 1][1], e)
    else iv.push([s, e])
  }
  const parts = []
  let pos = 0
  iv.forEach(([s, e], i) => {
    if (s > pos) parts.push(shown.slice(pos, s))
    parts.push(<mark key={i}>{shown.slice(s, e)}</mark>)
    pos = e
  })
  parts.push(shown.slice(pos))
  return (
    <div>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-mist bg-cream p-3 font-mono text-sm text-slate-700">{parts}</pre>
      {(text.length > MAX_CHARS || matches.length > MAX_MARKS) && (
        <p className="mt-2 text-xs text-amber-700">
          Pratinjau dibatasi ({MAX_CHARS.toLocaleString()} karakter pertama, {MAX_MARKS.toLocaleString()} highlight). Pencarian tetap memindai seluruh teks.
        </p>
      )}
    </div>
  )
}
