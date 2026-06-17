import { useState } from 'react'
import JSZip from 'jszip'
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'
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
      {page.id === 'pdf' ? <PdfTool page={page} /> : null}

      {page.exampleSection ? <ExampleSection section={page.exampleSection} /> : null}
    </div>
  )
}

function PdfTool({ page }) {
  const [activeOperationId, setActiveOperationId] = useState(page.operations[0]?.id ?? '')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [splitMode, setSplitMode] = useState('range')
  const [splitRange, setSplitRange] = useState('1-3, 5')
  const [compressionLevel, setCompressionLevel] = useState('balanced')
  const [rotationAngle, setRotationAngle] = useState('90')
  const [removePages, setRemovePages] = useState('2, 5')
  const [pageOrder, setPageOrder] = useState('1, 3, 2, 4')
  const [numberPosition, setNumberPosition] = useState('bottom-right')
  const [startNumber, setStartNumber] = useState('1')
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState('neutral')
  const [isProcessing, setIsProcessing] = useState(false)

  const activeOperation = page.operations.find((operation) => operation.id === activeOperationId) ?? page.operations[0]
  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0)
  const fileInputId = 'pdf-tool-upload-input'

  const updateMessage = (nextMessage, tone = 'neutral') => {
    setMessage(nextMessage)
    setMessageTone(tone)
  }

  const handleFilesChange = (event) => {
    const files = Array.from(event.target.files || []).map((file) => ({
      file,
      name: file.name,
      size: file.size,
      modifiedAt: new Date(file.lastModified).toLocaleDateString(),
    }))

    setSelectedFiles(files)
    updateMessage('')
  }

  const handleProcess = async () => {
    if (!selectedFiles.length) {
      updateMessage('Choose at least one PDF file first.')
      return
    }

    if (activeOperationId === 'merge' && selectedFiles.length < 2) {
      updateMessage('Select at least two PDF files to merge.')
      return
    }

    setIsProcessing(true)
    updateMessage('')

    try {
      let outputs = []

      if (activeOperationId === 'merge') {
        outputs = [await mergePdfFiles(selectedFiles)]
      } else if (activeOperationId === 'split') {
        outputs = await splitPdfFiles(selectedFiles, splitMode, splitRange)
      } else if (activeOperationId === 'compress') {
        outputs = await compressPdfFiles(selectedFiles, compressionLevel)
      } else if (activeOperationId === 'rotate') {
        outputs = await rotatePdfFiles(selectedFiles, rotationAngle)
      } else if (activeOperationId === 'remove') {
        outputs = await removePdfPages(selectedFiles, removePages)
      } else if (activeOperationId === 'reorder') {
        outputs = await reorderPdfPages(selectedFiles, pageOrder)
      } else if (activeOperationId === 'numbers') {
        outputs = await addPdfPageNumbers(selectedFiles, numberPosition, startNumber)
      }

      await downloadPdfOutputs(outputs, activeOperationId)
      updateMessage(getPdfSuccessMessage(activeOperationId, outputs.length), 'success')
    } catch (error) {
      updateMessage(error.message || `Unable to process ${activeOperation.label.toLowerCase()}.`, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="pdf-tool-page">
      <section className="pdf-tool-hero">
        <div className="pdf-tool-hero__brand">
          <div className="pdf-tool-hero__icon">▤</div>
          <div>
            <h2 className="pdf-tool-hero__title">{page.title}</h2>
            <p className="pdf-tool-hero__subtitle">{page.hero.subtitle}</p>
          </div>
        </div>

        <div className="pdf-tool-hero__highlights">
          {page.hero.highlights.map((highlight) => (
            <span key={highlight} className="pdf-tool-highlight">
              {highlight}
            </span>
          ))}
        </div>
      </section>

      <div className="pdf-tool-layout">
        <SurfaceCard title="Operations" className="pdf-tool-nav">
          <div className="pdf-tool-nav__list">
            {page.operations.map((operation) => {
              const isActive = operation.id === activeOperation.id
              return (
                <button
                  key={operation.id}
                  type="button"
                  className={`pdf-tool-nav__item${isActive ? ' pdf-tool-nav__item--active' : ''}`}
                  onClick={() => setActiveOperationId(operation.id)}
                >
                  <div>
                    <div className="pdf-tool-nav__label">{operation.label}</div>
                    <div className="pdf-tool-nav__description">{operation.description}</div>
                  </div>
                  {operation.tag ? <span className="pdf-tool-nav__tag">{operation.tag}</span> : null}
                </button>
              )
            })}
          </div>

          <div className="pdf-tool-note">{page.localNote}</div>
        </SurfaceCard>

        <div className="pdf-tool-main">
          <SurfaceCard
            title={activeOperation.label}
            actions={activeOperation.tag ? <span className="tool-header__badge">{activeOperation.tag}</span> : null}
            className="pdf-tool-workspace"
          >
            <p className="pdf-tool-workspace__description">{activeOperation.description}</p>

            <input
              id={fileInputId}
              type="file"
              accept="application/pdf"
              multiple
              className="sr-only"
              onChange={handleFilesChange}
            />
            <div className="upload-dropzone upload-dropzone--pdf">
              {selectedFiles.length ? (
                <div className="pdf-tool-selection">
                  <div className="pdf-tool-selection__summary">
                    <div>
                      <div className="pdf-tool-selection__eyebrow">Selected PDF Files</div>
                      <div className="pdf-tool-selection__title">
                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready
                      </div>
                      <div className="pdf-tool-selection__meta">
                        {formatFileSize(totalSize)} total size
                      </div>
                    </div>

                    <label htmlFor={fileInputId} className="tool-action tool-action--primary tool-action--compact pdf-tool-upload-button">
                      {page.uploadPanel.action}
                    </label>
                  </div>

                  <div className="pdf-tool-setup-grid">
                    <div className="pdf-tool-config">
                      <div className="pdf-tool-config__title">Operation Setup</div>
                      <div className="pdf-tool-config__subtitle">
                        Adjust the options for {activeOperation.label.toLowerCase()} before processing.
                      </div>
                      <div className="pdf-tool-config__fields">
                        {renderPdfOperationControls({
                          activeOperationId,
                          splitMode,
                          splitRange,
                          compressionLevel,
                          rotationAngle,
                          removePages,
                          pageOrder,
                          numberPosition,
                          startNumber,
                          setSplitMode,
                          setSplitRange,
                          setCompressionLevel,
                          setRotationAngle,
                          setRemovePages,
                          setPageOrder,
                          setNumberPosition,
                          setStartNumber,
                        })}
                      </div>
                    </div>

                    <div className="pdf-tool-file-list">
                      <div className="pdf-tool-config__title">Files Queue</div>
                      <div className="pdf-tool-config__subtitle">
                        {activeOperationId === 'merge' || activeOperationId === 'reorder'
                          ? 'The order below will be used during processing.'
                          : 'Review the PDFs included in this operation.'}
                      </div>
                      <div className="pdf-tool-files">
                        {selectedFiles.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="pdf-tool-file-item">
                            <div>
                              <div className="pdf-tool-file-item__name">{file.name}</div>
                              <div className="pdf-tool-file-item__meta">
                                {formatFileSize(file.size)} · Updated {file.modifiedAt}
                              </div>
                            </div>
                            <div className="pdf-tool-file-item__index">{index + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pdf-tool-footer">
                    <button
                      type="button"
                      className="tool-action tool-action--primary"
                      onClick={handleProcess}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : getPdfPrimaryAction(activeOperationId)}
                    </button>
                    <button
                      type="button"
                      className="tool-icon-button tool-icon-button--wide"
                      onClick={() => {
                        setSelectedFiles([])
                        updateMessage('')
                      }}
                    >
                      Reset
                    </button>
                  </div>

                  <StatusMessage message={message} tone={messageTone} />
                </div>
              ) : (
                <div className="pdf-tool-upload-empty">
                  <div className="upload-dropzone__icon">⇪</div>
                  <div className="upload-dropzone__title">{page.uploadPanel.title}</div>
                  <div className="upload-dropzone__hint">{page.uploadPanel.hint}</div>
                  <div className="pdf-tool-bullets">
                    {page.uploadPanel.bullets.map((bullet) => (
                      <span key={bullet} className="pdf-tool-bullet">
                        {bullet}
                      </span>
                    ))}
                  </div>
                  <label htmlFor={fileInputId} className="tool-action tool-action--primary tool-action--compact pdf-tool-upload-button">
                    {page.uploadPanel.action}
                  </label>
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="pdf-tool-side">
          {page.infoCards.map((card) => (
            <SurfaceCard key={card.title} title={card.title}>
              <p className="dashboard-panel-copy pdf-tool-copy">{card.body}</p>
            </SurfaceCard>
          ))}

          <SurfaceCard title="Capabilities">
            <div className="pdf-tool-capabilities">
              {page.capabilities.map((capability) => (
                <div key={capability} className="pdf-tool-capability">
                  {capability}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

function renderPdfOperationControls({
  activeOperationId,
  splitMode,
  splitRange,
  compressionLevel,
  rotationAngle,
  removePages,
  pageOrder,
  numberPosition,
  startNumber,
  setSplitMode,
  setSplitRange,
  setCompressionLevel,
  setRotationAngle,
  setRemovePages,
  setPageOrder,
  setNumberPosition,
  setStartNumber,
}) {
  if (activeOperationId === 'merge') {
    return (
      <>
        <PdfField label="Output Name">
          <input className="tool-input" value="merged-document.pdf" readOnly />
        </PdfField>
        <PdfField label="Merge Strategy">
          <select className="tool-select" defaultValue="preserve">
            <option value="preserve">Preserve original order</option>
            <option value="bookmark">Create bookmarks from filenames</option>
          </select>
        </PdfField>
      </>
    )
  }

  if (activeOperationId === 'split') {
    return (
      <>
        <PdfField label="Split Mode">
          <SegmentedControl
            options={['range', 'every-page']}
            selected={splitMode}
            onSelect={setSplitMode}
            formatLabel={(value) => (value === 'every-page' ? 'Every Page' : 'By Range')}
          />
        </PdfField>
        {splitMode === 'range' ? (
          <PdfField label="Page Ranges">
            <input className="tool-input" value={splitRange} onChange={(event) => setSplitRange(event.target.value)} />
          </PdfField>
        ) : (
          <PdfField label="Output Pattern">
            <input className="tool-input" value="page-{n}.pdf" readOnly />
          </PdfField>
        )}
      </>
    )
  }

  if (activeOperationId === 'compress') {
    return (
      <>
        <PdfField label="Compression Level">
          <SegmentedControl
            options={['light', 'balanced', 'strong']}
            selected={compressionLevel}
            onSelect={setCompressionLevel}
            formatLabel={capitalize}
            columns={3}
          />
        </PdfField>
        <PdfField label="Estimated Output">
          <input className="tool-input" value="Reduce size while keeping text sharp" readOnly />
        </PdfField>
      </>
    )
  }

  if (activeOperationId === 'rotate') {
    return (
      <>
        <PdfField label="Rotation Angle">
          <SegmentedControl
            options={['90', '180', '270']}
            selected={rotationAngle}
            onSelect={setRotationAngle}
            formatLabel={(value) => `${value}°`}
            columns={3}
          />
        </PdfField>
        <PdfField label="Target Pages">
          <input className="tool-input" value="All pages" readOnly />
        </PdfField>
      </>
    )
  }

  if (activeOperationId === 'remove') {
    return (
      <>
        <PdfField label="Pages to Remove">
          <input className="tool-input" value={removePages} onChange={(event) => setRemovePages(event.target.value)} />
        </PdfField>
        <PdfField label="Remaining Output">
          <input className="tool-input" value="A new PDF will be generated without selected pages" readOnly />
        </PdfField>
      </>
    )
  }

  if (activeOperationId === 'reorder') {
    return (
      <>
        <PdfField label="New Page Order">
          <input className="tool-input" value={pageOrder} onChange={(event) => setPageOrder(event.target.value)} />
        </PdfField>
        <PdfField label="Hint">
          <input className="tool-input" value="Example: 1, 3, 2, 4" readOnly />
        </PdfField>
      </>
    )
  }

  return (
    <>
      <PdfField label="Number Position">
        <select className="tool-select" value={numberPosition} onChange={(event) => setNumberPosition(event.target.value)}>
          <option value="top-left">Top Left</option>
          <option value="top-right">Top Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-right">Bottom Right</option>
        </select>
      </PdfField>
      <PdfField label="Start Number">
        <input className="tool-input" value={startNumber} onChange={(event) => setStartNumber(event.target.value)} />
      </PdfField>
    </>
  )
}

function PdfField({ label, children }) {
  return (
    <div className="pdf-tool-field">
      <label className="form-field__label">{label}</label>
      {children}
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

function getPdfPrimaryAction(operationId) {
  if (operationId === 'merge') return 'Merge PDFs'
  if (operationId === 'split') return 'Split PDF'
  if (operationId === 'compress') return 'Compress PDF'
  if (operationId === 'rotate') return 'Rotate Pages'
  if (operationId === 'remove') return 'Remove Pages'
  if (operationId === 'reorder') return 'Reorder Pages'
  return 'Add Page Numbers'
}

function getPdfSuccessMessage(operationId, outputCount) {
  if (operationId === 'merge') return 'Merged PDF downloaded successfully.'
  if (operationId === 'split') return outputCount > 1 ? 'Split PDF ZIP downloaded successfully.' : 'Split PDF downloaded successfully.'
  if (operationId === 'compress') return outputCount > 1 ? 'Compressed PDF ZIP downloaded successfully.' : 'Compressed PDF downloaded successfully.'
  if (operationId === 'rotate') return outputCount > 1 ? 'Rotated PDF ZIP downloaded successfully.' : 'Rotated PDF downloaded successfully.'
  if (operationId === 'remove') return outputCount > 1 ? 'Updated PDF ZIP downloaded successfully.' : 'Updated PDF downloaded successfully.'
  if (operationId === 'reorder') return outputCount > 1 ? 'Reordered PDF ZIP downloaded successfully.' : 'Reordered PDF downloaded successfully.'
  return outputCount > 1 ? 'Page-numbered PDF ZIP downloaded successfully.' : 'Page-numbered PDF downloaded successfully.'
}

async function mergePdfFiles(selectedFiles) {
  const mergedPdf = await PDFDocument.create()

  for (const item of selectedFiles) {
    const sourcePdf = await loadPdfDocument(item.file)
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  return {
    name: 'merged-document.pdf',
    bytes: await mergedPdf.save(),
  }
}

async function splitPdfFiles(selectedFiles, splitMode, splitRange) {
  const outputs = []

  for (const item of selectedFiles) {
    const sourcePdf = await loadPdfDocument(item.file)
    const pageCount = sourcePdf.getPageCount()
    const groups = splitMode === 'every-page'
      ? sourcePdf.getPageIndices().map((index) => [index + 1, index + 1])
      : parsePageRanges(splitRange, pageCount)

    for (const [groupIndex, [startPage, endPage]] of groups.entries()) {
      const nextPdf = await PDFDocument.create()
      const pageIndexes = range(startPage - 1, endPage - 1)
      const copiedPages = await nextPdf.copyPages(sourcePdf, pageIndexes)
      copiedPages.forEach((page) => nextPdf.addPage(page))

      outputs.push({
        name: `${fileStem(item.name)}-part-${groupIndex + 1}.pdf`,
        bytes: await nextPdf.save(),
      })
    }
  }

  return outputs
}

async function compressPdfFiles(selectedFiles, compressionLevel) {
  const outputs = []

  for (const item of selectedFiles) {
    const sourcePdf = await loadPdfDocument(item.file)
    const rebuiltPdf = await PDFDocument.create()
    const copiedPages = await rebuiltPdf.copyPages(sourcePdf, sourcePdf.getPageIndices())
    copiedPages.forEach((page) => rebuiltPdf.addPage(page))

    const bytes = await rebuiltPdf.save({
      useObjectStreams: compressionLevel !== 'light',
      addDefaultPage: false,
      objectsPerTick: compressionLevel === 'strong' ? 100 : 50,
    })

    outputs.push({
      name: `${fileStem(item.name)}-compressed.pdf`,
      bytes,
    })
  }

  return outputs
}

async function rotatePdfFiles(selectedFiles, rotationAngle) {
  const outputs = []
  const angle = Number(rotationAngle)

  for (const item of selectedFiles) {
    const pdf = await loadPdfDocument(item.file)
    pdf.getPages().forEach((page) => page.setRotation(degrees(angle)))

    outputs.push({
      name: `${fileStem(item.name)}-rotated.pdf`,
      bytes: await pdf.save(),
    })
  }

  return outputs
}

async function removePdfPages(selectedFiles, removePages) {
  const outputs = []

  for (const item of selectedFiles) {
    const pdf = await loadPdfDocument(item.file)
    const pagesToRemove = parsePageNumberList(removePages, pdf.getPageCount())

    if (pagesToRemove.length >= pdf.getPageCount()) {
      throw new Error('At least one page must remain after removal.')
    }

    pagesToRemove
      .slice()
      .sort((left, right) => right - left)
      .forEach((pageNumber) => pdf.removePage(pageNumber - 1))

    outputs.push({
      name: `${fileStem(item.name)}-pages-removed.pdf`,
      bytes: await pdf.save(),
    })
  }

  return outputs
}

async function reorderPdfPages(selectedFiles, pageOrder) {
  const outputs = []

  for (const item of selectedFiles) {
    const sourcePdf = await loadPdfDocument(item.file)
    const order = parsePageOrder(pageOrder, sourcePdf.getPageCount())
    const nextPdf = await PDFDocument.create()
    const copiedPages = await nextPdf.copyPages(sourcePdf, order.map((pageNumber) => pageNumber - 1))
    copiedPages.forEach((page) => nextPdf.addPage(page))

    outputs.push({
      name: `${fileStem(item.name)}-reordered.pdf`,
      bytes: await nextPdf.save(),
    })
  }

  return outputs
}

async function addPdfPageNumbers(selectedFiles, numberPosition, startNumber) {
  const outputs = []
  const initialNumber = Number(startNumber)

  if (!Number.isInteger(initialNumber) || initialNumber < 0) {
    throw new Error('Start number must be a valid non-negative integer.')
  }

  for (const item of selectedFiles) {
    const pdf = await loadPdfDocument(item.file)
    const font = await pdf.embedFont(StandardFonts.Helvetica)

    pdf.getPages().forEach((page, index) => {
      const label = String(initialNumber + index)
      const { width, height } = page.getSize()
      const fontSize = 12
      const textWidth = font.widthOfTextAtSize(label, fontSize)
      const { x, y } = getPageNumberCoordinates(numberPosition, width, height, textWidth)

      page.drawText(label, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.12, 0.16, 0.27),
      })
    })

    outputs.push({
      name: `${fileStem(item.name)}-numbered.pdf`,
      bytes: await pdf.save(),
    })
  }

  return outputs
}

async function downloadPdfOutputs(outputs, operationId) {
  if (outputs.length === 1) {
    downloadFile(new Blob([outputs[0].bytes], { type: 'application/pdf' }), outputs[0].name)
    return
  }

  const zip = new JSZip()
  outputs.forEach((output) => {
    zip.file(output.name, output.bytes)
  })

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadFile(zipBlob, `${operationId}-results.zip`)
}

async function loadPdfDocument(file) {
  return PDFDocument.load(await file.arrayBuffer())
}

function parsePageRanges(value, pageCount) {
  const segments = value
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)

  if (!segments.length) {
    throw new Error('Enter at least one page range.')
  }

  return segments.map((segment) => {
    if (segment.includes('-')) {
      const [rawStart, rawEnd] = segment.split('-').map((part) => part.trim())
      const start = Number(rawStart)
      const end = Number(rawEnd)

      if (!isValidPageNumber(start, pageCount) || !isValidPageNumber(end, pageCount) || start > end) {
        throw new Error(`Invalid page range: ${segment}`)
      }

      return [start, end]
    }

    const page = Number(segment)
    if (!isValidPageNumber(page, pageCount)) {
      throw new Error(`Invalid page number: ${segment}`)
    }

    return [page, page]
  })
}

function parsePageNumberList(value, pageCount) {
  return Array.from(
    new Set(
      parsePageRanges(value, pageCount).flatMap(([start, end]) => range(start, end)),
    ),
  ).sort((left, right) => left - right)
}

function parsePageOrder(value, pageCount) {
  const order = value
    .split(',')
    .map((segment) => Number(segment.trim()))
    .filter((pageNumber) => Number.isInteger(pageNumber))

  if (order.length !== pageCount) {
    throw new Error(`Page order must contain exactly ${pageCount} page numbers.`)
  }

  const uniqueOrder = new Set(order)
  if (uniqueOrder.size !== pageCount || order.some((pageNumber) => !isValidPageNumber(pageNumber, pageCount))) {
    throw new Error('Page order must include each page exactly once.')
  }

  return order
}

function getPageNumberCoordinates(position, width, height, textWidth) {
  const margin = 24

  if (position === 'top-left') return { x: margin, y: height - margin }
  if (position === 'top-right') return { x: width - textWidth - margin, y: height - margin }
  if (position === 'bottom-left') return { x: margin, y: margin }
  return { x: width - textWidth - margin, y: margin }
}

function fileStem(name) {
  return name.replace(/\.pdf$/i, '') || 'document'
}

function isValidPageNumber(value, pageCount) {
  return Number.isInteger(value) && value >= 1 && value <= pageCount
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

function downloadFile(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function safeColor(value) {
  return /^#?[0-9a-fA-F]{6}$/.test(value) ? (value.startsWith('#') ? value : `#${value}`) : '#0ea5e9'
}

function formatFileSize(size) {
  return formatBytes(size)
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
