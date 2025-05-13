
/**
 * Utility functions for data simulation
 */

// Utility function to get random element from array
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Utility function to get random number in range
export const getRandomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Utility function to get random integer in range
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Utility function to generate a random date within a range
export const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Format date to ISO string but truncate time part
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Should this field have missing data?
export const shouldBeMissing = (missingProbability: number): boolean => {
  return Math.random() < missingProbability;
};

// Generate values with time-based patterns
export const generateTimeSeriesValue = (
  baseValue: number,
  dayIndex: number,
  totalDays: number,
  patternType: string,
  variability: number
): number => {
  const timeProgress = dayIndex / totalDays;
  
  switch (patternType) {
    case "improving":
      // Gradually improving trend (decreasing for values like bloodPressure, increasing for values like oxygenSaturation)
      return baseValue * (1 - timeProgress * 0.3 * variability);
    case "deteriorating":
      // Gradually deteriorating trend
      return baseValue * (1 + timeProgress * 0.3 * variability);
    case "fluctuating":
      // Fluctuating pattern with waves
      return baseValue * (1 + Math.sin(timeProgress * 10) * 0.15 * variability);
    case "stable":
      // Stable with minor random variations
      return baseValue * (1 + (Math.random() - 0.5) * 0.1 * variability);
    case "cyclic":
      // Cyclic pattern (e.g., simulating medication effects)
      return baseValue * (1 + Math.sin(timeProgress * 5) * 0.2 * variability);
    default:
      return baseValue;
  }
};
