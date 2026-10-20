import { useEffect, useRef, useState } from 'react'
import { createImageZip } from '../tools/imageDownloads'
import { imageOperations, initialImageOptions, visibleImageFields } from '../data/imageTools'
import { ToolHeader } from '../components/ToolHeader'
import { SurfaceCard } from '../components/SurfaceCard'
import { processImages } from '../services/devToolApi'
import { APP_ROUTES, toHash } from '../utils/appRouter'
import '../styles/image-tools.css'

const ACCEPT = '.jpg,.jpeg,.png,.gif,.bmp,.tif,.tiff,image/jpeg,image/png,image/gif,image/bmp,image/tiff'
const bytesLabel = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

function download(blob, name) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = name
  document.body.appendChild(anchor); anchor.click(); anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function blobFor(file) {
  const binary = atob(file.base64Content)
  return new Blob([Uint8Array.from(binary, (char) => char.charCodeAt(0))], { type: file.contentType })
}

function RegionPreview({ entry, options, onChange, disabled }) {
  const image = useRef(null)
  const start = useRef(null)
  const [size, setSize] = useState(null)
  const point = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return { x: Math.max(0, Math.min(size.width - 1, Math.floor((event.clientX - bounds.left) / bounds.width * size.width))),
      y: Math.max(0, Math.min(size.height - 1, Math.floor((event.clientY - bounds.top) / bounds.height * size.height))) }
  }
  const move = (event) => {
    if (!start.current || !size || disabled) return
    const end = point(event)
    const x = Math.min(start.current.x, end.x), y = Math.min(start.current.y, end.y)
    onChange({ x: String(x), y: String(y), width: String(Math.abs(end.x - start.current.x) + 1), height: String(Math.abs(end.y - start.current.y) + 1) })
  }
  const rectangle = size ? { left: `${Number(options.x) / size.width * 100}%`, top: `${Number(options.y) / size.height * 100}%`, width: `${Math.max(0, Math.min(Number(options.width), size.width - Number(options.x))) / size.width * 100}%`, height: `${Math.max(0, Math.min(Number(options.height), size.height - Number(options.y))) / size.height * 100}%` } : null
  return <div className="image-region">
    <p>Drag over the image to select a region. Coordinates also work with keyboard input below. The same pixel rectangle applies to every image in the batch.</p>
    <div className="image-region__canvas" onPointerDown={(event) => {
      if (!size || disabled) return
      event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); start.current = point(event); move(event)
    }} onPointerMove={move} onPointerUp={(event) => { move(event); start.current = null }} onPointerCancel={() => { start.current = null }}>
      <img ref={image} src={entry.url} alt={`Region preview: ${entry.file.name}`} draggable={false} onLoad={() => {
        const { naturalWidth: width, naturalHeight: height } = image.current
        setSize({ width, height })
        const x = Math.min(Number(options.x) || 0, width - 1), y = Math.min(Number(options.y) || 0, height - 1)
        onChange({ x: String(x), y: String(y), width: String(Math.min(Number(options.width) || width, width - x)), height: String(Math.min(Number(options.height) || height, height - y)) })
      }} />
      {rectangle && <span className="image-region__selection" style={rectangle} />}
    </div>
    {size && <span className="image-processing-note">Original: {size.width} × {size.height} px</span>}
  </div>
}

export function ImageToolsPage({ operation }) {
  const selected = imageOperations.find((item) => item.id === operation)
  const [filter, setFilter] = useState('All')
  if (selected) return <ImageWorkspace key={operation} operation={selected} />
  return <div className="tool-page image-tools-page">
    <ToolHeader category="Image Tools" title="Image Tools" description="Make your images ready to use. Compress, convert, resize, and edit in one workspace." />
    <div className="image-tool-filters" role="group" aria-label="Filter image tools">{['All', 'Optimize', 'Modify', 'Convert', 'Create', 'Privacy'].map((group) =>
      <button key={group} type="button" aria-pressed={filter === group} className={filter === group ? 'is-active' : ''} onClick={() => setFilter(group)}>{group}</button>)}</div>
    <div className="image-tool-catalog">{imageOperations.filter((tool) => filter === 'All' || tool.group === filter).map((tool) =>
      <a key={tool.id} className="image-tool-card" href={toHash(`${APP_ROUTES.image}/${tool.id}`)}>
        <span className="image-tool-card__icon" aria-hidden="true">{tool.icon}</span><span className="image-tool-card__group">{tool.group}</span>
        <h2>{tool.label}<span aria-hidden="true">↗</span></h2><p>{tool.description}</p>
      </a>)}</div>
    <p className="image-processing-note">Images are uploaded to your configured backend for processing. Supported inputs: JPG, PNG, static GIF, BMP, and single-page TIFF. Each tool lists its specific behavior.</p>
  </div>
}

