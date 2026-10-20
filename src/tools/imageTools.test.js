import test from 'node:test'
import assert from 'node:assert/strict'
import { imageOperations, initialImageOptions, visibleImageFields } from '../data/imageTools.js'

test('Resize modes only submit relevant fields', () => {
  const tool = imageOperations.find((item) => item.id === 'resize')
  const options = initialImageOptions(tool)
  assert.equal(visibleImageFields(tool, options).some((field) => field.name === 'percent'), false)
  options.mode = 'percent'
  assert.deepEqual(visibleImageFields(tool, options).map((field) => field.name), ['mode', 'percent'])
})

test('Watermark logo and text controls cannot conflict', () => {
  const tool = imageOperations.find((item) => item.id === 'watermark')
  const options = initialImageOptions(tool)
  assert.equal(visibleImageFields(tool, options).some((field) => field.name === 'logoScale'), false)
  options.watermarkType = 'logo'
  const fields = visibleImageFields(tool, options).map((field) => field.name)
  assert.ok(fields.includes('logoScale'))
  assert.equal(fields.includes('text'), false)
  assert.equal(fields.includes('fontSize'), false)
})

test('Animation settings appear only for GIF output', () => {
  const tool = imageOperations.find((item) => item.id === 'convert-from-jpg')
  const options = initialImageOptions(tool)
  assert.deepEqual(visibleImageFields(tool, options).map((field) => field.name), ['format'])
  options.format = 'gif'
  assert.deepEqual(visibleImageFields(tool, options).map((field) => field.name), ['format', 'delay', 'loop'])
})

test('ZIP downloads retain duplicate filenames as distinct valid files', async () => {
  const { createImageZip } = await import('./imageDownloads.js')
  const { default: JSZip } = await import('jszip')
  const archive = await JSZip.loadAsync(await createImageZip([
    { fileName: 'same.png', base64Content: btoa('first-image') },
    { fileName: 'same.png', base64Content: btoa('second-image') },
  ]))
  assert.deepEqual(Object.keys(archive.files), ['1-same.png', '2-same.png'])
  assert.equal(await archive.file('1-same.png').async('string'), 'first-image')
  assert.equal(await archive.file('2-same.png').async('string'), 'second-image')
})
