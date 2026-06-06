import { useState } from 'react'
import { SurfaceCard } from '../components/SurfaceCard'
import { ToolHeader } from '../components/ToolHeader'
import {
  base64DecodeText,
  base64EncodeText,
  convertColorFromHex,
  convertDateToTimestamp,
  convertTimestampToDate,
  formatJson,
  generateHash,
  inspectFile,
  minifyJson,
  validateJson,
} from '../services/devToolApi'

const HASH_ALGORITHMS = ['SHA-256', 'SHA-512', 'SHA-1', 'MD5']

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
      {page.id === 'timestamp' ? <TimestampTool page={page} /> : null}
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

  const actions = (
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
  )

  return (
    <div className="tool-grid">
      <SurfaceCard title={page.inputTitle}>
        <div className="segmented-control">
          {['encode', 'decode'].map((item) => (
            <button
              key={item}
              type="button"
              className={`segmented-control__item${mode === item ? ' segmented-control__item--active' : ''}`}
              onClick={() => {
                setMode(item)
                setMessage('')
              }}
            >
              {capitalize(item)}
            </button>
          ))}
        </div>

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

      <SurfaceCard title={page.outputTitle} actions={actions}>
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
        <pre className="output-panel output-panel--code">
          {result || 'Generate a hash to see results'}
        </pre>
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
              <OutputItem
                label="HSL"
                value={`${result.hue}°, ${result.saturation}%, ${result.lightness}%`}
              />
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

function OutputItem({ label, value }) {
  return (
    <div className="output-item">
      <span className="output-item__label">{label}</span>
      <span className="output-item__value">{value}</span>
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
              <div className="example-card__body">{card.body}</div>
            </div>
          ))}
        </div>
      ) : null}

      {section.code ? <pre className="example-code">{section.code}</pre> : null}

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
