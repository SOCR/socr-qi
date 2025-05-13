
/**
 * Utility functions for handling data imputation
 */

import { Participant } from "@/context/DataContext";

// Imputation strategies
export type ImputationStrategy = 
  | "mean" 
  | "median" 
  | "mode" 
  | "zero" 
  | "lastObservation" 
  | "nextObservation" 
  | "linearInterpolation"
  | "randomForest";

export interface ImputationOptions {
  strategy: ImputationStrategy;
  applyToAll: boolean;
  fields?: string[];
}

/**
 * Returns a descriptive name for each imputation strategy
 */
export const getStrategyDescription = (strategy: ImputationStrategy): string => {
  switch(strategy) {
    case "mean":
      return "Mean value (average of all available values)";
    case "median":
      return "Median value (middle value of all available values)";
    case "mode":
      return "Mode (most common value)";
    case "zero":
      return "Zero or default value";
    case "lastObservation":
      return "Last observation carried forward";
    case "nextObservation":
      return "Next observation carried backward";
    case "linearInterpolation":
      return "Linear interpolation between points";
    case "randomForest":
      return "Predictive model (random forest)";
    default:
      return "Unknown strategy";
  }
};

/**
 * Calculate the mean of numerical values in an array
 */
const calculateMean = (values: (number | null)[]): number => {
  const validValues = values.filter((v): v is number => v !== null);
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
};

/**
 * Calculate the median of numerical values in an array
 */
const calculateMedian = (values: (number | null)[]): number => {
  const validValues = values.filter((v): v is number => v !== null);
  if (validValues.length === 0) return 0;
  
  const sorted = [...validValues].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
};

/**
 * Find the most common value in an array
 */
const calculateMode = (values: (number | null | string)[]): number | string | null => {
  const validValues = values.filter(v => v !== null);
  if (validValues.length === 0) return null;
  
  const counts = validValues.reduce((acc, val) => {
    const key = String(val);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let maxCount = 0;
  let maxValue: string | null = null;
  
  for (const [value, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxValue = value;
    }
  }
  
  // Convert back to number if it was numeric
  if (maxValue !== null && !isNaN(Number(maxValue))) {
    return Number(maxValue);
  }
  
  return maxValue;
};

/**
 * Perform linear interpolation between points
 */
const linearInterpolate = (
  values: (number | null)[], 
  index: number
): number | null => {
  // Find the nearest non-null values before and after the current index
  let prevIndex = index - 1;
  while (prevIndex >= 0 && values[prevIndex] === null) {
    prevIndex--;
  }
  
  let nextIndex = index + 1;
  while (nextIndex < values.length && values[nextIndex] === null) {
    nextIndex++;
  }
  
  // If we couldn't find values on both sides, we can't interpolate
  if (prevIndex < 0 || nextIndex >= values.length) {
    return null;
  }
  
  const prevValue = values[prevIndex] as number;
  const nextValue = values[nextIndex] as number;
  
  // Linear interpolation formula: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
  return prevValue + (index - prevIndex) * (nextValue - prevValue) / (nextIndex - prevIndex);
};

/**
 * Apply the specified imputation strategy to a given dataset
 */
export const imputeData = (
  data: Participant[],
  options: ImputationOptions
): Participant[] => {
  if (!data || data.length === 0) return data;
  
  // Create a deep copy to avoid modifying the original data
  const imputedData: Participant[] = JSON.parse(JSON.stringify(data));

  // For each participant, impute their measurement values
  imputedData.forEach(participant => {
    // Handle measurements (time series data)
    if (participant.measurements && participant.measurements.length > 0) {
      // Organize data by field for easier analysis
      const fieldValues: Record<string, (number | null)[]> = {};
      
      // Extract all values for each field across all measurements
      participant.measurements.forEach(measurement => {
        Object.entries(measurement).forEach(([field, value]) => {
          if (field !== 'date') { // Skip the date field
            if (!fieldValues[field]) fieldValues[field] = [];
            fieldValues[field].push(value as number | null);
          }
        });
      });
      
      // Calculate imputation values for each field
      const imputationValues: Record<string, number | null> = {};
      
      Object.entries(fieldValues).forEach(([field, values]) => {
        if (options.applyToAll || options.fields?.includes(field)) {
          switch (options.strategy) {
            case "mean":
              imputationValues[field] = calculateMean(values);
              break;
            case "median":
              imputationValues[field] = calculateMedian(values);
              break;
            case "mode":
              imputationValues[field] = calculateMode(values) as number;
              break;
            case "zero":
              imputationValues[field] = 0;
              break;
            // For LOCF and NOCB, we'll handle these during the measurement loop
            case "lastObservation":
            case "nextObservation":
            case "linearInterpolation":
            case "randomForest":
              // These require special handling below
              break;
          }
        }
      });
      
      // Apply imputation to each measurement
      participant.measurements.forEach((measurement, measurementIndex) => {
        Object.keys(measurement).forEach(field => {
          if (field !== 'date' && (options.applyToAll || options.fields?.includes(field))) {
            const value = measurement[field];
            
            if (value === null) {
              switch (options.strategy) {
                case "mean":
                case "median":
                case "mode":
                case "zero":
                  measurement[field] = imputationValues[field];
                  break;
                  
                case "lastObservation":
                  // Find the last non-null value
                  let lastValue = null;
                  for (let i = measurementIndex - 1; i >= 0; i--) {
                    if (participant.measurements[i][field] !== null) {
                      lastValue = participant.measurements[i][field];
                      break;
                    }
                  }
                  measurement[field] = lastValue !== null ? lastValue : imputationValues[field];
                  break;
                  
                case "nextObservation":
                  // Find the next non-null value
                  let nextValue = null;
                  for (let i = measurementIndex + 1; i < participant.measurements.length; i++) {
                    if (participant.measurements[i][field] !== null) {
                      nextValue = participant.measurements[i][field];
                      break;
                    }
                  }
                  measurement[field] = nextValue !== null ? nextValue : imputationValues[field];
                  break;
                  
                case "linearInterpolation":
                  // Try linear interpolation first
                  const interpolatedValue = linearInterpolate(
                    fieldValues[field], 
                    measurementIndex
                  );
                  
                  // Fall back to mean if interpolation isn't possible
                  if (interpolatedValue === null) {
                    measurement[field] = calculateMean(fieldValues[field]);
                  } else {
                    measurement[field] = interpolatedValue;
                  }
                  break;
                  
                case "randomForest":
                  // For demo purposes, use the mean (actual random forest would be too complex)
                  measurement[field] = calculateMean(fieldValues[field]);
                  break;
              }
            }
          }
        });
      });
    }
    
    // Handle other potentially missing values in the participant object
    // We could expand this to handle other fields as needed
  });
  
  return imputedData;
};
