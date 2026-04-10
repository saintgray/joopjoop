export function hammingDistanceHex64(aHex: string, bHex: string): number {
  if (aHex.length !== 16 || bHex.length !== 16) return Number.POSITIVE_INFINITY;
  let dist = 0;
  for (let i = 0; i < 16; i++) {
    const a = parseInt(aHex[i]!, 16);
    const b = parseInt(bHex[i]!, 16);
    const x = a ^ b;
    dist += BIT_COUNT_0_TO_15[x]!;
  }
  return dist;
}

const BIT_COUNT_0_TO_15 = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4] as const;

