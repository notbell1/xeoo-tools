/**
 * Reusable Math utilities for XeooTools client-side Math tools
 */

/**
 * Greatest Common Divisor (GCD) using Euclidean Algorithm (BigInt & Number support)
 */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

export function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

/**
 * Least Common Multiple (LCM)
 */
export function lcm(a: number, b: number): number {
  const x = Math.abs(Math.round(a));
  const y = Math.abs(Math.round(b));
  if (x === 0 || y === 0) return 0;
  return (x / gcd(x, y)) * y;
}

export function lcmBigInt(a: bigint, b: bigint): bigint {
  const x = a < 0n ? -a : a;
  const y = b < 0n ? -b : b;
  if (x === 0n || y === 0n) return 0n;
  return (x / gcdBigInt(x, y)) * y;
}

/**
 * Clean floating point display precision (handles 0.1 + 0.2 = 0.30000000000000004)
 */
export function formatFloat(value: number, maxDecimals: number = 8): string {
  if (!Number.isFinite(value)) return String(value);
  if (Object.is(value, -0)) return "0";
  // Round to maxDecimals to eliminate float precision anomalies
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor;
  return rounded.toLocaleString("en-US", {
    maximumFractionDigits: maxDecimals,
    useGrouping: true,
  });
}

/**
 * Simplify a fraction (num/den)
 */
export function simplifyFraction(num: number, den: number): {
  numerator: number;
  denominator: number;
  isNegative: boolean;
  mixedWhole?: number;
  mixedNumerator?: number;
} {
  if (den === 0) {
    throw new Error("Denominator cannot be zero");
  }

  const isNeg = (num < 0 && den > 0) || (num > 0 && den < 0);
  let absNum = Math.abs(Math.round(num));
  let absDen = Math.abs(Math.round(den));

  const divisor = gcd(absNum, absDen);
  absNum = absNum / divisor;
  absDen = absDen / divisor;

  const resNumerator = isNeg ? -absNum : absNum;
  const resDenominator = absDen;

  let mixedWhole: number | undefined;
  let mixedNumerator: number | undefined;

  if (absNum >= absDen && absDen !== 1) {
    mixedWhole = Math.floor(absNum / absDen);
    mixedNumerator = absNum % absDen;
    if (isNeg) {
      mixedWhole = -mixedWhole;
    }
  }

  return {
    numerator: resNumerator,
    denominator: resDenominator,
    isNegative: isNeg,
    mixedWhole,
    mixedNumerator,
  };
}

