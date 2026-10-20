const number = (name, label, value, min, max, step = 1) => ({ name, label, value, min, max, step, type: 'number' })
const select = (name, label, value, choices) => ({ name, label, value, choices, type: 'select' })
const text = (name, label, value = '') => ({ name, label, value, type: 'text' })
const color = (name, label, value = '#ffffff') => ({ name, label, value, type: 'color' })
const quality = number('quality', 'JPEG quality (%)', 80, 1, 100)
const position = select('position', 'Position', 'bottom-right', [['top-left', 'Top left'], ['top-right', 'Top right'], ['center', 'Center'], ['bottom-left', 'Bottom left'], ['bottom-right', 'Bottom right'], ['tile', 'Repeat across image']])
const region = [number('x', 'Left (px)', 0, 0, 11999), number('y', 'Top (px)', 0, 0, 11999), number('width', 'Width (px)', 200, 1, 12000), number('height', 'Height (px)', 200, 1, 12000)]

export const imageOperations = [
  { id: 'compress', label: 'Compress image', icon: '↓', group: 'Optimize', description: 'Reduce JPEG quality or re-encode other formats as PNG. Keeps the original if it is smaller.', action: 'Compress images', fields: [quality] },
  { id: 'resize', label: 'Resize image', icon: '↗', group: 'Modify', description: 'Resize by pixels or percentage, with optional aspect-ratio preservation.', action: 'Resize images', fields: [select('mode', 'Resize by', 'pixels', [['pixels', 'Pixels'], ['percent', 'Percentage']]), number('width', 'Maximum width (px)', 800, 1, 12000), number('height', 'Maximum height (px)', 600, 1, 12000), select('keepAspect', 'Keep aspect ratio', 'true', [['true', 'Yes — fit within dimensions'], ['false', 'No — use exact dimensions']]), number('percent', 'Scale (%)', 50, 1, 400)] },
  { id: 'crop', label: 'Crop image', icon: '⌗', group: 'Modify', description: 'Drag a rectangle on the preview or enter exact crop coordinates.', action: 'Crop images', fields: region },
  { id: 'convert-to-jpg', label: 'Convert to JPG', icon: 'JPG', group: 'Convert', description: 'Convert PNG, static GIF, BMP, or single-page TIFF to JPG. Choose a background for transparency.', action: 'Convert to JPG', fields: [quality, color('background', 'Transparency background')] },
  { id: 'convert-from-jpg', label: 'Convert from JPG', icon: 'PNG', group: 'Convert', description: 'Turn JPG into PNG or GIF. Multiple equal-sized JPGs become an animated GIF in queue order.', action: 'Convert images', accept: '.jpg,.jpeg,image/jpeg', fields: [select('format', 'Output format', 'png', [['png', 'PNG'], ['gif', 'GIF (animate multiple JPGs)']]), number('delay', 'Time per frame (ms)', 500, 20, 10000, 10), select('loop', 'Loop animation', 'true', [['true', 'Continuously'], ['false', 'Play once']])] },
  { id: 'photo-editor', label: 'Photo editor', icon: '◐', group: 'Create', description: 'Adjust brightness and contrast, apply a filter, add text, or draw an inside frame.', action: 'Apply edits', fields: [number('brightness', 'Brightness', 0, -100, 100), number('contrast', 'Contrast (%)', 100, 0, 200), select('filter', 'Filter', 'none', [['none', 'None'], ['grayscale', 'Grayscale'], ['sepia', 'Sepia'], ['invert', 'Invert']]), number('border', 'Inside frame width (px)', 0, 0, 100), text('text', 'Text overlay (optional)'), color('color', 'Text / frame color'), number('fontSize', 'Font size (px)', 32, 8, 300), position, number('opacity', 'Text opacity (%)', 100, 1, 100)] },
  { id: 'upscale', label: 'Upscale image', icon: '2×', group: 'Optimize', description: 'Enlarge by 2× or 4× with bicubic interpolation. This does not reconstruct detail with AI.', action: 'Upscale images', fields: [select('scale', 'Scale factor', '2', [['2', '2×'], ['4', '4×']])] },
  { id: 'remove-background', label: 'Remove background', icon: '◩', group: 'Optimize', description: 'Remove an edge-connected solid color and export transparent PNG. Best for plain backgrounds; no AI segmentation.', action: 'Remove background', fields: [color('background', 'Background color to remove'), number('tolerance', 'Color tolerance', 30, 0, 255)] },
  { id: 'watermark', label: 'Watermark image', icon: '©', group: 'Create', description: 'Add text or an uploaded logo with position, opacity, and repeat controls.', action: 'Watermark images', fields: [select('watermarkType', 'Watermark type', 'text', [['text', 'Text'], ['logo', 'Logo image']]), text('text', 'Watermark text'), number('fontSize', 'Font size (px)', 32, 8, 300), color('color', 'Text color'), number('logoScale', 'Logo width (% of image)', 20, 1, 100), position, number('opacity', 'Opacity (%)', 60, 1, 100)] },
  { id: 'meme', label: 'Meme generator', icon: 'Aa', group: 'Create', description: 'Add top and bottom captions with white lettering and a dark outline.', action: 'Create memes', fields: [text('topText', 'Top caption'), text('bottomText', 'Bottom caption'), number('fontSize', 'Maximum font size (px)', 40, 8, 300)] },
  { id: 'rotate', label: 'Rotate & flip', icon: '↻', group: 'Modify', description: 'Rotate images by quarter turns and flip them horizontally or vertically.', action: 'Rotate images', fields: [select('angle', 'Clockwise rotation', '90', [['0', '0°'], ['90', '90°'], ['180', '180°'], ['270', '270°']]), select('flip', 'Flip before rotation', 'none', [['none', 'None'], ['horizontal', 'Horizontal'], ['vertical', 'Vertical']])] },
  { id: 'html-to-image', label: 'HTML to image', icon: '</>', group: 'Convert', description: 'Render an uploaded static HTML/CSS file to PNG or JPG. Scripts and external resources are not loaded.', action: 'Render HTML', accept: '.html,.htm,text/html', fields: [number('width', 'Page width (px)', 1200, 64, 3000), number('height', 'Page height (px)', 800, 64, 3000), select('format', 'Output format', 'png', [['png', 'PNG'], ['jpg', 'JPG']])] },
  { id: 'blur', label: 'Blur / redact region', icon: '▦', group: 'Privacy', description: 'Drag over a face or private detail to pixelate it, or enter the region in pixels. Selection is manual.', action: 'Redact images', fields: [...region, number('strength', 'Pixelation block size (px)', 16, 4, 100)] },
]

export function initialImageOptions(operation) {
  return Object.fromEntries(operation.fields.map((field) => [field.name, String(field.value)]))
}

export function visibleImageFields(operation, options) {
  return operation.fields.filter(({ name }) => {
    if (operation.id === 'resize') return options.mode === 'percent' ? !['width', 'height', 'keepAspect'].includes(name) : name !== 'percent'
    if (operation.id === 'convert-from-jpg' && options.format !== 'gif') return !['delay', 'loop'].includes(name)
    if (operation.id === 'watermark') return options.watermarkType === 'logo' ? !['text', 'fontSize', 'color'].includes(name) : name !== 'logoScale'
    return true
  })
}
