import { disp } from '../lib/dfa'

export default function TransitionTable({ dfa }) {
  const { m, alphabet, delta } = dfa
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-mist">
      <table className="min-w-full text-center font-mono text-sm">
        <thead className="bg-mist text-navy">
          <tr>
            <th className="sticky left-0 bg-mist px-3 py-2 text-left">δ</th>
            {alphabet.map((c) => <th key={c} className="px-3 py-2">{disp(c)}</th>)}
            <th className="px-3 py-2 italic">lain</th>
          </tr>
        </thead>
        <tbody>
          {delta.map((row, q) => (
            <tr key={q} className="border-t border-mist">
              <th className={`sticky left-0 whitespace-nowrap bg-white px-3 py-2 text-left ${q === m ? 'text-emerald-700' : 'text-slate-800'}`}>
                {q === 0 ? '→ ' : ''}{q === m ? '* ' : ''}q{q}
              </th>
              {Array.from(row, (t, k) => <td key={k} className={`px-3 py-2 ${t === m ? 'text-emerald-700' : 'text-slate-700'}`}>q{t}</td>)}
              <td className="px-3 py-2 text-slate-500">q0</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
