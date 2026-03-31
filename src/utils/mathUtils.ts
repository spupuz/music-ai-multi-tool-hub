
// utils/mathUtils.ts

/**
 * Calculates the population standard deviation of an array of numbers.
 * @param values - An array of numbers.
 * @param mean - The pre-calculated mean of the values. If not provided, it will be calculated.
 * @returns The standard deviation, or null if the array is empty.
 */
export function calculateStandardDeviation(values: number[], mean?: number): number | null {
  if (!values || values.length === 0) {
    return null;
  }

  const N = values.length;
  const actualMean = mean === undefined ? values.reduce((acc, val) => acc + val, 0) / N : mean;
  
  const variance = values.reduce((acc, val) => acc + Math.pow(val - actualMean, 2), 0) / N;
  
  return Math.sqrt(variance);
}
