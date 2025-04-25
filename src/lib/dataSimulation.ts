import { Participant } from "@/context/DataContext";

// Utility function to get random element from array
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Utility function to get random number in range
const getRandomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Utility function to get random integer in range
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Utility function to generate a random date within a range
const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Format date to ISO string but truncate time part
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Should this field have missing data?
const shouldBeMissing = (missingProbability: number): boolean => {
  return Math.random() < missingProbability;
};

// Generate values with time-based patterns
const generateTimeSeriesValue = (
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

// Define the interface for custom dependency relations
export interface DependencyRelation {
  targetVariable: string;
  dependsOn: string[];
  coefficients: number[];
  noiseLevel: number;
}

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
  customDependencies?: DependencyRelation[]; // New option for custom variable dependencies
}

// Reference data for deep phenotyping
const deepPhenotypingData = {
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
const generateDeepPhenotypingData = (config: SimulationConfig) => {
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

// Apply custom dependency relations to calculate derived variables
const applyCustomDependencies = (
  participant: Participant, 
  dependencies: DependencyRelation[],
  participantsMap: Map<string, Participant>
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

export const simulateData = (config: SimulationConfig): Participant[] => {
  console.log("simulateData called with:", config);
  
  // Validate input dates
  if (!(config.startDate instanceof Date) || isNaN(config.startDate.getTime())) {
    console.error("Invalid startDate:", config.startDate);
    throw new Error("Invalid start date provided");
  }
  
  if (!(config.endDate instanceof Date) || isNaN(config.endDate.getTime())) {
    console.error("Invalid endDate:", config.endDate);
    throw new Error("Invalid end date provided");
  }
  
  const units = ["Cardiology", "Neurology", "Oncology", "Emergency", "ICU", "General Medicine", "Orthopedics", "Pediatrics"];
  const conditions = [
    "Hypertension", "Diabetes", "Heart Disease", "Stroke", "Cancer", "Respiratory Disease", 
    "Sepsis", "Pneumonia", "Renal Failure", "Liver Disease", "Gastrointestinal Bleeding"
  ];
  const comorbidities = [
    "Obesity", "Smoking", "Alcohol Use", "Drug Use", "Depression", "Anxiety", "Asthma", 
    "COPD", "Kidney Disease", "Hypothyroidism", "Hyperlipidemia", "Dementia", "Osteoporosis"
  ];
  const outcomes = ["Improved", "Stable", "Deteriorated", "Discharged", "Transferred", "Deceased"];
  const outcomesByRisk = {
    low: { // For patients with low risk scores (0-30)
      positive: ["Improved", "Discharged"],
      balanced: ["Improved", "Stable", "Discharged"],
      negative: ["Stable", "Deteriorated"]
    },
    medium: { // For patients with medium risk scores (30-70)
      positive: ["Improved", "Stable", "Discharged"],
      balanced: ["Improved", "Stable", "Deteriorated", "Discharged"],
      negative: ["Stable", "Deteriorated", "Transferred"]
    },
    high: { // For patients with high risk scores (70-100)
      positive: ["Improved", "Stable", "Discharged", "Transferred"],
      balanced: ["Stable", "Deteriorated", "Transferred", "Deceased"],
      negative: ["Deteriorated", "Transferred", "Deceased"]
    }
  };
  const genders = ["Male", "Female", "Other"];
  const treatments = [
    "Medication A", "Medication B", "Medication C", "Medication D", "Medication E",
    "Physical Therapy", "Occupational Therapy", "Surgery", "Radiation", "Chemotherapy", 
    "Counseling", "Respiratory Therapy", "Dialysis", "Blood Transfusion"
  ];
  const timePatterns = ["improving", "deteriorating", "fluctuating", "stable", "cyclic"];

  // Determine measurement frequency
  let measurementCount;
  switch (config.measurementFrequency) {
    case 'low':
      measurementCount = { min: 3, max: 7 };
      break;
    case 'medium':
      measurementCount = { min: 7, max: 14 };
      break;
    case 'high':
      measurementCount = { min: 14, max: 30 };
      break;
    default:
      measurementCount = { min: 5, max: 10 };
  }

  // Determine data variability factor
  let variabilityFactor;
  switch (config.dataVariability) {
    case 'low':
      variabilityFactor = 0.7;
      break;
    case 'medium':
      variabilityFactor = 1.0;
      break;
    case 'high':
      variabilityFactor = 1.5;
      break;
    default:
      variabilityFactor = 1.0;
  }

  const participants: Participant[] = [];
  // Map to store participants by ID for easy lookup when applying dependencies
  const participantsMap = new Map<string, Participant>();

  // First pass: create participants without applying dependencies
  for (let i = 0; i < config.numParticipants; i++) {
    // Generate participant base data
    const participantId = `P${(i + 1).toString().padStart(4, '0')}`;
    const age = getRandomInt(18, 90);
    const gender = getRandomElement(genders);
    const unit = getRandomElement(units);
    const condition = getRandomElement(conditions);
    
    // Risk score between 0-100
    const riskScore = getRandomNumber(0, 100);
    
    // Determine outcome based on risk score and outcome distribution setting
    let outcome;
    let riskBand: 'low' | 'medium' | 'high';
    
    if (riskScore < 30) {
      riskBand = 'low';
    } else if (riskScore < 70) {
      riskBand = 'medium';
    } else {
      riskBand = 'high';
    }
    
    const possibleOutcomes = outcomesByRisk[riskBand][config.outcomeDistribution] || outcomesByRisk[riskBand].balanced;
    outcome = getRandomElement(possibleOutcomes);
    
    const lengthOfStay = getRandomInt(1, 45);
    const readmissionRisk = getRandomNumber(0, 100);
    
    // Generate participant comorbidities if enabled
    const participantComorbidities = config.includeComorbidities 
      ? Array.from({ length: getRandomInt(0, 5) }, () => getRandomElement(comorbidities))
      : [];
    
    // Remove duplicates from comorbidities
    const uniqueComorbidities = [...new Set(participantComorbidities)];
    
    // Determine the number of measurements based on frequency setting
    const numMeasurements = getRandomInt(measurementCount.min, measurementCount.max);
    const measurements = [];
    
    // Admission date
    const admissionDate = getRandomDate(config.startDate, config.endDate);
    
    // Assign consistent time patterns for this participant
    let patientTimePatterns;
    if (config.timePatterns === 'realistic') {
      // For realistic patterns, link the patterns to the outcome
      if (outcome === "Improved" || outcome === "Discharged") {
        patientTimePatterns = {
          bloodPressure: "improving",
          heartRate: "improving",
          temperature: "improving",
          oxygenSaturation: "improving",
          pain: "improving"
        };
      } else if (outcome === "Deteriorated" || outcome === "Deceased") {
        patientTimePatterns = {
          bloodPressure: "deteriorating",
          heartRate: "deteriorating",
          temperature: "deteriorating",
          oxygenSaturation: "deteriorating",
          pain: "deteriorating"
        };
      } else {
        patientTimePatterns = {
          bloodPressure: "stable",
          heartRate: "stable",
          temperature: "stable",
          oxygenSaturation: "stable",
          pain: "stable"
        };
      }
    } else {
      // For random patterns, assign randomly to each vital sign
      patientTimePatterns = {
        bloodPressure: getRandomElement(timePatterns),
        heartRate: getRandomElement(timePatterns),
        temperature: getRandomElement(timePatterns),
        oxygenSaturation: getRandomElement(timePatterns),
        pain: getRandomElement(timePatterns)
      };
    }
    
    // Base values for this patient - will vary over time according to the pattern
    const baseBloodPressureSystolic = getRandomInt(110, 160);
    const baseBloodPressureDiastolic = getRandomInt(60, 100);
    const baseHeartRate = getRandomInt(60, 100);
    const baseTemperature = getRandomNumber(36.1, 38.5);
    const baseOxygenSaturation = getRandomInt(88, 100);
    const basePain = getRandomInt(0, 10);
    
    for (let j = 0; j < numMeasurements; j++) {
      // Create dates that progress from admission date
      const measurementDate = new Date(admissionDate);
      measurementDate.setDate(admissionDate.getDate() + j);
      
      // Generate values according to the assigned pattern
      const bloodPressureSystolic = Math.round(
        generateTimeSeriesValue(baseBloodPressureSystolic, j, numMeasurements, patientTimePatterns.bloodPressure, variabilityFactor)
      );
      
      const bloodPressureDiastolic = Math.round(
        generateTimeSeriesValue(baseBloodPressureDiastolic, j, numMeasurements, patientTimePatterns.bloodPressure, variabilityFactor)
      );
      
      const heartRate = Math.round(
        generateTimeSeriesValue(baseHeartRate, j, numMeasurements, patientTimePatterns.heartRate, variabilityFactor)
      );
      
      const temperature = parseFloat(
        generateTimeSeriesValue(baseTemperature, j, numMeasurements, patientTimePatterns.temperature, variabilityFactor).toFixed(1)
      );
      
      const oxygenSaturation = Math.min(100, Math.round(
        generateTimeSeriesValue(baseOxygenSaturation, j, numMeasurements, patientTimePatterns.oxygenSaturation, variabilityFactor * 0.5)
      ));
      
      const pain = Math.max(0, Math.min(10, Math.round(
        generateTimeSeriesValue(basePain, j, numMeasurements, patientTimePatterns.pain, variabilityFactor)
      )));
      
      // Introduce missing data if enabled
      const hasMissingData = config.includeMissingData;
      const missingProbability = config.missingDataProbability || 0.05;
      
      measurements.push({
        date: formatDate(measurementDate),
        bloodPressureSystolic: hasMissingData && shouldBeMissing(missingProbability) ? null : bloodPressureSystolic,
        bloodPressureDiastolic: hasMissingData && shouldBeMissing(missingProbability) ? null : bloodPressureDiastolic,
        heartRate: hasMissingData && shouldBeMissing(missingProbability) ? null : heartRate,
        temperature: hasMissingData && shouldBeMissing(missingProbability) ? null : temperature,
        oxygenSaturation: hasMissingData && shouldBeMissing(missingProbability) ? null : oxygenSaturation,
        pain: hasMissingData && shouldBeMissing(missingProbability) ? null : pain,
      });
    }
    
    // Generate 1-5 treatments for each participant
    const numTreatments = getRandomInt(1, 5);
    const participantTreatments = [];
    
    for (let k = 0; k < numTreatments; k++) {
      const treatmentName = getRandomElement(treatments);
      const startDate = getRandomDate(admissionDate, new Date(admissionDate.getTime() + 5 * 24 * 60 * 60 * 1000));
      
      // Some treatments are ongoing, some have end dates
      let endDate = null;
      if (Math.random() > 0.3) {
        const endDateObj = getRandomDate(
          new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000),
          new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000)
        );
        endDate = formatDate(endDateObj);
      }
      
      participantTreatments.push({
        name: treatmentName,
        startDate: formatDate(startDate),
        endDate,
        effectiveness: getRandomNumber(0, 100),
      });
    }
    
    const participant: Participant = {
      id: participantId,
      age,
      gender,
      unit,
      condition,
      riskScore,
      outcome,
      lengthOfStay,
      readmissionRisk,
      measurements,
      treatments: participantTreatments,
    };
    
    // Add comorbidities if enabled
    if (config.includeComorbidities) {
      participant.comorbidities = uniqueComorbidities;
    }
    
    // Add deep phenotyping data if enabled
    if (config.enableDeepPhenotyping) {
      participant.deepPhenotype = generateDeepPhenotypingData(config);
    }
    
    participants.push(participant);
    participantsMap.set(participantId, participant);
  }
  
  // Second pass: Apply custom dependencies if specified
  if (config.customDependencies && config.customDependencies.length > 0) {
    console.log("Applying custom dependencies:", config.customDependencies);
    
    // Create a copy of the participants array to modify
    const participantsWithDependencies = participants.map(participant => 
      applyCustomDependencies(participant, config.customDependencies || [], participantsMap)
    );
    
    // Return the modified participants
    return participantsWithDependencies;
  }
  
  // Return original participants if no dependencies were applied
  return participants;
};
