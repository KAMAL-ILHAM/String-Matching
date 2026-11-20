import { disp } from '../lib/dfa'

export default function FiveTuple({ dfa }) {
  const { m, alphabet } = dfa
  const Q = m <= 8 ? Array.from({ length: m + 1 }, (_, i) => 'q' + i).join(', ') : `q0, q1, q2, …, q${m}`
  const rows = [
    ['Q', `{ ${Q} }`, `${m + 1} state (m+1, m = ${m})`],
    ['Σ', `{ ${alphabet.map(disp).join(', ')} }`, 'Karakter pattern; karakter lain dipetakan ke q0'],
    ['δ', 'Q × Σ → Q', 'δ(q, a) = panjang prefix pattern terpanjang yang menjadi suffix dari (prefix q)·a — lihat tabel'],
    ['q₀', '{ q0 }', 'Initial state'],
    ['F', `{ q${m} }`, 'Accepting state (pattern ditemukan)'],
  ]
  return (
    <dl className="space-y-2">
      {rows.map(([k, v, d]) => (
        <div key={k} className="rounded-lg bg-cream p-3">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <dt className="font-mono text-lg text-brand">{k}</dt>
            <dd className="min-w-0 break-words font-mono text-sm text-navy">{v}</dd>
          </div>
          <p className="mt-1 text-xs text-slate-500">{d}</p>
        </div>
      ))}
    </dl>
  )
}
