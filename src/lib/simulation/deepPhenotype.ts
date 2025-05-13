
/**
 * Deep phenotype data generation
 */

import { getRandomElement, getRandomInt, getRandomNumber } from "./utils";

// Reference data for deep phenotyping
export const deepPhenotypingData = {
  // Demographics
  race: ["White", "Black", "Hispanic", "Asian", "Native American", "Pacific Islander", "Other"],
  socioeconomicStatus: ["Low", "Lower-Middle", "Middle", "Upper-Middle", "High"],
  insuranceType: ["Private", "Medicare", "Medicaid", "None", "Other Government", "Mixed"],
  languages: ["English", "Spanish", "Mandarin", "French", "Arabic", "Hindi", "Russian", "Other"],
  educationLevels: ["Less than High School", "High School", "Some College", "Associate's Degree", "Bachelor's Degree", "Graduate Degree"],
  geographicLocations: ["Urban", "Suburban", "Rural", "Remote"],
  
  // Process Measures
  timeToTreatment: { min: 10, max: 1440 }, // Minutes
  medicationReconciliation: ["Complete", "Partial", "Not Performed"],
  adherenceToGuidelines: ["High", "Moderate", "Low"],
  preventiveCareCompliance: ["Complete", "Partial", "Non-compliant"],
  diagnosticUseAppropriateness: ["Appropriate", "Questionable", "Inappropriate"],
  followUpAttendance: ["Complete", "Partial", "Missed"],
  
  // Patient-Reported Outcomes
  qualityOfLifeScores: { min: 1, max: 100 },
  patientSatisfactionScores: { min: 1, max: 10 },
  patientActivationLevels: { min: 1, max: 4 },
  symptomBurden: { min: 0, max: 10 },
  adlScores: { min: 0, max: 100 },
  mentalHealthScores: { min: 0, max: 100 },
  
  // Medication & Treatment
  medicationAdherenceRates: { min: 0, max: 100 },
  adverseDrugEventRisk: { min: 0, max: 100 },
  polypharmacyStatus: ["None", "Low", "Moderate", "High"],
  appropriatePrescribing: ["Appropriate", "Suboptimal", "Inappropriate"],
  treatmentCompletionRates: { min: 0, max: 100 },
  
  // Healthcare Utilization
  edVisitsPerYear: { min: 0, max: 10 },
  hospitalizationsPerYear: { min: 0, max: 5 },
  primaryCareVisitsPerYear: { min: 0, max: 12 },
  specialistReferrals: { min: 0, max: 8 },
  teleHealthUtilization: ["None", "Low", "Moderate", "High"],
  
  // Cost & Resources
  totalCostOfCare: { min: 500, max: 50000 },
  costPerEpisode: { min: 100, max: 20000 },
  resourceUtilization: ["Low", "Average", "High", "Very High"],
  
  // Care Coordination
  coordinationEffectiveness: ["Excellent", "Good", "Fair", "Poor"],
  transitionQuality: ["Smooth", "Adequate", "Problematic", "Failed"],
  informationTransfer: ["Complete", "Partial", "Incomplete", "Missing"],
  timeToFollowUp: { min: 1, max: 90 }, // Days
  
  // Provider Factors
  providerPatientRatio: { min: 1, max: 40 },
  staffSatisfaction: { min: 1, max: 10 },
  teamCommunication: ["Excellent", "Good", "Fair", "Poor"],
  providerContinuity: ["High", "Moderate", "Low"],
  bestPracticeAdoption: ["Leader", "Early Adopter", "Average", "Laggard"],
  
  // System Factors
  hitUtilization: ["Advanced", "Moderate", "Basic", "Minimal"],
  decisionSupportEffectiveness: ["High", "Moderate", "Low", "Not Used"],
  patientAccess: ["Excellent", "Good", "Fair", "Poor"],
  waitTimes: { min: 0, max: 120 }, // Days
  safetyCulture: ["Excellent", "Good", "Fair", "Poor"],
  
  // Longitudinal Measures
  diseaseSpecificTests: {
    hba1c: { min: 4.0, max: 14.0 },
    bloodPressureSystolic: { min: 90, max: 200 },
    bloodPressureDiastolic: { min: 60, max: 120 },
    lipidProfileLDL: { min: 50, max: 250 },
    lipidProfileHDL: { min: 20, max: 90 },
    fev1Percentage: { min: 30, max: 120 },
    depressionPHQ9: { min: 0, max: 27 },
  },
  
  functionalStatus: {
    physicalFunction: { min: 0, max: 100 },
    mobility: { min: 0, max: 100 },
    adlIndependence: { min: 0, max: 100 },
    cognitiveFunction: { min: 0, max: 100 },
    frailtyIndex: { min: 0, max: 1 },
    returnToWork: { min: 0, max: 180 }, // Days
  },
  
  sdohFactors: {
    housingStability: ["Stable", "At Risk", "Unstable", "Homeless"],
    foodSecurity: ["Secure", "At Risk", "Insecure", "Severe Insecurity"],
    employmentStatus: ["Full-time", "Part-time", "Unemployed", "Retired", "Disabled"],
    transportationAccess: ["Good", "Limited", "Poor", "None"],
    socialSupport: ["Strong", "Moderate", "Limited", "None"],
    financialStrain: ["None", "Low", "Moderate", "High"],
  },
  
  riskFactors: {
    smokingStatus: ["Never", "Former", "Current - Light", "Current - Heavy"],
    alcoholUse: ["None", "Social", "Moderate", "Heavy"],
    physicalActivity: ["High", "Moderate", "Low", "Sedentary"],
    nutritionalStatus: ["Excellent", "Good", "Fair", "Poor"],
    sleepQuality: ["Excellent", "Good", "Fair", "Poor"],
    stressLevels: ["Low", "Moderate", "High", "Severe"],
  },
};

