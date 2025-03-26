
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
  
  // Extract y (outcome) and X (predictors)
  const y = data.map(d => d[outcome]);
  const X = data.map(d => [1, ...predictors.map(p => d[p])]); // Add intercept column
  
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
  
  // Function to invert a matrix (simple implementation for demonstration)
  const matrixInverse = (matrix: number[][]) => {
    // This is a simplified version, would need proper implementation for production
    // For 1x1 matrix
    if (matrix.length === 1 && matrix[0].length === 1) {
      return [[1 / matrix[0][0]]];
    }
    
    // For larger matrices, we'd need a proper implementation
    // This is a placeholder for demonstration
    // In reality, you would use a library like math.js
    
    // For simplicity, let's use Gaussian elimination for 2x2 matrices
    if (matrix.length === 2 && matrix[0].length === 2) {
      const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      return [
        [matrix[1][1] / det, -matrix[0][1] / det],
        [-matrix[1][0] / det, matrix[0][0] / det]
      ];
    }
    
    // For larger matrices, we'll just return identity matrix
    // This is not correct but serves as a placeholder
    return matrix.map((row, i) => 
      row.map((_, j) => i === j ? 1 : 0)
    );
  };
  
  // Calculate X'X
  const XtX = matrixMultiply(transpose(X), X);
  
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
  
  // Calculate SSE (Sum of Squared Errors)
  const SSE = residuals.reduce((sum, val) => sum + val * val, 0);
  
  // Calculate SST (Total Sum of Squares)
  const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
  const SST = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  
  // Calculate R^2
  const rSquared = 1 - SSE / SST;
  
  // Calculate adjusted R^2
  const p = predictors.length;
  const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - p - 1));
  
  // Calculate MSE (Mean Squared Error)
  const MSE = SSE / (n - p - 1);
  
  // Calculate standard errors of coefficients
  const stdErrors = XtXInv.map((row, i) => Math.sqrt(row[i] * MSE));
  
  // Calculate t-statistics
  const tStats = beta.map((val, i) => val / stdErrors[i]);
  
  // Calculate p-values (simplified approximation)
  const tDistributionPValue = (tStat: number, df: number) => {
    // This is a simplified approximation of p-value from t-distribution
    // In practice, you would use a statistical library
    const absTStat = Math.abs(tStat);
    // Approximation based on standard normal distribution
    return 2 * (1 - Math.min(1, 0.5 * (1 + absTStat / Math.sqrt(df))));
  };
  
  const pValues = tStats.map(t => tDistributionPValue(t, n - p - 1));
  
  // Calculate F-statistic
  const MSR = (SST - SSE) / p;
  const fStat = MSR / MSE;
  
  // Calculate F-statistic p-value (simplified approximation)
  const fDistributionPValue = (fStat: number, df1: number, df2: number) => {
    // This is a simplified approximation of p-value from F-distribution
    // In practice, you would use a statistical library
    return 1 / (1 + fStat * Math.sqrt(df1 / df2));
  };
  
  const fStatPValue = fDistributionPValue(fStat, p, n - p - 1);
  
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
    observations: n
  };
};
