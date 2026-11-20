import { disp } from '../lib/dfa'

const MAX_STATES = 16
const GAP = 90, R = 24, X0 = 70, Y = 90

export default function DfaDiagram({ dfa }) {
  const { m, alphabet, delta } = dfa
  if (m + 1 > MAX_STATES)
    return <p className="text-sm text-slate-600">Diagram hanya ditampilkan untuk pattern ≤ {MAX_STATES - 1} karakter. Gunakan tabel transisi di bawah.</p>

  // Kelompokkan simbol per sisi (from -> to). Transisi menuju q0 disembunyikan agar diagram terbaca.
  const edges = new Map()
  for (let q = 0; q <= m; q++)
    alphabet.forEach((c, k) => {
      const to = delta[q][k]
      if (to === 0) return
      const key = q + '>' + to
      edges.set(key, [...(edges.get(key) || []), disp(c)])
    })

  const x = (q) => X0 + q * GAP
  const maxBack = Math.max(1, ...[...edges.keys()].map((k) => { const [f, t] = k.split('>').map(Number); return f - t }))
  const W = X0 * 2 + m * GAP
  const H = Y + R + 16 * maxBack + 50
  const label = (a) => { const s = a.join(','); return s.length > 7 ? s.slice(0, 6) + '…' : s }

  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="text-navy" role="img" aria-label="Diagram DFA">
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="currentColor" />
          </marker>
        </defs>
        <line x1={x(0) - 50} y1={Y} x2={x(0) - R - 1} y2={Y} stroke="currentColor" strokeWidth="2" markerEnd="url(#ah)" />
        <text x={x(0) - 50} y={Y - 8} fontSize="10" fill="currentColor">start</text>
        {[...edges].map(([key, a]) => {
          const [f, t] = key.split('>').map(Number)
          const title = <title>{a.join(', ')}</title>
          if (t === f + 1)
            return <g key={key}>{title}<line x1={x(f) + R} y1={Y} x2={x(t) - R - 1} y2={Y} stroke="#178fd6" strokeWidth="2" markerEnd="url(#ah)" />
              <text x={(x(f) + x(t)) / 2} y={Y - 8} textAnchor="middle" fontSize="13" fill="#178fd6" className="font-mono">{label(a)}</text></g>
          if (t === f)
            return <g key={key}>{title}<path d={`M${x(f) - 10} ${Y - R} C${x(f) - 35} ${Y - R - 45} ${x(f) + 35} ${Y - R - 45} ${x(f) + 10} ${Y - R - 1}`} fill="none" stroke="#034488" strokeWidth="1.5" markerEnd="url(#ah)" />
              <text x={x(f)} y={Y - R - 38} textAnchor="middle" fontSize="12" fill="#034488" className="font-mono">{label(a)}</text></g>
          const d = f - t, h = 30 * d + 20, mx = (x(f) + x(t)) / 2
          return <g key={key}>{title}<path d={`M${x(f)} ${Y + R} Q${mx} ${Y + R + h} ${x(t)} ${Y + R + 1}`} fill="none" stroke="#64748b" strokeWidth="1.3" markerEnd="url(#ah)" />
            <text x={mx} y={Y + R + h / 2 + 14} textAnchor="middle" fontSize="11" fill="#475569" className="font-mono">{label(a)}</text></g>
        })}
        {Array.from({ length: m + 1 }, (_, q) => (
          <g key={q}>
            <circle cx={x(q)} cy={Y} r={R} fill="#ffffff" stroke={q === m ? '#047857' : '#034488'} strokeWidth="2" />
            {q === m && <circle cx={x(q)} cy={Y} r={R - 5} fill="none" stroke="#047857" strokeWidth="2" />}
            <text x={x(q)} y={Y + 5} textAnchor="middle" fontSize="14" fill="#034488" className="font-mono">q{q}</text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-xs text-slate-500">Transisi menuju q0 (karakter lain / tidak cocok) tidak digambar; lihat tabel δ.</p>
    </div>
  )
}
