import test from 'node:test'
import assert from 'node:assert/strict'
import { compareInputs, decodeJwt, runRegex } from './toolUtils.js'
import { formatCode } from './formatCode.js'

const segment = (value) => btoa(unescape(encodeURIComponent(JSON.stringify(value)))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
const token = (payload) => `${segment({ alg: 'HS256' })}.${segment(payload)}.YWJj`

test('JWT decodes Unicode claims and checks NumericDate boundaries without verifying signatures', () => {
  const value = decodeJwt(token({ name: 'नमस्ते', exp: 10, nbf: 5 }), 10000)
  assert.equal(value.payload.name, 'नमस्ते')
  assert.equal(value.expired, true)
  assert.equal(value.dates.exp, '1970-01-01T00:00:10.000Z')
  assert.equal(decodeJwt(token({ nbf: 20 }), 10000).notYetActive, true)
  assert.equal(decodeJwt(token({})).expired, null)
  assert.throws(() => decodeJwt(token({ exp: '10' })), /numeric timestamp/)
  assert.throws(() => decodeJwt('abc.def'), /three/)
  assert.throws(() => decodeJwt(`${segment({ alg: 'none' })}.bad!.`), /encoding/)
})

test('Regex collects named and optional captures, obeys flags, and advances Unicode empty matches', () => {
  const matches = runRegex('(?<word>a)(b)?', 'gi', 'A ab').matches
  assert.deepEqual(matches.map((match) => match.groups), [['A', null], ['a', 'b']])
  assert.equal(matches[1].namedGroups.word, 'a')
  assert.equal(runRegex('a', '', 'aaa').matches.length, 1)
  assert.deepEqual(runRegex('(?:)', 'gu', '😀').matches.map((match) => match.start), [0, 2])
  assert.throws(() => runRegex('[', 'g', ''), SyntaxError)
  assert.throws(() => runRegex('a', 'gg', ''), /supported flag/)
  assert.equal(runRegex('a', 'g', 'a'.repeat(1001)).truncated, true)
})

test('Diff retains line numbers and handles replacements, empty inputs, and repeated lines', () => {
  const diff = compareInputs('a\nb\na', 'a\nc\na')
  assert.equal(diff.added, 1)
  assert.equal(diff.removed, 1)
  assert.deepEqual(diff.lines.map((line) => line.type), ['same', 'removed', 'added', 'same'])
  assert.equal(diff.lines[2].newLine, 2)
  assert.equal(compareInputs('', '').lines.length, 0)
  assert.equal(compareInputs('', 'new').added, 1)
  assert.equal(compareInputs('a\r\nb', 'a\nb').removed, 0)
  assert.throws(() => compareInputs('a\n'.repeat(801), ''), /800 lines/)
  assert.throws(() => compareInputs('a'.repeat(100001), ''), /100,000/)
})

test('JSON diff ignores nested object order but preserves array order and catches invalid JSON', () => {
  assert.equal(compareInputs('{"b":{"y":2,"x":1},"a":0}', '{"a":0,"b":{"x":1,"y":2}}', 'json').added, 0)
  assert.ok(compareInputs('[1,2]', '[2,1]', 'json').added > 0)
  assert.equal(compareInputs('{"__proto__":1}', '{"__proto__":2}', 'json').added, 1)
  assert.throws(() => compareInputs('{', '{}', 'json'), /Original input/)
  assert.throws(() => compareInputs('{}', '{', 'json'), /Updated input/)
})

test('Code formatter parses JavaScript, CSS, and embedded HTML without altering literal values', async () => {
  const js = await formatCode('const value="a{b}; // literal";const pattern=/a{2,3}/;', 'js')
  assert.match(js, /"a\{b\}; \/\/ literal"/)
  assert.match(js, /\/a\{2,3\}\//)
  const css = await formatCode('.x{content:"a;b";color:red}', 'css')
  assert.match(css, /content: "a;b";/)
  assert.match(css, /color: red;/)
  const html = await formatCode('<div><span>hello</span></div><script>const x={a:1};</script>', 'html')
  assert.match(html, /const x = \{ a: 1 \};/)
  await assert.rejects(formatCode('const = ;', 'js'))
  await assert.rejects(formatCode('', 'css'), /Enter code/)
})
