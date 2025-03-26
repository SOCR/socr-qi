
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
}

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

  for (let i = 0; i < config.numParticipants; i++) {
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
    
    participants.push(participant);
  }
  
  return participants;
};
