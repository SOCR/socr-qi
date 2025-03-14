
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
