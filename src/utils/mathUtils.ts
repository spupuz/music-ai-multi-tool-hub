
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
  // ⚡ Bolt: Consolidated reduce passes into standard for loops, avoiding redundant iterations when calculating standard deviation.
  // We avoid the naive E[X^2] - E[X]^2 formula to prevent catastrophic cancellation and preserve accuracy with custom means.
  let actualMean = mean;
  if (actualMean === undefined) {
    let sum = 0;
    for (let i = 0; i < N; i++) {
      sum += values[i];
    }
    actualMean = sum / N;
  }

  let sumOfSquaredDifferences = 0;
  for (let i = 0; i < N; i++) {
    const diff = values[i] - actualMean;
    sumOfSquaredDifferences += diff * diff;
  }
  
  const variance = sumOfSquaredDifferences / N;
  
  return Math.sqrt(variance);
}
