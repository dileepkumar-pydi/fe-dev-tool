import { useState } from 'react'
import { SurfaceCard } from '../components/SurfaceCard'
import { ToolHeader } from '../components/ToolHeader'
import {
  base64DecodeText,
  base64EncodeText,
  convertColorFromHex,
  convertDateToTimestamp,
  convertNumberBase,
  convertTimestampToDate,
  escapeValue,
  fetchTextStats,
  formatJson,
  generateHash,
  generateUuid,
  inspectFile,
  minifyJson,
  transformTextCase,
  validateJson,
  validateUuid,
} from '../services/devToolApi'

const HASH_ALGORITHMS = ['SHA-256', 'SHA-512', 'SHA-1', 'MD5']
const TEXT_TRANSFORMS = ['upper', 'lower', 'title', 'sentence', 'reverse']
const ESCAPE_TYPES = ['url', 'html', 'javascript']
const BASE_OPTIONS = [
  { label: 'Binary (Base 2)', value: 2 },
  { label: 'Octal (Base 8)', value: 8 },
  { label: 'Decimal (Base 10)', value: 10 },
  { label: 'Hexadecimal (Base 16)', value: 16 },
]

export function ToolPage({ page }) {
  return (
    <div className="tool-page">
      <ToolHeader
        category={page.category}
        title={page.title}
        badge={page.badge}
        description={page.description}
      />

      {page.id === 'base64' ? <Base64Tool page={page} /> : null}
      {page.id === 'json' ? <JsonTool page={page} /> : null}
      {page.id === 'hash' ? <HashTool page={page} /> : null}
      {page.id === 'text' ? <TextTool page={page} /> : null}
      {page.id === 'timestamp' ? <TimestampTool page={page} /> : null}
      {page.id === 'number' ? <NumberTool page={page} /> : null}
      {page.id === 'escape' ? <EscapeTool page={page} /> : null}
      {page.id === 'uuid' ? <UuidTool /> : null}
      {page.id === 'color' ? <ColorTool page={page} /> : null}
      {page.id === 'file' ? <FileTool page={page} /> : null}

      {page.exampleSection ? <ExampleSection section={page.exampleSection} /> : null}
    </div>
  )
}

