function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function importKey(keyBytes: Uint8Array<ArrayBuffer>, usage: "encrypt") {
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-CBC" }, false, [
    usage,
  ]);
}

async function deriveIV(value: string): Promise<Uint8Array<ArrayBuffer>> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  ) as ArrayBuffer;
  return new Uint8Array(hash, 0, 16);
}

async function encode(plaintext: string, hexKey: string): Promise<string> {
  const iv = await deriveIV(plaintext);
  const key = await importKey(hexToBytes(hexKey), "encrypt");

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    new TextEncoder().encode(plaintext),
  );

  const combined = new Uint8Array(16 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 16);

  return btoa(String.fromCharCode(...combined));
}

export function createQRProvider(
  hexKey: string,
): (value: string) => Promise<string> {
  return (value) => encode(value, hexKey);
}