// Helper function to generate deep phenotyping data
export const generateDeepPhenotypingData = () => {
  const data: Record<string, any> = {};
  
  // Demographics
  data.race = getRandomElement(deepPhenotypingData.race);
  data.socioeconomicStatus = getRandomElement(deepPhenotypingData.socioeconomicStatus);
  data.insuranceType = getRandomElement(deepPhenotypingData.insuranceType);
  data.primaryLanguage = getRandomElement(deepPhenotypingData.languages);
  data.educationLevel = getRandomElement(deepPhenotypingData.educationLevels);
  data.geographicLocation = getRandomElement(deepPhenotypingData.geographicLocations);
  
  // Process Measures
  data.timeToTreatment = getRandomInt(deepPhenotypingData.timeToTreatment.min, deepPhenotypingData.timeToTreatment.max);
  data.medicationReconciliation = getRandomElement(deepPhenotypingData.medicationReconciliation);
  data.adherenceToGuidelines = getRandomElement(deepPhenotypingData.adherenceToGuidelines);
  data.preventiveCareCompliance = getRandomElement(deepPhenotypingData.preventiveCareCompliance);
  data.diagnosticUseAppropriateness = getRandomElement(deepPhenotypingData.diagnosticUseAppropriateness);
  data.followUpAttendance = getRandomElement(deepPhenotypingData.followUpAttendance);
  
  // Patient-Reported Outcomes
  data.qualityOfLifeScore = getRandomInt(deepPhenotypingData.qualityOfLifeScores.min, deepPhenotypingData.qualityOfLifeScores.max);
  data.patientSatisfactionScore = getRandomInt(deepPhenotypingData.patientSatisfactionScores.min, deepPhenotypingData.patientSatisfactionScores.max);
  data.patientActivationLevel = getRandomInt(deepPhenotypingData.patientActivationLevels.min, deepPhenotypingData.patientActivationLevels.max);
  data.symptomBurden = getRandomInt(deepPhenotypingData.symptomBurden.min, deepPhenotypingData.symptomBurden.max);
  data.adlScore = getRandomInt(deepPhenotypingData.adlScores.min, deepPhenotypingData.adlScores.max);
  data.mentalHealthScore = getRandomInt(deepPhenotypingData.mentalHealthScores.min, deepPhenotypingData.mentalHealthScores.max);
  
  // Medication & Treatment
  data.medicationAdherenceRate = getRandomInt(deepPhenotypingData.medicationAdherenceRates.min, deepPhenotypingData.medicationAdherenceRates.max);
  data.adverseDrugEventRisk = getRandomInt(deepPhenotypingData.adverseDrugEventRisk.min, deepPhenotypingData.adverseDrugEventRisk.max);
  data.polypharmacyStatus = getRandomElement(deepPhenotypingData.polypharmacyStatus);
  data.appropriatePrescribing = getRandomElement(deepPhenotypingData.appropriatePrescribing);
  data.treatmentCompletionRate = getRandomInt(deepPhenotypingData.treatmentCompletionRates.min, deepPhenotypingData.treatmentCompletionRates.max);
  
  // Healthcare Utilization
  data.edVisitsPerYear = getRandomInt(deepPhenotypingData.edVisitsPerYear.min, deepPhenotypingData.edVisitsPerYear.max);
  data.hospitalizationsPerYear = getRandomInt(deepPhenotypingData.hospitalizationsPerYear.min, deepPhenotypingData.hospitalizationsPerYear.max);
  data.primaryCareVisitsPerYear = getRandomInt(deepPhenotypingData.primaryCareVisitsPerYear.min, deepPhenotypingData.primaryCareVisitsPerYear.max);
  data.specialistReferrals = getRandomInt(deepPhenotypingData.specialistReferrals.min, deepPhenotypingData.specialistReferrals.max);
  data.teleHealthUtilization = getRandomElement(deepPhenotypingData.teleHealthUtilization);
  
  // Cost & Resources
  data.totalCostOfCare = getRandomInt(deepPhenotypingData.totalCostOfCare.min, deepPhenotypingData.totalCostOfCare.max);
  data.costPerEpisode = getRandomInt(deepPhenotypingData.costPerEpisode.min, deepPhenotypingData.costPerEpisode.max);
  data.resourceUtilization = getRandomElement(deepPhenotypingData.resourceUtilization);
  
  // Care Coordination
  data.coordinationEffectiveness = getRandomElement(deepPhenotypingData.coordinationEffectiveness);
  data.transitionQuality = getRandomElement(deepPhenotypingData.transitionQuality);
  data.informationTransfer = getRandomElement(deepPhenotypingData.informationTransfer);
  data.timeToFollowUp = getRandomInt(deepPhenotypingData.timeToFollowUp.min, deepPhenotypingData.timeToFollowUp.max);
  
  // Provider Factors
  data.providerPatientRatio = getRandomInt(deepPhenotypingData.providerPatientRatio.min, deepPhenotypingData.providerPatientRatio.max);
  data.staffSatisfaction = getRandomInt(deepPhenotypingData.staffSatisfaction.min, deepPhenotypingData.staffSatisfaction.max);
  data.teamCommunication = getRandomElement(deepPhenotypingData.teamCommunication);
  data.providerContinuity = getRandomElement(deepPhenotypingData.providerContinuity);
  data.bestPracticeAdoption = getRandomElement(deepPhenotypingData.bestPracticeAdoption);
  
  // System Factors
  data.hitUtilization = getRandomElement(deepPhenotypingData.hitUtilization);
  data.decisionSupportEffectiveness = getRandomElement(deepPhenotypingData.decisionSupportEffectiveness);
  data.patientAccess = getRandomElement(deepPhenotypingData.patientAccess);
  data.waitTimes = getRandomInt(deepPhenotypingData.waitTimes.min, deepPhenotypingData.waitTimes.max);
  data.safetyCulture = getRandomElement(deepPhenotypingData.safetyCulture);
  
  // Longitudinal Measures
  data.diseaseSpecificMeasures = {
    hba1c: getRandomNumber(deepPhenotypingData.diseaseSpecificTests.hba1c.min, deepPhenotypingData.diseaseSpecificTests.hba1c.max).toFixed(1),
    lipidProfileLDL: getRandomInt(deepPhenotypingData.diseaseSpecificTests.lipidProfileLDL.min, deepPhenotypingData.diseaseSpecificTests.lipidProfileLDL.max),
    lipidProfileHDL: getRandomInt(deepPhenotypingData.diseaseSpecificTests.lipidProfileHDL.min, deepPhenotypingData.diseaseSpecificTests.lipidProfileHDL.max),
    fev1Percentage: getRandomInt(deepPhenotypingData.diseaseSpecificTests.fev1Percentage.min, deepPhenotypingData.diseaseSpecificTests.fev1Percentage.max),
    depressionPHQ9: getRandomInt(deepPhenotypingData.diseaseSpecificTests.depressionPHQ9.min, deepPhenotypingData.diseaseSpecificTests.depressionPHQ9.max),
  };
  
  data.functionalStatus = {
    physicalFunction: getRandomInt(deepPhenotypingData.functionalStatus.physicalFunction.min, deepPhenotypingData.functionalStatus.physicalFunction.max),
    mobility: getRandomInt(deepPhenotypingData.functionalStatus.mobility.min, deepPhenotypingData.functionalStatus.mobility.max),
    adlIndependence: getRandomInt(deepPhenotypingData.functionalStatus.adlIndependence.min, deepPhenotypingData.functionalStatus.adlIndependence.max),
    cognitiveFunction: getRandomInt(deepPhenotypingData.functionalStatus.cognitiveFunction.min, deepPhenotypingData.functionalStatus.cognitiveFunction.max),
    frailtyIndex: parseFloat(getRandomNumber(deepPhenotypingData.functionalStatus.frailtyIndex.min, deepPhenotypingData.functionalStatus.frailtyIndex.max).toFixed(2)),
    returnToWorkDays: getRandomInt(deepPhenotypingData.functionalStatus.returnToWork.min, deepPhenotypingData.functionalStatus.returnToWork.max),
  };
  
  data.socialDeterminants = {
    housingStability: getRandomElement(deepPhenotypingData.sdohFactors.housingStability),
    foodSecurity: getRandomElement(deepPhenotypingData.sdohFactors.foodSecurity),
    employmentStatus: getRandomElement(deepPhenotypingData.sdohFactors.employmentStatus),
    transportationAccess: getRandomElement(deepPhenotypingData.sdohFactors.transportationAccess),
    socialSupport: getRandomElement(deepPhenotypingData.sdohFactors.socialSupport),
    financialStrain: getRandomElement(deepPhenotypingData.sdohFactors.financialStrain),
  };
  
  data.riskFactors = {
    smokingStatus: getRandomElement(deepPhenotypingData.riskFactors.smokingStatus),
    alcoholUse: getRandomElement(deepPhenotypingData.riskFactors.alcoholUse),
    physicalActivity: getRandomElement(deepPhenotypingData.riskFactors.physicalActivity),
    nutritionalStatus: getRandomElement(deepPhenotypingData.riskFactors.nutritionalStatus),
    sleepQuality: getRandomElement(deepPhenotypingData.riskFactors.sleepQuality),
    stressLevels: getRandomElement(deepPhenotypingData.riskFactors.stressLevels),
  };
  
  return data;
};
