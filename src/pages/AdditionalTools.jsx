import { useEffect, useRef, useState } from 'react'
import { SurfaceCard } from '../components/SurfaceCard'
import { compareInputs, decodeJwt } from '../tools/toolUtils'
import { formatCode } from '../tools/formatCode'

function Message({ children, error = false }) {
  return children ? <p className={`status-message${error ? ' status-message--error' : ''}`} role="status">{children}</p> : null
}

function CopyButton({ value, label = 'Copy' }) {
  const [copied, setCopied] = useState(null)
  return <button type="button" className="tool-action tool-action--compact" disabled={!value} onClick={async () => {
    try { await navigator.clipboard.writeText(value); setCopied({ value, ok: true }) }
    catch { setCopied({ value, ok: false }) }
  }}>{copied?.value === value ? (copied.ok ? 'Copied' : 'Copy failed') : label}</button>
}

export function WebFormatter() {
  const [language, setLanguage] = useState('html')
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const resetResult = () => { setResult(''); setError('') }
  return <div className="tool-grid">
    <SurfaceCard title="Source code">
      <label className="form-field__label" htmlFor="format-language">Language</label>
      <select id="format-language" className="tool-select" value={language} disabled={loading} onChange={(event) => { setLanguage(event.target.value); resetResult() }}>
        <option value="html">HTML</option><option value="css">CSS</option><option value="js">JavaScript</option>
      </select>
      <label className="form-field__label additional-tools__label" htmlFor="format-input">Code</label>
      <textarea id="format-input" className="tool-textarea code-input" value={input} spellCheck={false} disabled={loading}
        placeholder="Paste code to format..." onChange={(event) => { setInput(event.target.value); resetResult() }} />
      <div className="action-row">
        <button type="button" className="tool-action tool-action--primary" disabled={loading} onClick={async () => {
          setLoading(true); resetResult()
          try { setResult(await formatCode(input, language)) } catch (failure) { setError(failure.message) }
          finally { setLoading(false) }
        }}>{loading ? 'Formatting...' : 'Format code'}</button>
        <button type="button" className="tool-action tool-action--compact" disabled={loading} onClick={() => { setInput(''); resetResult() }}>Clear</button>
      </div>
      <Message error>{error}</Message>
      <p className="processing-note additional-tools__note">Formatted locally with Prettier. Your code is not uploaded or executed.</p>
    </SurfaceCard>
    <SurfaceCard title="Formatted code" actions={<CopyButton value={result} />}>
      <pre className="output-panel output-panel--code">{result || 'Formatted code will appear here.'}</pre>
    </SurfaceCard>
  </div>
}

export function JwtDecoder() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const clearResult = () => { setResult(null); setError('') }
  return <div className="tool-grid">
    <SurfaceCard title="Token">
      <label className="form-field__label" htmlFor="jwt-input">JWT</label>
      <textarea id="jwt-input" className="tool-textarea code-input" value={input} spellCheck={false} placeholder="Paste a JWT..."
        onChange={(event) => { setInput(event.target.value); clearResult() }} />
      <div className="action-row">
        <button type="button" className="tool-action tool-action--primary" onClick={() => {
          clearResult()
          try { setResult(decodeJwt(input)) } catch (failure) { setError(failure.message) }
        }}>Decode token</button>
        <button type="button" className="tool-action tool-action--compact" onClick={() => { setInput(''); clearResult() }}>Clear</button>
      </div>
      <Message error>{error}</Message>
      <p className="processing-note additional-tools__note">Decoded in your browser. The signature is not verified.</p>
    </SurfaceCard>
    <SurfaceCard title="Decoded token" actions={<CopyButton value={result ? JSON.stringify({ header: result.header, payload: result.payload }, null, 2) : ''} />}>
      {result ? <div className="jwt-result">
        <p className="jwt-result__status" role="status">{result.expired ? 'Expiry claim has passed' : result.notYetActive ? 'Not active yet according to nbf' : result.expired === false ? 'Expiry claim is in the future' : 'No expiry claim'} · Signature unverified</p>
        {Object.keys(result.dates).length > 0 && <dl className="jwt-dates">{Object.entries(result.dates).map(([claim, value]) => <div key={claim}><dt>{{ exp: 'Expires (UTC)', iat: 'Issued (UTC)', nbf: 'Not before (UTC)' }[claim]}</dt><dd>{value}</dd></div>)}</dl>}
        <h3>Header</h3><pre className="decoded-json">{JSON.stringify(result.header, null, 2)}</pre>
        <h3>Payload</h3><pre className="decoded-json">{JSON.stringify(result.payload, null, 2)}</pre>
      </div> : <div className="output-empty">Decode a token to inspect its header and payload.</div>}
    </SurfaceCard>
  </div>
}

