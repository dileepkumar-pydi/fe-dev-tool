import { WebFormatter, JwtDecoder, RegexTester, DiffChecker } from './AdditionalTools'
import { useState } from 'react'
import { APP_ROUTES, toHash } from '../utils/appRouter'
import JSZip from 'jszip'
import { SurfaceCard } from '../components/SurfaceCard'
import { ToolHeader } from '../components/ToolHeader'
import {
  addPdfPageNumbers,
  base64DecodeText,
  base64EncodeText,
  compressPdfFile,
  convertColorFromHex,
  convertDateToTimestamp,
  convertNumberBase,
  convertTimestampToDate,
  excelToPdf,
  escapeValue,
  fetchTextStats,
  formatJson,
  generateHash,
  generateUuid,
  htmlToPdf,
  inspectFile,
  jpgToPdf,
  mergePdfFiles,
  minifyJson,
  pdfToExcel,
  pdfToJpg,
  pdfToPdfA,
  pdfToPowerpoint,
  pdfToWord,
  powerpointToPdf,
  removePdfPages as removePdfPagesApi,
  reorderPdfPages as reorderPdfPagesApi,
  rotatePdfFile,
  splitPdfFile,
  transformTextCase,
  validateJson,
  validateUuid,
  wordToPdf,
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

export function ToolPage({ page, operation = '' }) {
  if (page.id === 'pdf') return <div className="tool-page"><PdfTool page={page} initialOperation={operation} /></div>
  return (
    <div className="tool-page">
      <ToolHeader
        category={page.category}
        title={page.title}
        description={page.description}
      />

      {page.id === 'web' ? <WebFormatter /> : null}
      {page.id === 'jwt' ? <JwtDecoder /> : null}
      {page.id === 'regex' ? <RegexTester /> : null}
      {page.id === 'diff' ? <DiffChecker /> : null}
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
    </div>
  )
}

function PdfTool({ page, initialOperation }) {
  const activeOperationId = initialOperation
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [splitMode, setSplitMode] = useState('range')
  const [splitRange, setSplitRange] = useState('1-3, 5')
  const [compressionLevel, setCompressionLevel] = useState('balanced')
  const [rotationAngle, setRotationAngle] = useState('90')
  const [removePages, setRemovePages] = useState('2, 5')
  const [pageOrder, setPageOrder] = useState('1, 3, 2, 4')
  const [numberPosition, setNumberPosition] = useState('bottom-right')
  const [startNumber, setStartNumber] = useState('1')
  const [imageDpi, setImageDpi] = useState('144')
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState('neutral')
  const [isProcessing, setIsProcessing] = useState(false)

  const activeOperation = page.operations.find((operation) => operation.id === activeOperationId) ?? page.operations[0]
  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0)
  const fileInputId = 'pdf-tool-upload-input'
  const uploadPanel = getPdfUploadPanel(activeOperationId)

  const updateMessage = (nextMessage, tone = 'neutral') => {
    setMessage(nextMessage)
    setMessageTone(tone)
  }

  const selectFiles = (fileList) => {
    setIsDragging(false)
    const files = Array.from(fileList || []).filter((file) => {
      const extensions = getPdfAccept(activeOperationId).split(',').map((value) => value.trim())
      return extensions.some((ext) => file.name.toLowerCase().endsWith(ext) || file.type === ext)
    }).map((file) => ({
      file,
      name: file.name,
      size: file.size,
      modifiedAt: new Date(file.lastModified).toLocaleDateString(),
    }))

    setSelectedFiles(supportsMultipleFiles(activeOperationId) ? files : files.slice(0, 1))
    updateMessage(files.length ? '' : 'Choose a file in a supported format.', files.length ? 'neutral' : 'error')
  }

  const handleProcess = async () => {
    if (!selectedFiles.length) {
      updateMessage(`Choose at least one ${uploadPanel.entityLabel} first.`)
      return
    }

    if (activeOperationId === 'merge' && selectedFiles.length < 2) {
      updateMessage('Select at least two PDF files to merge.')
      return
    }

    if (activeOperationId === 'jpg-to-pdf' && selectedFiles.length < 1) {
      updateMessage('Select at least one JPG image to convert.')
      return
    }

    if (!supportsMultipleFiles(activeOperationId) && selectedFiles.length !== 1) {
      updateMessage(`Select exactly one ${uploadPanel.entityLabel} for this operation.`)
      return
    }

    setIsProcessing(true)
    updateMessage('')

    try {
      if (activeOperationId === 'merge') {
        const response = await mergePdfFiles(selectedFiles.map((item) => item.file))
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'split') {
        const response = await splitPdfFile(selectedFiles[0].file, splitMode, splitMode === 'range' ? splitRange : undefined)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'compress') {
        const response = await compressPdfFile(selectedFiles[0].file, compressionLevel)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'rotate') {
        const response = await rotatePdfFile(selectedFiles[0].file, rotationAngle)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'remove') {
        const response = await removePdfPagesApi(selectedFiles[0].file, removePages)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'reorder') {
        const response = await reorderPdfPagesApi(selectedFiles[0].file, pageOrder)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'numbers') {
        const response = await addPdfPageNumbers(selectedFiles[0].file, numberPosition, startNumber)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'jpg-to-pdf') {
        const response = await jpgToPdf(selectedFiles.map((item) => item.file))
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'pdf-to-jpg') {
        const response = await pdfToJpg(selectedFiles[0].file, imageDpi)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'html-to-pdf') {
        const response = await htmlToPdf(selectedFiles[0].file)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'pdf-to-pdfa') {
        const response = await pdfToPdfA(selectedFiles[0].file)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'word-to-pdf') {
        const response = await wordToPdf(selectedFiles[0].file)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'powerpoint-to-pdf') {
        const response = await powerpointToPdf(selectedFiles[0].file)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'excel-to-pdf') {
        const response = await excelToPdf(selectedFiles[0].file)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'pdf-to-word') {
        const response = await pdfToWord(selectedFiles[0].file)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'pdf-to-powerpoint') {
        const response = await pdfToPowerpoint(selectedFiles[0].file)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      } else if (activeOperationId === 'pdf-to-excel') {
        const response = await pdfToExcel(selectedFiles[0].file)
        await downloadPdfBatchResponse(response.data, activeOperationId)
        updateMessage(response.status.description, 'success')
      }
    } catch (error) {
      updateMessage(error.message || `Unable to process ${activeOperation.label.toLowerCase()}.`, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const chooseOperation = (id) => {
    window.location.assign(toHash(id ? `${APP_ROUTES.pdf}/${id}` : APP_ROUTES.pdf))
  }

  if (!activeOperationId) return <div className="pdf-tool-home">
    <ToolHeader category={page.category} title={page.title} description="Choose an operation to merge, edit, or convert your documents." />
    <div className="pdf-tool-home__grid">{page.operations.map((operation, index) =>
      <button type="button" key={operation.id} className={`pdf-operation-card pdf-operation-card--${index % 7}`} onClick={() => chooseOperation(operation.id)}>
        <span className="pdf-operation-card__icon" aria-hidden="true">{['▤', '✂', '↙', '↻', '×', '⇅', '#'][index % 7]}</span>
        <strong>{operation.label}</strong><p>{operation.description}</p><span className="pdf-operation-card__cta" aria-hidden="true">↗</span>
      </button>)}</div>
    <p className="pdf-tool-home__note">Files are uploaded to the configured API for processing. Results download when complete.</p>
  </div>

  return (
    <div className="pdf-tool-page">
      <button type="button" className="pdf-back-button" disabled={isProcessing} onClick={() => chooseOperation('')}>← All PDF tools</button>
      <ToolHeader category={page.category} title={activeOperation.label} description={activeOperation.description} />
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
                  disabled={isProcessing}
                  aria-pressed={isActive}
                  onClick={() => chooseOperation(operation.id)}
                >
                  <div>
                    <div className="pdf-tool-nav__label">{operation.label}</div>
                    <div className="pdf-tool-nav__description">{operation.description}</div>
                  </div>
                </button>
              )
            })}
          </div>

        </SurfaceCard>

        <div className="pdf-tool-main">
          <SurfaceCard
            title={supportsMultipleFiles(activeOperationId) ? 'Files' : 'File'}
            className="pdf-tool-workspace"
          >
            <p className="processing-note">Files are uploaded for processing. Results download when ready.</p>

            <input
              id={fileInputId}
              type="file"
              accept={getPdfAccept(activeOperationId)}
              multiple={supportsMultipleFiles(activeOperationId)}
              className="sr-only"
              disabled={isProcessing}
              onChange={(event) => { selectFiles(event.target.files); event.target.value = '' }}
            />
            <div className={`upload-dropzone upload-dropzone--pdf${isDragging ? ' is-dragging' : ''}`}
              onDragOver={(event) => { event.preventDefault(); if (!isProcessing) setIsDragging(true) }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false) }}
              onDrop={(event) => { event.preventDefault(); setIsDragging(false); if (!isProcessing) selectFiles(event.dataTransfer.files) }}>
              {selectedFiles.length ? (
                <div className="pdf-tool-selection">
                      <div className="pdf-tool-selection__summary">
                        <div>
                          <div className="pdf-tool-selection__eyebrow">{uploadPanel.selectionEyebrow}</div>
                          <div className="pdf-tool-selection__title">
                            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready
                          </div>
                      <div className="pdf-tool-selection__meta">
                        {formatFileSize(totalSize)} total size
                      </div>
                    </div>

                    <label htmlFor={fileInputId} className="tool-action tool-action--primary tool-action--compact pdf-tool-upload-button">
                      {uploadPanel.action}
                    </label>
                  </div>

                  <div className="pdf-tool-setup-grid">
                    <div className="pdf-tool-config">
                      <div className="pdf-tool-config__title">Operation Setup</div>
                      <div className="pdf-tool-config__subtitle">
                        {uploadPanel.setupHint}
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
                          imageDpi,
                          setSplitMode,
                          setSplitRange,
                          setCompressionLevel,
                          setRotationAngle,
                          setRemovePages,
                          setPageOrder,
                          setNumberPosition,
                          setStartNumber,
                          setImageDpi,
                        })}
                      </div>
                    </div>

                    <div className="pdf-tool-file-list">
                      <div className="pdf-tool-config__title">Files Queue</div>
                      <div className="pdf-tool-config__subtitle">
                        {supportsOrderedQueue(activeOperationId)
                          ? 'The order below will be used during processing.'
                          : `Review the ${uploadPanel.entityLabelPlural} included in this operation.`}
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
                            <div className="pdf-tool-file-actions">
                              {supportsOrderedQueue(activeOperationId) && <>
                                <button type="button" disabled={isProcessing || index === 0} aria-label={`Move ${file.name} up`} onClick={() => setSelectedFiles((current) => {
                                  const next = [...current]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next
                                })}>↑</button>
                                <button type="button" disabled={isProcessing || index === selectedFiles.length - 1} aria-label={`Move ${file.name} down`} onClick={() => setSelectedFiles((current) => {
                                  const next = [...current]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next
                                })}>↓</button>
                              </>}
                              <button type="button" disabled={isProcessing} aria-label={`Remove ${file.name}`} onClick={() => setSelectedFiles((current) => current.filter((_, position) => position !== index))}>×</button>
                            </div>
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
                      disabled={isProcessing}
                      onClick={() => {
                        setSelectedFiles([])
                        updateMessage('')
                      }}
                    >
                      Reset
                    </button>
                  </div>

                </div>
              ) : (
                <div className="pdf-tool-upload-empty">
                  <div className="upload-dropzone__icon">⇪</div>
                  <div className="upload-dropzone__title">{uploadPanel.title}</div>
                  <div className="upload-dropzone__hint">{uploadPanel.hint}</div>
                  <label htmlFor={fileInputId} className="tool-action tool-action--primary tool-action--compact pdf-tool-upload-button">
                    {uploadPanel.action}
                  </label>
                </div>
              )}
            </div>
            <StatusMessage message={message} tone={messageTone} />
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
  imageDpi,
  setSplitMode,
  setSplitRange,
  setCompressionLevel,
  setRotationAngle,
  setRemovePages,
  setPageOrder,
  setNumberPosition,
  setStartNumber,
  setImageDpi,
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

  if (activeOperationId === 'jpg-to-pdf') {
    return (
      <>
        <PdfField label="Page Layout">
          <input className="tool-input" value="Each image will be placed on its own PDF page" readOnly />
        </PdfField>
        <PdfField label="Supported Input">
          <input className="tool-input" value="JPG and JPEG images" readOnly />
        </PdfField>
      </>
    )
  }

  if (activeOperationId === 'pdf-to-jpg') {
    return (
      <>
        <PdfField label="Image Quality">
          <SegmentedControl
            options={['96', '144', '300']}
            selected={imageDpi}
            onSelect={setImageDpi}
            formatLabel={(value) => `${value} DPI`}
            columns={3}
          />
        </PdfField>
        <PdfField label="Output Format">
          <input className="tool-input" value="One JPG image per PDF page" readOnly />
        </PdfField>
      </>
    )
  }

  if (activeOperationId === 'html-to-pdf') {
    return (
      <>
        <PdfField label="Rendering Mode">
          <input className="tool-input" value="HTML document rendered as printable PDF" readOnly />
        </PdfField>
        <PdfField label="Supported Input">
          <input className="tool-input" value=".html and .htm files" readOnly />
        </PdfField>
      </>
    )
  }

  if (['word-to-pdf', 'powerpoint-to-pdf', 'excel-to-pdf'].includes(activeOperationId)) {
    return (
      <>
        <PdfField label="Conversion Engine">
          <input className="tool-input" value="Backend office conversion pipeline" readOnly />
        </PdfField>
        <PdfField label="Output">
          <input className="tool-input" value="A PDF file matching the uploaded document" readOnly />
        </PdfField>
      </>
    )
  }

  if (['pdf-to-word', 'pdf-to-powerpoint', 'pdf-to-excel'].includes(activeOperationId)) {
    return (
      <>
        <PdfField label="Conversion Engine">
          <input className="tool-input" value="Backend office export pipeline" readOnly />
        </PdfField>
        <PdfField label="Compatibility Note">
          <input className="tool-input" value="Best results depend on backend LibreOffice support" readOnly />
        </PdfField>
      </>
    )
  }

  if (activeOperationId === 'pdf-to-pdfa') {
    return (
      <>
        <PdfField label="Archival Standard">
          <input className="tool-input" value="PDF/A-1 compatible archival output" readOnly />
        </PdfField>
        <PdfField label="Use Case">
          <input className="tool-input" value="Long-term preservation and compliance workflows" readOnly />
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

        <p className="processing-note">Files are uploaded to inspect metadata and generate a checksum.</p>
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
          aria-pressed={selected === item}
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

  return <div className={`status-message status-message--${tone}`} role="status">{message}</div>
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
  if (operationId === 'numbers') return 'Add Page Numbers'
  if (operationId === 'jpg-to-pdf') return 'Convert to PDF'
  if (operationId === 'word-to-pdf') return 'Convert Word File'
  if (operationId === 'powerpoint-to-pdf') return 'Convert Slides'
  if (operationId === 'excel-to-pdf') return 'Convert Spreadsheet'
  if (operationId === 'html-to-pdf') return 'Render PDF'
  if (operationId === 'pdf-to-jpg') return 'Export Images'
  if (operationId === 'pdf-to-word') return 'Convert to Word'
  if (operationId === 'pdf-to-powerpoint') return 'Convert to PowerPoint'
  if (operationId === 'pdf-to-excel') return 'Convert to Excel'
  if (operationId === 'pdf-to-pdfa') return 'Create PDF/A'
  return 'Process Files'
}

function supportsMultipleFiles(operationId) {
  return operationId === 'merge' || operationId === 'jpg-to-pdf'
}

function supportsOrderedQueue(operationId) {
  return operationId === 'merge' || operationId === 'reorder' || operationId === 'jpg-to-pdf'
}

function getPdfAccept(operationId) {
  if (operationId === 'jpg-to-pdf') return '.jpg,.jpeg,image/jpeg'
  if (operationId === 'word-to-pdf') {
    return '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  if (operationId === 'powerpoint-to-pdf') {
    return '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }
  if (operationId === 'excel-to-pdf') {
    return '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }
  if (operationId === 'html-to-pdf') return '.html,.htm,text/html'
  return '.pdf,application/pdf'
}

function getPdfUploadPanel(operationId) {
  const defaults = {
    title: 'Drop your PDF files here',
    hint: 'or click to browse from your computer',
    bullets: ['PDF only', 'Server limits apply', 'Processed securely'],
    action: 'Choose PDF Files',
    entityLabel: 'PDF file',
    entityLabelPlural: 'PDF files',
    selectionEyebrow: 'Selected PDF Files',
    setupHint: 'Adjust the options for this PDF workflow before processing.',
  }

  if (operationId === 'jpg-to-pdf') {
    return {
      ...defaults,
      title: 'Drop your JPG files here',
      bullets: ['JPG only', 'One image per page', 'Processed securely'],
      action: 'Choose JPG Files',
      entityLabel: 'JPG file',
      entityLabelPlural: 'JPG files',
      selectionEyebrow: 'Selected JPG Files',
      setupHint: 'Review the image order before generating a combined PDF.',
    }
  }

  if (operationId === 'word-to-pdf') {
    return {
      ...defaults,
      title: 'Drop your Word document here',
      bullets: ['DOC or DOCX', 'Single document', 'Processed securely'],
      action: 'Choose Word File',
      entityLabel: 'Word document',
      entityLabelPlural: 'Word documents',
      selectionEyebrow: 'Selected Word File',
      setupHint: 'The backend will convert your document into a PDF output.',
    }
  }

  if (operationId === 'powerpoint-to-pdf') {
    return {
      ...defaults,
      title: 'Drop your PowerPoint file here',
      bullets: ['PPT or PPTX', 'Single presentation', 'Processed securely'],
      action: 'Choose PowerPoint File',
      entityLabel: 'PowerPoint file',
      entityLabelPlural: 'PowerPoint files',
      selectionEyebrow: 'Selected PowerPoint File',
      setupHint: 'Your slides will be exported into a PDF document.',
    }
  }

  if (operationId === 'excel-to-pdf') {
    return {
      ...defaults,
      title: 'Drop your Excel sheet here',
      bullets: ['XLS or XLSX', 'Single workbook', 'Processed securely'],
      action: 'Choose Excel File',
      entityLabel: 'Excel file',
      entityLabelPlural: 'Excel files',
      selectionEyebrow: 'Selected Excel File',
      setupHint: 'The backend will export the workbook content as PDF.',
    }
  }

  if (operationId === 'html-to-pdf') {
    return {
      ...defaults,
      title: 'Drop your HTML file here',
      bullets: ['HTML only', 'Print-ready output', 'Processed securely'],
      action: 'Choose HTML File',
      entityLabel: 'HTML file',
      entityLabelPlural: 'HTML files',
      selectionEyebrow: 'Selected HTML File',
      setupHint: 'The HTML document will be rendered into a printable PDF.',
    }
  }

  if (operationId === 'pdf-to-jpg') {
    return {
      ...defaults,
      action: 'Choose PDF File',
      entityLabel: 'PDF file',
      entityLabelPlural: 'PDF files',
      selectionEyebrow: 'Selected PDF File',
      setupHint: 'Choose the export quality before generating JPG pages.',
    }
  }

  if (operationId === 'pdf-to-word') {
    return {
      ...defaults,
      action: 'Choose PDF File',
      selectionEyebrow: 'Selected PDF File',
      setupHint: 'The backend will convert this PDF into an editable Word document.',
    }
  }

  if (operationId === 'pdf-to-powerpoint') {
    return {
      ...defaults,
      action: 'Choose PDF File',
      selectionEyebrow: 'Selected PDF File',
      setupHint: 'The backend will convert this PDF into a PowerPoint presentation.',
    }
  }

  if (operationId === 'pdf-to-excel') {
    return {
      ...defaults,
      action: 'Choose PDF File',
      selectionEyebrow: 'Selected PDF File',
      setupHint: 'The backend will convert this PDF into an Excel workbook.',
    }
  }

  if (operationId === 'pdf-to-pdfa') {
    return {
      ...defaults,
      action: 'Choose PDF File',
      selectionEyebrow: 'Selected PDF File',
      setupHint: 'This workflow creates an archival PDF/A version of your document.',
    }
  }

  return defaults
}

async function downloadPdfBatchResponse(batchResponse, operationId) {
  const outputs = batchResponse?.files || []

  if (!outputs.length) {
    throw new Error('The backend did not return any PDF output files.')
  }

  if (outputs.length === 1) {
    const file = outputs[0]
    downloadFile(base64ToBlob(file.base64Content, file.contentType), file.fileName)
    return
  }

  const zip = new JSZip()
  outputs.forEach((output) => {
    zip.file(output.fileName, base64ToUint8Array(output.base64Content))
  })

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadFile(zipBlob, `${operationId}-results.zip`)
}

function base64ToBlob(base64Content, contentType = 'application/pdf') {
  return new Blob([base64ToUint8Array(base64Content)], { type: contentType })
}

function base64ToUint8Array(base64Content) {
  const binary = atob(base64Content)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
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
