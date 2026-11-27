// Regresi M6 ("destroy is not a function"): efek React tidak boleh mengembalikan nilai selain fungsi.
// Bentuk ringkas `useEffect(() => ekspresi)` atau efek async mengembalikan nilai/Promise → dilarang.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const files = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? files(p) : /\.(jsx?|tsx?)$/.test(f) && !/\.test\./.test(f) ? [p] : []
  })

const BAD = /use(Layout)?Effect\(\s*(async\b|\([^)]*\)\s*=>\s*[^{\s])/g

describe('useEffect', () => {
  it('badan efek selalu berupa blok { } dan tidak async', () => {
    const offenders = files(join(import.meta.dirname))
      .map((p) => [p, readFileSync(p, 'utf8').match(BAD)])
      .filter(([, m]) => m)
      .map(([p, m]) => `${p}: ${m.join(' | ')}`)
    expect(offenders).toEqual([])
  })
})
