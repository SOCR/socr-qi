
/**
 * Custom dependency processing for data simulation
 */

import { Participant } from "@/context/DataContext";
import { DependencyRelation } from "./types";
import { getRandomNumber } from "./utils";

// Apply custom dependency relations to calculate derived variables
export const applyCustomDependencies = (
  participant: Participant, 
  dependencies: DependencyRelation[]
): Participant => {
  if (!dependencies || dependencies.length === 0) {
    return participant;
  }

  const updatedParticipant = { ...participant };
  
  dependencies.forEach(dependency => {
    if (!dependency.targetVariable || dependency.dependsOn.length === 0) {
      return;
    }
    
    // Calculate the weighted sum of predictors
    let value = 0;
    
    for (let i = 0; i < dependency.dependsOn.length; i++) {
      const predictor = dependency.dependsOn[i];
      if (!predictor) continue;
      
      const coefficient = dependency.coefficients[i] || 1.0;
      
      // Get the predictor value from the participant
      let predictorValue;
      
      // Handle nested properties (e.g., deepPhenotype.qualityOfLifeScore)
      if (predictor.includes('.')) {
        const [obj, prop] = predictor.split('.');
        predictorValue = participant[obj]?.[prop];
      } else {
        predictorValue = participant[predictor];
      }
      
      // Skip if the predictor value doesn't exist
      if (predictorValue === undefined) continue;
      
      // If predictor is an array or object, skip (we can only use numeric values)
      if (typeof predictorValue !== 'number') continue;
      
      // Add weighted value to the sum
      value += coefficient * predictorValue;
    }
    
    // Add noise based on the specified level
    if (dependency.noiseLevel > 0) {
      const noise = getRandomNumber(
        -dependency.noiseLevel * Math.abs(value), 
        dependency.noiseLevel * Math.abs(value)
      );
      value += noise;
    }
    
    // Assign the calculated value to the target variable
    if (dependency.targetVariable.includes('.')) {
      const [obj, prop] = dependency.targetVariable.split('.');
      if (!updatedParticipant[obj]) {
        updatedParticipant[obj] = {};
      }
      updatedParticipant[obj][prop] = value;
    } else {
      updatedParticipant[dependency.targetVariable] = value;
    }
  });
  
  return updatedParticipant;
};
