/**
 * Applies banker rounding (round half to even) with configurable precision.
 */
export function bankersRound(value: number, precision = 2): number {
  const factor = 10 ** precision;
  const scaled = value * factor;
  const floor = Math.floor(scaled);
  const diff = scaled - floor;

  if (diff > 0.5) {
    return (floor + 1) / factor;
  }

  if (diff < 0.5) {
    return floor / factor;
  }

  // diff === 0.5 -> half-way case
  if (floor % 2 === 0) {
    return floor / factor;
  }

  return (floor + 1) / factor;
}

/**
 * Ensures rounding remainders are applied to the last share to match the target amount exactly.
 */
export function distributeRemainder(values: number[], target: number, precision: number): number[] {
  const rounded = values.map((value) => bankersRound(value, precision));
  const delta = +(target - rounded.reduce((sum, value) => sum + value, 0)).toFixed(precision + 1);

  if (Math.abs(delta) > Number.EPSILON) {
    const lastIndex = rounded.length - 1;
    rounded[lastIndex] = +(rounded[lastIndex] + delta).toFixed(precision);
  }

  return rounded;
}
