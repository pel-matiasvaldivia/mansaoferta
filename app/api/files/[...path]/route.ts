import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import path from 'path'
import type { ReadableStream as WebReadableStream } from 'stream/web'
import { Readable } from 'stream'

// Serves files stored by the `local` storage driver from ./uploads.
// Not used when STORAGE_DRIVER=s3 (files are served from the bucket URL).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params

  // Prevent path traversal: the resolved path must stay inside ./uploads.
  const root = path.join(process.cwd(), 'uploads')
  const target = path.join(root, ...segments)
  if (!target.startsWith(root + path.sep)) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const info = await stat(target)
    if (!info.isFile()) return new Response('Not found', { status: 404 })

    const stream = Readable.toWeb(createReadStream(target)) as WebReadableStream<Uint8Array>
    return new Response(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType(target),
        'Content-Length': String(info.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}

function contentType(file: string): string {
  const ext = path.extname(file).toLowerCase()
  return (
    {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    }[ext] ?? 'application/octet-stream'
  )
}
