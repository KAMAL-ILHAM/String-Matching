import * as pdfjs from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

export async function extractPdfText(file, onProgress) {
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map((it) => it.str + (it.hasEOL ? '\n' : '')).join(''))
    page.cleanup()
    onProgress?.(i, pdf.numPages)
  }
  await pdf.destroy()
  return pages.join('\n\n')
}
