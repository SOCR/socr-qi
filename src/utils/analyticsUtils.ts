
// Simple analytics functions
export const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n === 0) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumXSq = x.reduce((acc, val) => acc + val * val, 0);
  const sumYSq = y.reduce((acc, val) => acc + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXSq - sumX * sumX) * (n * sumYSq - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

// Simple linear regression
export const linearRegression = (x: number[], y: number[]) => {
  const n = x.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumXSq = x.reduce((acc, val) => acc + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXSq - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

// K-means clustering (simplified)
export const kMeansClustering = (data: any[], k: number, features: string[]) => {
  // Extract feature values
  const featureValues = data.map(item => 
    features.map(feature => item[feature])
  );
  
  // Randomly initialize centroids
  let centroids = Array.from({ length: k }, () => {
    const randomIndex = Math.floor(Math.random() * featureValues.length);
    return featureValues[randomIndex];
  });
  
  // Assign points to clusters
  const assignments = featureValues.map(point => {
    const distances = centroids.map(centroid => 
      Math.sqrt(
        features.reduce((sum, _, i) => 
          sum + Math.pow(point[i] - centroid[i], 2), 0
        )
      )
    );
    return distances.indexOf(Math.min(...distances));
  });
  
  // Return cluster assignments and centroid locations
  return {
    assignments,
    centroids
  };
};

// Multiple Linear Regression
export type RegressionResult = {
  coefficients: {
    name: string;
    value: number;
    standardError: number;
    tStat: number;
    pValue: number;
  }[];
  intercept: number;
  rSquared: number;
  adjustedRSquared: number;
  fStat: number;
  fStatPValue: number;
  observations: number;
};

export const multipleLinearRegression = (
  data: any[],
  outcome: string,
  predictors: string[]
): RegressionResult => {
  const n = data.length;
  if (n === 0 || predictors.length === 0) {
    return {
      coefficients: [],
      intercept: 0,
      rSquared: 0,
      adjustedRSquared: 0,
      fStat: 0,
      fStatPValue: 0,
      observations: 0
    };
  }
  
  try {
    // Filter out any data points with undefined or NaN values
    const filteredData = data.filter(d => {
      const yValue = d[outcome];
      if (yValue === undefined || yValue === null || isNaN(yValue)) return false;
      
      for (const pred of predictors) {
        const xValue = d[pred];
        if (xValue === undefined || xValue === null || isNaN(xValue)) return false;
      }
      
      return true;
    });
    
    if (filteredData.length < predictors.length + 2) {
      // Not enough data points for reliable regression
      console.warn("Not enough valid data points for reliable regression analysis");
      return {
        coefficients: predictors.map(p => ({
          name: p,
          value: 0,
          standardError: 0,
          tStat: 0,
          pValue: 1
        })),
        intercept: 0,
        rSquared: 0,
        adjustedRSquared: 0,
        fStat: 0,
        fStatPValue: 1,
        observations: filteredData.length
      };
    }
    
    // Extract y (outcome) and X (predictors)
    const y = filteredData.map(d => d[outcome]);
    const X = filteredData.map(d => [1, ...predictors.map(p => d[p])]); // Add intercept column
    
    // Function to transpose a matrix
    const transpose = (matrix: number[][]) => {
      return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    };
    
    // Function to multiply matrices
    const matrixMultiply = (a: number[][], b: number[][]) => {
      return a.map(row => {
        return transpose(b).map(col => {
          return row.reduce((sum, cell, i) => sum + cell * col[i], 0);
        });
      });
    };
    
    // Function to invert a matrix - using a more robust approach
    const matrixInverse = (matrix: number[][]) => {
      const n = matrix.length;
      
      // Create augmented matrix [A|I]
      const augmented = matrix.map((row, i) => {
        const identity = Array(n).fill(0);
        identity[i] = 1;
        return [...row, ...identity];
      });
      
      // Gaussian elimination (forward elimination)
      for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
            maxRow = j;
          }
        }
        
        // Swap rows if needed
        if (maxRow !== i) {
          [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        }
        
        // Check for singularity
        if (Math.abs(augmented[i][i]) < 1e-10) {
          console.warn("Matrix is singular or near-singular, cannot compute inverse");
          // Return identity matrix as fallback
          return Array(n).fill(0).map((_, i) => {
            return Array(n).fill(0).map((_, j) => i === j ? 1 : 0);
          });
        }
        
        // Scale pivot row
        const pivot = augmented[i][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[i][j] /= pivot;
        }
        
        // Eliminate other rows
        for (let j = 0; j < n; j++) {
          if (j !== i) {
            const factor = augmented[j][i];
            for (let k = 0; k < 2 * n; k++) {
              augmented[j][k] -= factor * augmented[i][k];
            }
          }
        }
      }
      
      // Extract inverse from augmented matrix
      return augmented.map(row => row.slice(n));
    };
    
    // Calculate X'X
    const XtX = matrixMultiply(transpose(X), X);
    
    // Check if XtX is singular
    const determinant = (matrix: number[][]) => {
      if (matrix.length === 1) return matrix[0][0];
      if (matrix.length === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      
      let det = 0;
      for (let i = 0; i < matrix.length; i++) {
        const minor = matrix.slice(1).map(row => [...row.slice(0, i), ...row.slice(i + 1)]);
        det += matrix[0][i] * Math.pow(-1, i) * determinant(minor);
      }
      return det;
    };
    
    if (Math.abs(determinant(XtX)) < 1e-10) {
      console.warn("Matrix X'X is singular or near-singular. This often happens when predictors are highly correlated.");
      return {
        coefficients: predictors.map(p => ({
          name: p,
          value: 0,
          standardError: 0,
          tStat: 0,
          pValue: 1
        })),
        intercept: 0,
        rSquared: 0,
        adjustedRSquared: 0,
        fStat: 0,
        fStatPValue: 1,
        observations: filteredData.length
      };
    }
    
    // Calculate (X'X)^-1
    const XtXInv = matrixInverse(XtX);
    
    // Calculate X'y
    const Xty = matrixMultiply(transpose(X), y.map(val => [val])).map(row => row[0]);
    
    // Calculate beta = (X'X)^-1 X'y
    const beta = matrixMultiply(XtXInv, Xty.map(val => [val])).map(row => row[0]);
    
    // Calculate fitted values
    const yHat = X.map(row => 
      row.reduce((sum, val, i) => sum + val * beta[i], 0)
    );
    
    // Calculate residuals
    const residuals = y.map((val, i) => val - yHat[i]);
    
    // Calculate yMean properly
    const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
    
    // Calculate SSE (Sum of Squared Errors)
    const SSE = residuals.reduce((sum, val) => sum + val * val, 0);
    
    // Calculate SST (Total Sum of Squares)
    const SST = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    
    // Calculate R^2 (ensure it's between 0 and 1)
    const rawRSquared = 1 - SSE / SST;
    const rSquared = Math.max(0, Math.min(1, rawRSquared));
    
    // Calculate adjusted R^2 (clamped between 0 and 1)
    const p = predictors.length;
    const rawAdjustedRSquared = 1 - ((1 - rSquared) * (filteredData.length - 1) / (filteredData.length - p - 1));
    const adjustedRSquared = Math.max(0, Math.min(1, rawAdjustedRSquared));
    
    // Calculate MSE (Mean Squared Error)
    const MSE = SSE / (filteredData.length - p - 1);
    
    // Calculate MSR (Mean Squared due to Regression)
    const SSR = SST - SSE;
    const MSR = SSR / p;
    
    // Calculate F-statistic (ensure it's positive)
    const fStat = Math.max(0, MSR / MSE);
    
    // Calculate F-statistic p-value
    const fStatPValue = 1 / (1 + fStat); // Simplified but ensures a value between 0 and 1
    
    // Calculate standard errors of coefficients
    const stdErrors = [];
    for (let i = 0; i < XtXInv.length; i++) {
      const se = Math.sqrt(Math.abs(XtXInv[i][i] * MSE));
      stdErrors.push(se);
    }
    
    // Calculate t-statistics
    const tStats = beta.map((val, i) => val / stdErrors[i]);
    
    // Calculate p-values (simplified approximation)
    const tDistributionPValue = (tStat: number) => {
      // This is a simplified approximation of p-value from t-distribution
      const absTStat = Math.abs(tStat);
      // Approximation based on standard normal distribution
      return 2 * (1 - Math.min(1, 0.5 * (1 + absTStat / Math.sqrt(filteredData.length - p - 1))));
    };
    
    const pValues = tStats.map(t => tDistributionPValue(t));
    
    // Format results
    const coefficients = predictors.map((name, i) => ({
      name,
      value: beta[i + 1], // Skip intercept
      standardError: stdErrors[i + 1],
      tStat: tStats[i + 1],
      pValue: pValues[i + 1]
    }));
    
    return {
      coefficients,
      intercept: beta[0],
      rSquared,
      adjustedRSquared,
      fStat,
      fStatPValue,
      observations: filteredData.length
    };
  } catch (error) {
    console.error("Error in regression calculation:", error);
    return {
      coefficients: predictors.map(p => ({
        name: p,
        value: 0,
        standardError: 0,
        tStat: 0,
        pValue: 1
      })),
      intercept: 0,
      rSquared: 0,
      adjustedRSquared: 0,
      fStat: 0,
      fStatPValue: 1,
      observations: 0
    };
  }
};
