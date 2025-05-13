
/**
 * Type definitions for data simulation
 */

// Define simulation configuration types
export interface SimulationConfig {
  numParticipants: number;
  startDate: Date;
  endDate: Date;
  includeComorbidities: boolean;
  includeMissingData: boolean;
  missingDataProbability: number;
  measurementFrequency: 'low' | 'medium' | 'high';
  timePatterns: 'random' | 'realistic';
  dataVariability: 'low' | 'medium' | 'high';
  outcomeDistribution: 'balanced' | 'positive' | 'negative';
  enableDeepPhenotyping: boolean;
  customDependencies?: DependencyRelation[];
}

// Define dependency relation type
export interface DependencyRelation {
  targetVariable: string;
  dependsOn: string[];
  coefficients: number[];
  noiseLevel: number;
}