const FLAGS = [{ flag: 'g', label: 'All matches' }, { flag: 'i', label: 'Ignore case' }, { flag: 'm', label: 'Multiline' }, { flag: 's', label: 'Dot matches newline' }, { flag: 'u', label: 'Unicode' }]

function HighlightedMatches({ input, matches }) {
  const parts = []
  let cursor = 0
  for (let index = 0; index < matches.length; index++) {
    const match = matches[index]
    if (match.end === match.start) continue
    parts.push(input.slice(cursor, match.start))
    parts.push(<mark key={index}>{input.slice(match.start, match.end)}</mark>)
    cursor = match.end
  }
  parts.push(input.slice(cursor))
  return <pre className="regex-highlight">{parts}</pre>
}

export function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const job = useRef(null)
  useEffect(() => () => { if (job.current) { clearTimeout(job.current.timer); job.current.worker.terminate() } }, [])
  const clearResult = () => { setResult(null); setError('') }
  const run = () => {
    clearResult(); setRunning(true)
    let worker
    try { worker = new Worker(new URL('../tools/regex.worker.js', import.meta.url), { type: 'module' }) }
    catch { setRunning(false); setError('This browser could not start the regex worker.'); return }
    const finish = () => { clearTimeout(job.current?.timer); worker.terminate(); job.current = null; setRunning(false) }
    const timer = setTimeout(() => { finish(); setError('The pattern took too long. Simplify it or shorten the test text.') }, 1500)
    job.current = { worker, timer }
    worker.onmessage = (event) => {
      finish()
      if (event.data.error) setError(event.data.error)
      else setResult({ ...event.data.result, input })
    }
    worker.onerror = () => { finish(); setError('Unable to evaluate this expression.') }
    worker.postMessage({ pattern, flags, input })
  }
  return <div className="tool-grid">
    <SurfaceCard title="Expression and text">
      <label className="form-field__label" htmlFor="regex-pattern">Pattern (without / delimiters)</label>
      <input id="regex-pattern" className="tool-input code-input" value={pattern} disabled={running} spellCheck={false} placeholder="Enter a regular expression..."
        onChange={(event) => { setPattern(event.target.value); clearResult() }} />
      <fieldset className="regex-flags" disabled={running}><legend>Flags</legend>{FLAGS.map(({ flag, label }) =>
        <label key={flag} title={label}><input type="checkbox" checked={flags.includes(flag)} aria-label={`${label} (${flag})`} onChange={(event) => {
          setFlags(event.target.checked ? flags + flag : flags.replace(flag, '')); clearResult()
        }} /><code>{flag}</code><span>{label}</span></label>)}</fieldset>
      <label className="form-field__label" htmlFor="regex-input">Test text</label>
      <textarea id="regex-input" className="tool-textarea code-input" value={input} disabled={running} spellCheck={false} placeholder="Enter text to test..."
        onChange={(event) => { setInput(event.target.value); clearResult() }} />
      <div className="action-row"><button type="button" className="tool-action tool-action--primary" disabled={running} onClick={run}>{running ? 'Testing...' : 'Test expression'}</button>
        <button type="button" className="tool-action tool-action--compact" disabled={running} onClick={() => { setInput(''); setPattern(''); setFlags('g'); clearResult() }}>Clear</button></div>
      <Message error>{error}</Message>
      <p className="processing-note additional-tools__note">JavaScript regex syntax. Runs locally with a 1.5-second limit.</p>
    </SurfaceCard>
    <SurfaceCard title="Matches" actions={<CopyButton value={result?.matches.length ? JSON.stringify(result.matches, null, 2) : ''} label="Copy matches" />}>
      {result ? <div>
        <p className="regex-summary" role="status">{result.matches.length} match{result.matches.length === 1 ? '' : 'es'}{result.truncated ? ' (limit reached)' : ''}</p>
        {result.input ? <HighlightedMatches input={result.input} matches={result.matches} /> : <p className="processing-note">Test text is empty.</p>}
        <ol className="regex-match-list">{result.matches.slice(0, 100).map((match, index) => <li key={index}>
          <div><strong>Match {index + 1}</strong><span>Index {match.start}–{match.end}</span></div>
          <code>{match.value || '(empty match)'}</code>
          {match.groups.length > 0 && <pre>Groups: {JSON.stringify(match.groups)}</pre>}
          {match.namedGroups && <pre>Named groups: {JSON.stringify(match.namedGroups)}</pre>}
        </li>)}</ol>
        {result.matches.length > 100 && <p className="processing-note">Showing the first 100 matches. Copy matches to get all results.</p>}
      </div> : <div className="output-empty">Test an expression to see matches and capture groups.</div>}
    </SurfaceCard>
  </div>
}

