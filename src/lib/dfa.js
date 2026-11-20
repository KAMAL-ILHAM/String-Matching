// Logika DFA murni (tanpa React). M = (Q, Σ, δ, q0, F)

// Normalisasi huruf kecil per code unit agar panjang string & indeks tetap sama.
const norm = (s, caseSensitive) => {
  if (caseSensitive) return s
  let o = ''
  for (let i = 0; i < s.length; i++) {
    const l = s[i].toLowerCase()
    o += l.length === 1 ? l : s[i]
  }
  return o
}

// Bangun tabel transisi δ: (m+1) state x |Σ| simbol. Karakter di luar Σ -> q0.
// Konstruksi O(m·|Σ|): state j menyalin transisi state "x" (state setara
// setelah prefix dikurangi satu karakter), lalu δ(j, p[j]) = j+1.
export function buildDFA(pattern, caseSensitive = true) {
  const p = norm(pattern, caseSensitive)
  const m = p.length
  const alphabet = Array.from(new Set(p.split('')))
  const col = new Map(alphabet.map((c, i) => [c, i]))
  const delta = Array.from({ length: m + 1 }, () => new Int32Array(alphabet.length))
  if (m > 0) {
    delta[0][col.get(p[0])] = 1
    let x = 0
    for (let j = 1; j <= m; j++) {
      delta[j].set(delta[x])
      if (j < m) {
        delta[j][col.get(p[j])] = j + 1
        x = delta[x][col.get(p[j])]
      }
    }
  }
  return { pattern: p, m, alphabet, col, delta, caseSensitive, states: m + 1, initial: 0, accepting: m }
}

// Satu kali pemindaian teks, tanpa backtracking: O(n). Mengembalikan indeks awal tiap kemunculan
// (termasuk yang overlapping).
export function searchDFA(dfa, text) {
  const { m, col, delta } = dfa
  const t = norm(text, dfa.caseSensitive)
  const out = []
  let q = 0
  for (let i = 0; i < t.length; i++) {
    const c = col.get(t[i])
    q = c === undefined ? 0 : delta[q][c]
    if (q === m) out.push(i - m + 1)
  }
  return out
}

export const disp = (c) => (c === ' ' ? '␣' : c === '\n' ? '\\n' : c === '\t' ? '\\t' : c)
