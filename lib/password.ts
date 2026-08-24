import { hash, verify } from '@node-rs/argon2'

// Argon2id password hashing with sensible defaults.
const OPTS = { memoryCost: 19456, timeCost: 2, parallelism: 1 }

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTS)
}

export function verifyPassword(digest: string, plain: string): Promise<boolean> {
  return verify(digest, plain, OPTS)
}