function ImageWorkspace({ operation }) {
  const [entries, setEntries] = useState([])
  const [options, setOptions] = useState(() => initialImageOptions(operation))
  const [logo, setLogo] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [zipping, setZipping] = useState(false)
  const [dragging, setDragging] = useState(false)
  const resources = useRef(new Set())
  const request = useRef(null)
  const upload = useRef(null)
  useEffect(() => {
    const urls = resources.current
    return () => { request.current?.abort(); urls.forEach((url) => URL.revokeObjectURL(url)); urls.clear() }
  }, [])
  const invalidate = () => { setResult(null); setError('') }
  const updateOptions = (values) => { setOptions((current) => ({ ...current, ...values })); invalidate() }
  const html = operation.id === 'html-to-image'
  const hasRegion = ['crop', 'blur'].includes(operation.id)
  const addFiles = (list) => {
    invalidate()
    const files = Array.from(list)
    if (entries.length + files.length > (html ? 1 : 20)) { setError(html ? 'Choose one HTML file.' : 'Choose up to 20 images.'); return }
    if (files.some((file) => file.size === 0 || file.size > (html ? 500000 : 20 * 1024 * 1024))) { setError(html ? 'Choose a nonempty HTML file up to 500 KB.' : 'Each image must be nonempty and at most 20 MB.'); return }
    if ([...entries.map((entry) => entry.file), ...files].reduce((sum, file) => sum + file.size, 0) > 80 * 1024 * 1024) { setError('Choose at most 80 MB per batch.'); return }
    const added = files.map((file) => {
      const url = html ? '' : URL.createObjectURL(file)
      if (url) resources.current.add(url)
      return { id: crypto.randomUUID(), file, url }
    })
    setEntries((current) => [...current, ...added])
  }
  const remove = (entry) => {
    URL.revokeObjectURL(entry.url); resources.current.delete(entry.url)
    setEntries((current) => current.filter((item) => item.id !== entry.id)); invalidate()
  }
  const move = (index, direction) => {
    setEntries((current) => { const next = [...current]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next }); invalidate()
  }
  const process = async (event) => {
    event.preventDefault(); invalidate()
    if (!entries.length) { setError('Choose files first.'); return }
    if (operation.id === 'watermark' && options.watermarkType === 'logo' && !logo) { setError('Choose a logo image.'); return }
    setProcessing(true)
    const controller = new AbortController(); request.current = controller
    const payloadOptions = Object.fromEntries(visibleImageFields(operation, options).map(({ name }) => [name, options[name]]))
    if (options.watermarkType === 'logo') payloadOptions.text = ''
    try {
      const response = await processImages(operation.id, entries.map((entry) => entry.file), payloadOptions,
        options.watermarkType === 'logo' ? logo : null, controller.signal)
      if (!response?.data?.files?.length) throw new Error('The server returned no image files.')
      setResult(response.data)
    } catch (failure) { if (failure.name !== 'AbortError') setError(failure.message) }
    finally { if (!controller.signal.aborted) setProcessing(false); if (request.current === controller) request.current = null }
  }
  return <div className="tool-page image-tools-page">
    <ToolHeader category="Image Tools" title={operation.label} description={operation.description} />
    <nav className="image-workspace-nav" aria-label="Image workspace"><a href={toHash(APP_ROUTES.image)}>← All image tools</a><label htmlFor="image-switch" className="sr-only">Switch image tool</label>
      <select id="image-switch" className="tool-select" value={operation.id} onChange={(event) => window.location.assign(toHash(`${APP_ROUTES.image}/${event.target.value}`))}>{imageOperations.map((tool) => <option key={tool.id} value={tool.id}>{tool.label}</option>)}</select></nav>
    <form onSubmit={process}>
      <fieldset className="image-workspace-fields" disabled={processing}>
        <div className="image-workspace-grid">
          <SurfaceCard title={html ? 'HTML file' : 'Images'} actions={<span className="image-processing-note">{entries.length} selected</span>}>
            <input ref={upload} id="image-upload" className="sr-only" type="file" accept={operation.accept || ACCEPT} multiple={!html} aria-label={html ? 'Choose HTML file' : 'Choose images'} onChange={(event) => { addFiles(event.target.files); event.target.value = '' }} />
            <div className={`image-dropzone${dragging ? ' is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); if (!processing) setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); if (!processing) addFiles(event.dataTransfer.files) }}>
              <span className="image-dropzone__symbol" aria-hidden="true">↑</span><strong>{html ? 'Drop your HTML file here' : 'Drop your images here'}</strong>
              <span>{html ? 'One .html file · up to 500 KB' : 'JPG, PNG, static GIF, BMP, TIFF · up to 20 MB each'}</span>
              <button type="button" className="tool-action tool-action--primary" onClick={() => upload.current.click()}>{html ? 'Choose HTML file' : 'Choose images'}</button>
            </div>
            <ol className="image-upload-list">{entries.map((entry, index) => <li key={entry.id}>
              {!html && <img src={entry.url} alt="" onError={(event) => { event.currentTarget.style.visibility = 'hidden' }} />}
              <div><strong>{entry.file.name}</strong><span>{bytesLabel(entry.file.size)}</span></div>
              <div className="image-queue-actions">
                <button type="button" aria-label={`Move ${entry.file.name} earlier`} disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
                <button type="button" aria-label={`Move ${entry.file.name} later`} disabled={index === entries.length - 1} onClick={() => move(index, 1)}>↓</button>
                <button type="button" aria-label={`Remove ${entry.file.name}`} onClick={() => remove(entry)}>×</button>
              </div>
            </li>)}</ol>
            {entries.length > 0 && <button type="button" className="tool-action tool-action--compact" onClick={() => { entries.forEach((entry) => URL.revokeObjectURL(entry.url)); resources.current.clear(); setEntries([]); invalidate() }}>Clear files</button>}
            {hasRegion && entries[0]?.url && <RegionPreview key={entries[0].id} entry={entries[0]} options={options} onChange={updateOptions} disabled={processing} />}
          </SurfaceCard>
          <SurfaceCard title="Settings" className="image-settings">
            <div className="image-options">{visibleImageFields(operation, options).map((field) => <label key={field.name} className="image-option" htmlFor={`image-${field.name}`}>
              <span>{field.label}</span>
              {field.type === 'select' ? <select id={`image-${field.name}`} className="tool-select" value={options[field.name]} onChange={(event) => updateOptions({ [field.name]: event.target.value })}>{field.choices.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                : <input id={`image-${field.name}`} type={field.type} className="tool-input" value={options[field.name]} min={field.min} max={field.max} step={field.step} maxLength={field.type === 'text' ? 300 : undefined} required={field.type === 'number'} onChange={(event) => updateOptions({ [field.name]: event.target.value })} />}
            </label>)}</div>
            {options.watermarkType === 'logo' && <label className="image-logo-input">Logo image<input type="file" accept={ACCEPT} onChange={(event) => {
              const file = event.target.files[0]
              if (file && file.size > 20 * 1024 * 1024) { setError('Logo must be at most 20 MB.'); setLogo(null); event.target.value = ''; return }
              setLogo(file || null); invalidate()
            }} /></label>}
            {operation.id === 'compress' && <p className="image-processing-note">JPEG quality applies to JPEG inputs. Other images are re-encoded as PNG. Originals are retained whenever the result would be larger.</p>}
            {!html && <p className="image-processing-note">12 million pixels maximum per image, 40 million input pixels per batch. Edits export PNG, except JPG/GIF conversion and JPEG compression. Animation and multipage inputs are rejected.</p>}
            <div className="image-submit"><button type="submit" className="tool-action tool-action--primary" disabled={!entries.length}>{processing ? 'Processing…' : operation.action}</button></div>
          </SurfaceCard>
        </div>
      </fieldset>
    </form>
    {processing && <p role="status" className="image-processing-status">Processing your files on the backend… <button type="button" className="tool-action tool-action--compact" onClick={() => { request.current?.abort(); setProcessing(false); setError('Request cancelled. The server may finish work already started.') }}>Cancel</button></p>}
    {error && <p className="status-message status-message--error" role="alert">{error}</p>}
    {result && <SurfaceCard title="Processed images" className="image-results" actions={<button type="button" className="tool-action tool-action--compact" disabled={zipping} onClick={async () => {
      setZipping(true); setError('')
      try { download(new Blob([await createImageZip(result.files)], { type: 'application/zip' }), `${operation.id}-images.zip`) }
      catch { setError('Unable to create ZIP. Download the images individually.') }
      finally { setZipping(false) }
    }}>{zipping ? 'Creating ZIP…' : 'Download ZIP'}</button>}>
      <p className="image-processing-note" role="status">{result.files.length} file{result.files.length === 1 ? '' : 's'} ready to download.</p>
      {result.warnings?.map((warning, index) => <p key={index} className="image-processing-note">{warning}</p>)}
      <div className="image-result-grid">{result.files.map((file, index) => <article className="image-result" key={`${index}-${file.fileName}`}>
        <a href={`data:${file.contentType};base64,${file.base64Content}`} download={file.fileName} aria-label={`Download preview of ${file.fileName}`}><img src={`data:${file.contentType};base64,${file.base64Content}`} alt={file.fileName} /></a>
        <h3>{file.fileName}</h3><p>{file.width} × {file.height} px · {bytesLabel(file.size)}</p>
        {operation.id === 'compress' && <p>{file.size < file.originalSize ? `${Math.round((1 - file.size / file.originalSize) * 100)}% smaller` : 'Original retained'}</p>}
        <button type="button" className="tool-action tool-action--compact" onClick={() => download(blobFor(file), file.fileName)}>Download</button>
      </article>)}</div>
    </SurfaceCard>}
    <p className="image-processing-note image-upload-notice">Files are uploaded to the configured DevTools backend. No iLoveIMG account or service is used.</p>
  </div>
}
