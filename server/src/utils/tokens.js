import { createHash } from 'node:crypto'

export function createTokenHash(token) {
  return createHash('sha256').update(token).digest('hex')
}
