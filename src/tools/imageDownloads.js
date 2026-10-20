import JSZip from 'jszip'

export async function createImageZip(files) {
  const zip = new JSZip()
  files.forEach((file, index) => zip.file(`${index + 1}-${file.fileName}`, file.base64Content, { base64: true }))
  return zip.generateAsync({ type: 'uint8array' })
}
