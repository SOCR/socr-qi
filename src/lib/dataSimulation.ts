
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

export const simulateData = (numParticipants: number): Participant[] => {
  const units = ["Cardiology", "Neurology", "Oncology", "Emergency", "ICU", "General Medicine"];
  const conditions = ["Hypertension", "Diabetes", "Heart Disease", "Stroke", "Cancer", "Respiratory Disease"];
  const outcomes = ["Improved", "Stable", "Deteriorated", "Discharged", "Transferred", "Deceased"];
  const genders = ["Male", "Female", "Other"];
  const treatments = [
    "Medication A", "Medication B", "Medication C", 
    "Physical Therapy", "Occupational Therapy", "Surgery", 
    "Radiation", "Chemotherapy", "Counseling"
  ];

  const participants: Participant[] = [];

  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  for (let i = 0; i < numParticipants; i++) {
    const participantId = `P${(i + 1).toString().padStart(4, '0')}`;
    const age = getRandomInt(18, 90);
    const gender = getRandomElement(genders);
    const unit = getRandomElement(units);
    const condition = getRandomElement(conditions);
    
    // Risk score between 0-100
    const riskScore = getRandomNumber(0, 100);
    
    // Outcome influenced by risk score
    let outcome;
    if (riskScore < 30) {
      outcome = "Improved";
    } else if (riskScore < 60) {
      outcome = "Stable";
    } else if (riskScore < 80) {
      outcome = "Deteriorated";
    } else {
      outcome = getRandomElement(["Transferred", "Deceased"]);
    }
    
    const lengthOfStay = getRandomInt(1, 30);
    const readmissionRisk = getRandomNumber(0, 100);
    
    // Generate 3-10 measurements for each participant
    const numMeasurements = getRandomInt(3, 10);
    const measurements = [];
    
    // Admission date
    const admissionDate = getRandomDate(oneYearAgo, today);
    
    for (let j = 0; j < numMeasurements; j++) {
      // Create dates that progress from admission date
      const measurementDate = new Date(admissionDate);
      measurementDate.setDate(admissionDate.getDate() + j);
      
      // Base values - will vary slightly for each measurement to simulate progression
      const baseBloodPressureSystolic = getRandomInt(100, 160);
      const baseBloodPressureDiastolic = getRandomInt(60, 100);
      const baseHeartRate = getRandomInt(60, 100);
      const baseTemperature = getRandomNumber(36.1, 38.5);
      const baseOxygenSaturation = getRandomInt(88, 100);
      const basePain = getRandomInt(0, 10);
      
      // Add some variation based on day from admission
      const variation = j / numMeasurements;
      
      measurements.push({
        date: formatDate(measurementDate),
        bloodPressureSystolic: Math.round(baseBloodPressureSystolic * (1 - variation * 0.1)),
        bloodPressureDiastolic: Math.round(baseBloodPressureDiastolic * (1 - variation * 0.1)),
        heartRate: Math.round(baseHeartRate * (1 - variation * 0.05)),
        temperature: parseFloat((baseTemperature * (1 - variation * 0.03)).toFixed(1)),
        oxygenSaturation: Math.min(100, Math.round(baseOxygenSaturation * (1 + variation * 0.05))),
        pain: Math.max(0, Math.round(basePain * (1 - variation * 0.2))),
      });
    }
    
    // Generate 1-3 treatments for each participant
    const numTreatments = getRandomInt(1, 3);
    const participantTreatments = [];
    
    for (let k = 0; k < numTreatments; k++) {
      const treatmentName = getRandomElement(treatments);
      const startDate = getRandomDate(admissionDate, new Date(admissionDate.getTime() + 3 * 24 * 60 * 60 * 1000));
      
      // Some treatments are ongoing, some have end dates
      let endDate = null;
      if (Math.random() > 0.3) {
        const endDateObj = getRandomDate(
          new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000),
          new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000)
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
    
    participants.push({
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
    });
  }
  
  return participants;
};
