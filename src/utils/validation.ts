export function validateName(name: string): boolean {
  const trimmed = name.trim();
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,30}[a-zA-Z0-9]$/.test(trimmed) || /^[a-zA-Z0-9]{2,32}$/.test(trimmed);
}

export function validatePublicKey(key: string): boolean {
  return /^(ssh-(rsa|ed25519)|ecdsa-sha2-nistp(?:256|384|521))\s+[A-Za-z0-9+/=]+(?:\s+.+)?$/.test(key.trim());
}