function Base64Tool({ page }) {
  const [mode, setMode] = useState('encode')
  const [input, setInput] = useState('')
  const [result, setResult] = useState(page.outputPlaceholder)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim()) {
      setMessage('Enter a value to continue.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = mode === 'encode' ? await base64EncodeText(input) : await base64DecodeText(input)
      setResult(response.data.result)
      setMessage(response.status.description)
    } catch (error) {
      setResult(page.outputPlaceholder)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwap = () => {
    setInput(result === page.outputPlaceholder ? '' : result)
    setResult(input || page.outputPlaceholder)
    setMessage('')
    setMode((current) => (current === 'encode' ? 'decode' : 'encode'))
  }

  return (
    <div className="tool-grid">
      <SurfaceCard title={page.inputTitle}>
        <SegmentedControl
          options={['encode', 'decode']}
          selected={mode}
          onSelect={(value) => {
            setMode(value)
            setMessage('')
          }}
          formatLabel={capitalize}
        />

        <textarea
          className="tool-textarea"
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />

        <div className="action-row">
          <button type="button" className="tool-action tool-action--primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Working...' : capitalize(mode)}
          </button>
          <button
            type="button"
            className="tool-icon-button"
            aria-label="Reset"
            onClick={() => {
              setInput('')
              setResult(page.outputPlaceholder)
              setMessage('')
            }}
          >
            ↻
          </button>
        </div>

        <StatusMessage message={message} />
      </SurfaceCard>

      <SurfaceCard
        title={page.outputTitle}
        actions={
          <>
            <button type="button" className="tool-header-icon" onClick={handleSwap} aria-label="Swap input and output">
              ⇵
            </button>
            <button
              type="button"
              className="tool-header-icon"
              aria-label="Copy output"
              onClick={() => copyText(result, setMessage, page.outputPlaceholder)}
            >
              ⧉
            </button>
          </>
        }
      >
        <pre className="output-panel output-panel--code">{result}</pre>
      </SurfaceCard>
    </div>
  )
}

function JsonTool({ page }) {
  const [input, setInput] = useState('{"key": "value"}')
  const [result, setResult] = useState(page.outputPlaceholder)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const runAction = async (action) => {
    if (!input.trim()) {
      setMessage('Enter JSON before running an action.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      if (action === 'validate') {
        const response = await validateJson(input)
        setResult(JSON.stringify(response.data, null, 2))
        setMessage(response.data.valid ? 'JSON is valid.' : response.data.message)
      } else {
        const api = action === 'format' ? formatJson : minifyJson
        const response = await api(input)
        setResult(response.data.result)
        setMessage(response.status.description)
      }
    } catch (error) {
      setResult(page.outputPlaceholder)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="tool-grid">
      <SurfaceCard title={page.inputTitle}>
        <textarea className="tool-textarea" value={input} onChange={(event) => setInput(event.target.value)} />

        <div className="action-row action-row--triple">
          <button type="button" className="tool-action tool-action--primary" onClick={() => runAction('format')} disabled={isLoading}>
            {isLoading ? 'Working...' : 'Format'}
          </button>
          <button type="button" className="tool-action" onClick={() => runAction('minify')} disabled={isLoading}>
            Minify
          </button>
          <button type="button" className="tool-action" onClick={() => runAction('validate')} disabled={isLoading}>
            Validate
          </button>
          <button
            type="button"
            className="tool-icon-button"
            aria-label="Reset"
            onClick={() => {
              setInput('{"key": "value"}')
              setResult(page.outputPlaceholder)
              setMessage('')
            }}
          >
            ↻
          </button>
        </div>

        <StatusMessage message={message} />
      </SurfaceCard>

      <SurfaceCard
        title={page.outputTitle}
        actions={
          <button
            type="button"
            className="tool-header-icon"
            aria-label="Copy output"
            onClick={() => copyText(result, setMessage, page.outputPlaceholder)}
          >
            ⧉
          </button>
        }
      >
        <pre className="output-panel output-panel--code">{result}</pre>
      </SurfaceCard>
    </div>
  )
}

function HashTool({ page }) {
  const [algorithm, setAlgorithm] = useState('SHA-256')
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim()) {
      setMessage('Enter text to hash.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await generateHash(input, algorithm)
      setResult(`${response.data.algorithm}\n${response.data.result}`)
      setMessage(response.status.description)
    } catch (error) {
      setResult('')
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="tool-grid">
      <SurfaceCard title={page.inputTitle}>
        <div className="form-fields">
          <div className="form-field">
            <label className="form-field__label" htmlFor="hash-algorithm">
              Algorithm
            </label>
            <select
              id="hash-algorithm"
              className="tool-select"
              value={algorithm}
              onChange={(event) => setAlgorithm(event.target.value)}
            >
              {HASH_ALGORITHMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="hash-input">
              Text to Hash
            </label>
            <textarea
              id="hash-input"
              className="tool-textarea"
              placeholder="Enter text to hash..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </div>
        </div>

        <div className="action-row">
          <button type="button" className="tool-action tool-action--primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Hash'}
          </button>
          <button
            type="button"
            className="tool-icon-button"
            aria-label="Reset"
            onClick={() => {
              setInput('')
              setAlgorithm('SHA-256')
              setResult('')
              setMessage('')
            }}
          >
            ↻
          </button>
        </div>

        <StatusMessage message={message} />
      </SurfaceCard>

      <SurfaceCard title={page.outputTitle}>
        <pre className="output-panel output-panel--code">{result || 'Generate a hash to see results'}</pre>
      </SurfaceCard>
    </div>
  )
}

function TextTool({ page }) {
  const [input, setInput] = useState('')
  const [transform, setTransform] = useState('upper')
  const [result, setResult] = useState(page.outputPlaceholder)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTransform = async () => {
    if (!input.trim()) {
      setMessage('Enter text to transform.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const [caseResponse, statsResponse] = await Promise.all([
        transformTextCase(input, transform),
        fetchTextStats(input),
      ])
      setResult(caseResponse.data.result)
      setStats(statsResponse.data)
      setMessage(caseResponse.status.description)
    } catch (error) {
      setResult(page.outputPlaceholder)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="tool-grid">
      <SurfaceCard title="Input Text">
        <textarea
          className="tool-textarea"
          placeholder="Enter text to transform..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />

        <div className="tool-control-group">
          <label className="form-field__label">Transformation</label>
          <SegmentedControl
            options={TEXT_TRANSFORMS}
            selected={transform}
            onSelect={setTransform}
            formatLabel={(value) => (value === 'upper' ? 'UPPER' : capitalize(value))}
            columns={5}
          />
        </div>

        <div className="action-row">
          <button type="button" className="tool-action tool-action--primary" onClick={handleTransform} disabled={isLoading}>
            {isLoading ? 'Transforming...' : 'Transform'}
          </button>
          <button
            type="button"
            className="tool-icon-button"
            aria-label="Reset"
            onClick={() => {
              setInput('')
              setTransform('upper')
              setResult(page.outputPlaceholder)
              setStats(null)
              setMessage('')
            }}
          >
            ↻
          </button>
        </div>

        {stats ? (
          <div className="stat-pill-row">
            <StatPill label="Chars" value={stats.characters} />
            <StatPill label="Words" value={stats.words} />
            <StatPill label="Lines" value={stats.lines} />
          </div>
        ) : null}

        <StatusMessage message={message} />
      </SurfaceCard>

      <SurfaceCard
        title="Output"
        actions={
          <button
            type="button"
            className="tool-header-icon"
            aria-label="Copy output"
            onClick={() => copyText(result, setMessage, page.outputPlaceholder)}
          >
            ⧉
          </button>
        }
      >
        <pre className="output-panel output-panel--code">{result}</pre>
      </SurfaceCard>
    </div>
  )
}

function TimestampTool({ page }) {
  const [timestampInput, setTimestampInput] = useState('1234567890')
  const [dateTimeInput, setDateTimeInput] = useState(currentLocalDateTime())
  const [timestampResult, setTimestampResult] = useState('')
  const [dateTimeResult, setDateTimeResult] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleToDate = async () => {
    if (!timestampInput.trim()) {
      setMessage('Enter a Unix timestamp.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await convertTimestampToDate(timestampInput, 'UTC')
      setTimestampResult(response.data.result)
      setMessage(response.status.description)
    } catch (error) {
      setTimestampResult('')
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToTimestamp = async () => {
    if (!dateTimeInput.trim()) {
      setMessage('Choose a date and time.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await convertDateToTimestamp(dateTimeInput, 'UTC')
      setDateTimeResult(response.data.result)
      setMessage(response.status.description)
    } catch (error) {
      setDateTimeResult('')
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="tool-grid">
        <SurfaceCard title={page.cards[0].title}>
          <div className="form-fields">
            <div className="form-field">
              <label className="form-field__label" htmlFor="timestamp-input">
                Unix Timestamp
              </label>
              <input
                id="timestamp-input"
                className="tool-input"
                value={timestampInput}
                onChange={(event) => setTimestampInput(event.target.value)}
              />
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="tool-action tool-action--primary" onClick={handleToDate} disabled={isLoading}>
              {isLoading ? 'Converting...' : 'Convert'}
            </button>
            <button type="button" className="tool-icon-button tool-icon-button--wide" onClick={() => setTimestampInput(currentUnixTimestamp())}>
              Now
            </button>
          </div>

          <StatusMessage message={timestampResult} tone="success" />
        </SurfaceCard>

        <SurfaceCard title={page.cards[1].title}>
          <div className="form-fields">
            <div className="form-field">
              <label className="form-field__label" htmlFor="datetime-input">
                Date &amp; Time
              </label>
              <input
                id="datetime-input"
                type="datetime-local"
                className="tool-input"
                value={dateTimeInput}
                onChange={(event) => setDateTimeInput(event.target.value)}
              />
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="tool-action tool-action--primary" onClick={handleToTimestamp} disabled={isLoading}>
              {isLoading ? 'Converting...' : 'Convert'}
            </button>
            <button
              type="button"
              className="tool-icon-button"
              aria-label="Reset"
              onClick={() => {
                setDateTimeInput(currentLocalDateTime())
                setDateTimeResult('')
                setMessage('')
              }}
            >
              ↻
            </button>
          </div>

          <StatusMessage message={dateTimeResult} tone="success" />
        </SurfaceCard>
      </div>

      <StatusMessage message={message} />
    </>
  )
}

function NumberTool({ page }) {
  const [sourceBase, setSourceBase] = useState(10)
  const [input, setInput] = useState('42')
  const [results, setResults] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConvert = async () => {
    if (!input.trim()) {
      setMessage('Enter a number to convert.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const conversions = await Promise.all(
        BASE_OPTIONS.map(async (option) => {
          const response = await convertNumberBase(input, sourceBase, option.value)
          return [option.value, response.data.result]
        }),
      )
      setResults(Object.fromEntries(conversions))
      setMessage('Base conversion completed successfully')
    } catch (error) {
      setResults(null)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="tool-grid">
        <SurfaceCard title="Input Number">
          <div className="form-fields">
            <div className="form-field">
              <label className="form-field__label" htmlFor="input-base">
                Input Base
              </label>
              <select
                id="input-base"
                className="tool-select"
                value={sourceBase}
                onChange={(event) => setSourceBase(Number(event.target.value))}
              >
                {BASE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="number-input">
                Number
              </label>
              <input
                id="number-input"
                className="tool-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <div className="form-field__hint">
                Enter a {baseName(sourceBase).toLowerCase()} number (without prefix)
              </div>
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="tool-action tool-action--primary" onClick={handleConvert} disabled={isLoading}>
              {isLoading ? 'Converting...' : 'Convert'}
            </button>
            <button
              type="button"
              className="tool-icon-button"
              aria-label="Reset"
              onClick={() => {
                setSourceBase(10)
                setInput('42')
                setResults(null)
                setMessage('')
              }}
            >
              ↻
            </button>
          </div>

          <StatusMessage message={message} />
        </SurfaceCard>

        <SurfaceCard title="All Bases">
          <div className="output-panel output-panel--stacked">
            {results ? (
              <>
                <OutputItem label="Binary" value={`0b${results[2]}`} />
                <OutputItem label="Octal" value={`0o${results[8]}`} />
                <OutputItem label="Decimal" value={results[10]} />
                <OutputItem label="Hexadecimal" value={`0x${String(results[16]).toUpperCase()}`} />
              </>
            ) : (
              page.outputEmpty
            )}
          </div>
        </SurfaceCard>
      </div>
    </>
  )
}

function EscapeTool({ page }) {
  const [escapeType, setEscapeType] = useState('url')
  const [mode, setMode] = useState('escape')
  const [input, setInput] = useState('hello world & special chars!')
  const [result, setResult] = useState(page.outputPlaceholder)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim()) {
      setMessage('Enter text to process.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await escapeValue(escapeType, mode, input)
      setResult(response.data.result)
      setMessage(response.status.description)
    } catch (error) {
      setResult(page.outputPlaceholder)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwap = () => {
    setInput(result === page.outputPlaceholder ? '' : result)
    setResult(input || page.outputPlaceholder)
    setMode((current) => (current === 'escape' ? 'unescape' : 'escape'))
    setMessage('')
  }

  return (
    <div className="tool-grid">
      <SurfaceCard title="Input">
        <SegmentedControl
          options={ESCAPE_TYPES}
          selected={escapeType}
          onSelect={(value) => {
            setEscapeType(value)
            setMessage('')
          }}
          formatLabel={(value) => (value === 'javascript' ? 'JavaScript' : value.toUpperCase())}
          columns={3}
        />

        <SegmentedControl
          options={['escape', 'unescape']}
          selected={mode}
          onSelect={(value) => {
            setMode(value)
            setMessage('')
          }}
          formatLabel={capitalize}
          columns={2}
        />

        <textarea className="tool-textarea" value={input} onChange={(event) => setInput(event.target.value)} />

        <div className="action-row">
          <button type="button" className="tool-action tool-action--primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Processing...' : capitalize(mode)}
          </button>
          <button
            type="button"
            className="tool-icon-button"
            aria-label="Reset"
            onClick={() => {
              setInput('hello world & special chars!')
              setResult(page.outputPlaceholder)
              setMode('escape')
              setEscapeType('url')
              setMessage('')
            }}
          >
            ↻
          </button>
        </div>

        <StatusMessage message={message} />
      </SurfaceCard>

      <SurfaceCard
        title="Output"
        actions={
          <>
            <button type="button" className="tool-header-icon" onClick={handleSwap} aria-label="Swap input and output">
              ⇵
            </button>
            <button
              type="button"
              className="tool-header-icon"
              aria-label="Copy output"
              onClick={() => copyText(result, setMessage, page.outputPlaceholder)}
            >
              ⧉
            </button>
          </>
        }
      >
        <pre className="output-panel output-panel--code">{result}</pre>
      </SurfaceCard>
    </div>
  )
}

function UuidTool() {
  const [generated, setGenerated] = useState([])
  const [uuidInput, setUuidInput] = useState('')
  const [validation, setValidation] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async (count) => {
    setIsLoading(true)
    setMessage('')

    try {
      const responses = await Promise.all(Array.from({ length: count }, () => generateUuid()))
      setGenerated(responses.map((response) => response.data.result))
      setMessage(`Generated ${count} UUID${count > 1 ? 's' : ''} successfully.`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidate = async () => {
    if (!uuidInput.trim()) {
      setMessage('Enter a UUID to validate.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await validateUuid(uuidInput)
      setValidation(response.data)
      setMessage(response.status.description)
    } catch (error) {
      setValidation(null)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="tool-grid">
      <SurfaceCard title="Generate UUIDs">
        <div className="action-row action-row--uuid">
          {[1, 5, 10].map((count, index) => (
            <button
              key={count}
              type="button"
              className={`tool-action${index === 0 ? ' tool-action--primary' : ''}`}
              onClick={() => handleGenerate(count)}
              disabled={isLoading}
            >
              {count === 1 ? 'Generate 1 UUID' : `Generate ${count}`}
            </button>
          ))}
        </div>

        <div className="output-panel output-panel--stacked output-panel--dashed">
          {generated.length ? (
            generated.map((value) => <OutputItem key={value} label="UUID" value={value} />)
          ) : (
            'Click a button to generate UUIDs'
          )}
        </div>
      </SurfaceCard>

      <SurfaceCard title="Validate UUID">
        <div className="form-fields">
          <div className="form-field">
            <label className="form-field__label" htmlFor="uuid-input">
              Enter UUID to Validate
            </label>
            <input
              id="uuid-input"
              className="tool-input"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={uuidInput}
              onChange={(event) => setUuidInput(event.target.value)}
            />
          </div>
        </div>

        <div className="action-row">
          <button type="button" className="tool-action tool-action--primary" onClick={handleValidate} disabled={isLoading}>
            {isLoading ? 'Validating...' : 'Validate'}
          </button>
          <button
            type="button"
            className="tool-icon-button"
            aria-label="Reset"
            onClick={() => {
              setUuidInput('')
              setValidation(null)
              setMessage('')
            }}
          >
            ↻
          </button>
        </div>

        <div className="output-panel output-panel--stacked output-panel--dashed">
          {validation ? (
            <>
              <OutputItem label="Valid" value={validation.valid ? 'Yes' : 'No'} />
              <OutputItem label="Normalized" value={validation.normalized || 'Unavailable'} />
            </>
          ) : (
            'Enter a UUID to validate'
          )}
        </div>

        <StatusMessage message={message} />
      </SurfaceCard>
    </div>
  )
}

function ColorTool({ page }) {
  const [hex, setHex] = useState('#0ea5e9')
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConvert = async (value = hex) => {
    if (!value.trim()) {
      setMessage('Enter a HEX color.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await convertColorFromHex(value)
      setResult(response.data)
      setHex(response.data.hex)
      setMessage(response.status.description)
    } catch (error) {
      setResult(null)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="tool-grid">
      <SurfaceCard title={page.inputTitle}>
        <div className="form-fields">
          <div className="form-field">
            <label className="form-field__label" htmlFor="hex-input">
              HEX Color Code
            </label>
            <div className="color-input-row">
              <input
                id="hex-input"
                className="tool-input"
                value={hex}
                onChange={(event) => setHex(event.target.value)}
              />
              <div className="color-swatch color-swatch--small" style={{ backgroundColor: safeColor(hex) }} />
            </div>
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="color-picker">
              Pick a Color
            </label>
            <input
              id="color-picker"
              type="color"
              className="tool-color-picker"
              value={safeColor(hex)}
              onChange={(event) => {
                setHex(event.target.value)
                void handleConvert(event.target.value)
              }}
            />
          </div>
        </div>

        <div className="action-row">
          <button type="button" className="tool-action tool-action--primary" onClick={() => handleConvert()} disabled={isLoading}>
            {isLoading ? 'Converting...' : 'Convert'}
          </button>
          <button
            type="button"
            className="tool-icon-button"
            aria-label="Reset"
            onClick={() => {
              setHex('#0ea5e9')
              void handleConvert('#0ea5e9')
            }}
          >
            ↻
          </button>
        </div>

        <StatusMessage message={message} />
      </SurfaceCard>

      <SurfaceCard title={page.outputTitle}>
        <div className="output-panel output-panel--stacked">
          {result ? (
            <>
              <OutputItem label="HEX" value={result.hex} />
              <OutputItem label="RGB" value={`${result.red}, ${result.green}, ${result.blue}`} />
              <OutputItem label="HSL" value={`${result.hue}°, ${result.saturation}%, ${result.lightness}%`} />
            </>
          ) : (
            page.outputEmpty
          )}
        </div>
      </SurfaceCard>
    </div>
  )
}

function FileTool({ page }) {
  const [fileInfo, setFileInfo] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = async (event) => {
    const [file] = event.target.files || []
    if (!file) {
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await inspectFile(file)
      setFileInfo(response.data)
      setMessage(response.status.description)
    } catch (error) {
      setFileInfo(null)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="tool-grid">
      <SurfaceCard title={page.upload.title}>
        <label className="upload-dropzone">
          <input type="file" className="sr-only" onChange={handleFileChange} />
          <div className="upload-dropzone__icon">⇪</div>
          <div className="upload-dropzone__title">{isLoading ? 'Analyzing file...' : page.upload.emptyTitle}</div>
          <div className="upload-dropzone__hint">{page.upload.emptyHint}</div>
          <span className="tool-action tool-action--primary tool-action--compact">{page.upload.action}</span>
        </label>

        <StatusMessage message={message} />
      </SurfaceCard>

      <SurfaceCard title={page.outputTitle}>
        <div className="output-panel output-panel--stacked">
          {fileInfo ? (
            <>
              <OutputItem label="Name" value={fileInfo.fileName} />
              <OutputItem label="Type" value={fileInfo.contentType || fileInfo.extension || 'Unknown'} />
              <OutputItem label="Size" value={formatBytes(fileInfo.size)} />
              <OutputItem label="SHA-256" value={fileInfo.sha256} />
            </>
          ) : (
            page.outputEmpty
          )}
        </div>
      </SurfaceCard>
    </div>
  )
}

function SegmentedControl({ options, selected, onSelect, formatLabel = identity, columns }) {
  return (
    <div
      className="segmented-control"
      style={{ gridTemplateColumns: `repeat(${columns || options.length}, minmax(0, 1fr))` }}
    >
      {options.map((item) => (
        <button
          key={item}
          type="button"
          className={`segmented-control__item${selected === item ? ' segmented-control__item--active' : ''}`}
          onClick={() => onSelect(item)}
        >
          {formatLabel(item)}
        </button>
      ))}
    </div>
  )
}

function OutputItem({ label, value }) {
  return (
    <div className="output-item">
      <span className="output-item__label">{label}</span>
      <span className="output-item__value">{value}</span>
    </div>
  )
}

function StatPill({ label, value }) {
  return (
    <div className="stat-pill">
      <span className="stat-pill__label">{label}</span>
      <span className="stat-pill__value">{value}</span>
    </div>
  )
}

function StatusMessage({ message, tone = 'neutral' }) {
  if (!message) {
    return null
  }

  return <div className={`status-message status-message--${tone}`}>{message}</div>
}

function ExampleSection({ section }) {
  return (
    <SurfaceCard title={section.title} className="surface-card--full">
      {section.cards ? (
        <div className={`example-grid example-grid--${Math.min(section.cards.length, 4)}`}>
          {section.cards.map((card) => (
            <div key={card.title} className="example-card">
              <div className="example-card__title">{card.title}</div>
              <div className="example-card__body example-card__body--multiline">{card.body}</div>
            </div>
          ))}
        </div>
      ) : null}

      {section.code ? <pre className="example-code">{section.code}</pre> : null}

      {section.table ? (
        <div className="reference-table">
          <div className="reference-table__head">
            {section.table.columns.map((column) => (
              <div key={column} className="reference-table__cell reference-table__cell--head">
                {column}
              </div>
            ))}
          </div>
          {section.table.rows.map((row, index) => (
            <div key={`${row[0]}-${index}`} className="reference-table__row">
              {row.map((cell, cellIndex) => (
                <div key={`${cell}-${cellIndex}`} className="reference-table__cell">
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {section.palettes ? (
        <div className="palette-grid">
          {section.palettes.map((palette) => (
            <div key={palette.name} className="palette-card">
              <div className="palette-card__swatch" style={{ backgroundColor: palette.value }} />
              <div className="palette-card__name">{palette.name}</div>
              <div className="palette-card__value">{palette.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </SurfaceCard>
  )
}

function copyText(value, setMessage, emptyValue) {
  if (!value || value === emptyValue || !navigator.clipboard) {
    setMessage('Nothing to copy yet.')
    return
  }

  navigator.clipboard
    .writeText(value)
    .then(() => setMessage('Copied to clipboard.'))
    .catch(() => setMessage('Copy failed.'))
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

function baseName(base) {
  return BASE_OPTIONS.find((option) => option.value === base)?.label || 'Number'
}

function currentUnixTimestamp() {
  return String(Math.floor(Date.now() / 1000))
}

function currentLocalDateTime() {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

function safeColor(value) {
  return /^#?[0-9a-fA-F]{6}$/.test(value) ? (value.startsWith('#') ? value : `#${value}`) : '#0ea5e9'
}

function formatBytes(size) {
  if (!size && size !== 0) {
    return 'Unknown'
  }

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function identity(value) {
  return value
}
