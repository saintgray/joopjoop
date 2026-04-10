import sharp from "sharp";

/**
 * Compute a 64-bit perceptual hash (dHash) as 16 hex chars.
 * This implementation avoids WASM dependencies so it works in Next dev/Turbopack.
 */
export async function computePHashHex(filePath: string): Promise<string> {
  // dHash: resize to 9x8 grayscale, compare adjacent pixels horizontally -> 64 bits.
  const { data, info } = await sharp(filePath)
    .rotate()
    .resize(9, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.width !== 9 || info.height !== 8) {
    throw new Error(`Unexpected resize result: ${info.width}x${info.height}`);
  }
  if (data.length !== 9 * 8) {
    throw new Error(`Unexpected pixel buffer length: ${data.length}`);
  }

  // Build 64-bit hash without BigInt (tsconfig target ES2017).
  let hi = 0 >>> 0; // bits 63..32
  let lo = 0 >>> 0; // bits 31..0
  let bitIndex = 0;
  for (let y = 0; y < 8; y++) {
    const row = y * 9;
    for (let x = 0; x < 8; x++) {
      const left = data[row + x]!;
      const right = data[row + x + 1]!;
      if (left < right) {
        const pos = 63 - bitIndex;
        if (pos >= 32) {
          hi = (hi | (1 << (pos - 32))) >>> 0;
        } else {
          lo = (lo | (1 << pos)) >>> 0;
        }
      }
      bitIndex += 1;
    }
  }

  const hiHex = hi.toString(16).padStart(8, "0");
  const loHex = lo.toString(16).padStart(8, "0");
  return `${hiHex}${loHex}`;
}

