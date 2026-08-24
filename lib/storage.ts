import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// Pluggable file storage. `local` writes under ./uploads and serves via the
// /api/files route; `s3` uploads to any S3-compatible bucket (AWS, R2, MinIO).

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export type UploadResult = { url: string }

export function assertImage(file: File) {
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Formato de imagen no permitido (usa JPG, PNG, WEBP o GIF).')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('La imagen supera el tamaño máximo de 5 MB.')
  }
}

function extFor(file: File): string {
  const fromName = file.name.includes('.') ? file.name.split('.').pop()! : ''
  if (fromName) return fromName.toLowerCase()
  return file.type.split('/')[1] ?? 'bin'
}

export async function uploadImage(file: File, keyPrefix: string): Promise<UploadResult> {
  assertImage(file)
  const key = `${keyPrefix}/${randomUUID()}.${extFor(file)}`
  const bytes = Buffer.from(await file.arrayBuffer())

  if ((process.env.STORAGE_DRIVER ?? 'local') === 's3') {
    return uploadToS3(key, bytes, file.type)
  }
  return uploadToLocal(key, bytes)
}

async function uploadToLocal(key: string, bytes: Buffer): Promise<UploadResult> {
  const full = path.join(process.cwd(), 'uploads', key)
  await mkdir(path.dirname(full), { recursive: true })
  await writeFile(full, bytes)
  return { url: `/api/files/${key}` }
}

async function uploadToS3(key: string, bytes: Buffer, contentType: string): Promise<UploadResult> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
  const client = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  })
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    })
  )
  const base = (process.env.S3_PUBLIC_URL || '').replace(/\/$/, '')
  return { url: `${base}/${key}` }
}