export function DiffChecker() {
  const [mode, setMode] = useState('text')
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const clearResult = () => { setResult(null); setError('') }
  const patch = result?.lines.map((line) => `${{ added: '+', removed: '-', same: ' ' }[line.type]} ${line.value}`).join('\n') || ''
  return <div className="diff-tool">
    <div className="diff-toolbar"><label htmlFor="diff-mode">Compare</label><select id="diff-mode" className="tool-select" value={mode} onChange={(event) => { setMode(event.target.value); clearResult() }}><option value="text">Text</option><option value="json">JSON</option></select>
      <span>{mode === 'json' ? 'Object key order and formatting are ignored; array order is preserved.' : 'Compare lines of text.'}</span></div>
    <div className="tool-grid">
      <SurfaceCard title="Original"><label className="sr-only" htmlFor="diff-original">Original input</label><textarea id="diff-original" className="tool-textarea code-input" value={left} spellCheck={false} placeholder={`Paste original ${mode}...`} onChange={(event) => { setLeft(event.target.value); clearResult() }} /></SurfaceCard>
      <SurfaceCard title="Updated"><label className="sr-only" htmlFor="diff-updated">Updated input</label><textarea id="diff-updated" className="tool-textarea code-input" value={right} spellCheck={false} placeholder={`Paste updated ${mode}...`} onChange={(event) => { setRight(event.target.value); clearResult() }} /></SurfaceCard>
    </div>
    <div className="action-row diff-actions"><button type="button" className="tool-action tool-action--primary" onClick={() => {
      clearResult()
      try { setResult(compareInputs(left, right, mode)) } catch (failure) { setError(failure.message) }
    }}>Compare inputs</button><button type="button" className="tool-action tool-action--compact" onClick={() => { setLeft(right); setRight(left); clearResult() }}>Swap</button>
      <button type="button" className="tool-action tool-action--compact" onClick={() => { setLeft(''); setRight(''); clearResult() }}>Clear</button></div>
    <Message error>{error}</Message>
    <SurfaceCard title="Differences" actions={<CopyButton value={patch} label="Copy diff" />} className="diff-result">
      {result ? <>
        <p className="diff-summary" role="status">{result.added === 0 && result.removed === 0 ? 'No differences found.' : `${result.added} added · ${result.removed} removed`}</p>
        <div className="diff-lines" role="region" aria-label="Line differences" tabIndex={0}>{result.lines.map((line, index) =>
          <div key={index} className={`diff-line diff-line--${line.type}`}>
            <span className="diff-line__number">{line.oldLine ?? ''}</span><span className="diff-line__number">{line.newLine ?? ''}</span>
            <span className="diff-line__sign" aria-label={line.type === 'same' ? 'Unchanged' : line.type}>{{ added: '+', removed: '−', same: ' ' }[line.type]}</span><code>{line.value || ' '}</code>
          </div>)}</div>
      </> : <div className="output-empty">Compare inputs to see added and removed lines.</div>}
    </SurfaceCard>
    <p className="processing-note additional-tools__note">Compared locally. Up to 800 lines and 100,000 characters per input.</p>
  </div>
}
