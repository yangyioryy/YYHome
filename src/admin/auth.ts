const adminAuth = {
  iterations: 310000,
  salt: '+HKTBLPoD1AQxlD4SfMI7w==',
  hash: 'P3vfEQFzShu/KNQGtcwRvtHGRlSO3LqkFKnqcb3ziAM=',
} as const

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index]
  }

  return difference === 0
}

export async function verifyAdminPassword(password: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: base64ToBytes(adminAuth.salt),
      iterations: adminAuth.iterations,
    },
    key,
    256,
  )

  return constantTimeEqual(new Uint8Array(bits), base64ToBytes(adminAuth.hash))
}
