import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { simulateData, SimulationConfig } from "@/lib/dataSimulation";

export interface Participant {
  id: string;
  age: number;
  gender: string;
  unit: string;
  condition: string;
  riskScore: number;
  outcome: string;
  lengthOfStay: number;
  readmissionRisk: number;
  measurements: {
    date: string;
    bloodPressureSystolic: number | null;
    bloodPressureDiastolic: number | null;
    heartRate: number | null;
    temperature: number | null;
    oxygenSaturation: number | null;
    pain: number | null;
  }[];
  treatments: {
    name: string;
    startDate: string;
    endDate: string | null;
    effectiveness: number;
  }[];
  comorbidities?: string[];
  deepPhenotype?: Record<string, any>; // Add support for deep phenotyping data
  [key: string]: any;
}

interface DataContextType {
  data: Participant[];
  setData: React.Dispatch<React.SetStateAction<Participant[]>>;
  isDataLoaded: boolean;
  setIsDataLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  generateSimulatedData: (options: SimulationConfig) => void;
  clearData: () => void;
  importData: (data: Participant[]) => void;
  simulationOptions: SimulationConfig;
  setSimulationOptions: React.Dispatch<React.SetStateAction<SimulationConfig>>;
  getParticipantsByCondition: (condition: string) => Participant[];
  getParticipantsByUnit: (unit: string) => Participant[];
  getStatisticalSummary: () => any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Define localStorage key
const STORAGE_KEY = "socr_qi_data";
const OPTIONS_STORAGE_KEY = "socr_qi_simulation_options";

export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with data from localStorage if available
  const [data, setData] = useState<Participant[]>(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  });
  
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData).length > 0 : false;
  });
  
  const defaultOptions: SimulationConfig = {
    numParticipants: 50,
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    endDate: new Date(),
    includeComorbidities: true,
    includeMissingData: false,
    missingDataProbability: 0.05,
    measurementFrequency: 'medium',
    timePatterns: 'realistic',
    dataVariability: 'medium',
    outcomeDistribution: 'balanced',
    enableDeepPhenotyping: false // Default to false for the new option
  };
  
  const [simulationOptions, setSimulationOptions] = useState<SimulationConfig>(() => {
    const storedOptions = localStorage.getItem(OPTIONS_STORAGE_KEY);
    if (storedOptions) {
      const parsedOptions = JSON.parse(storedOptions);
      // Convert string dates back to Date objects
      return {
        ...parsedOptions,
        startDate: new Date(parsedOptions.startDate),
        endDate: new Date(parsedOptions.endDate),
        enableDeepPhenotyping: parsedOptions.enableDeepPhenotyping || false // Handle old stored options
      };
    }
    return defaultOptions;
  });

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  // Persist simulation options to localStorage
  useEffect(() => {
    // Create a copy to avoid modifying the original state
    const optionsToStore = { ...simulationOptions };
    localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(optionsToStore));
  }, [simulationOptions]);

  const generateSimulatedData = (options: SimulationConfig) => {
    try {
      console.log("Generating simulated data with options:", options);
      
      // Ensure the dates are proper Date objects
      const startDate = options.startDate instanceof Date ? options.startDate : new Date(options.startDate);
      const endDate = options.endDate instanceof Date ? options.endDate : new Date(options.endDate);
      
      const simulatedData = simulateData({
        ...options,
        startDate,
        endDate
      });
      
      console.log("Simulated data generated:", simulatedData.length, "participants");
      setData(simulatedData);
      setIsDataLoaded(true);
      setSimulationOptions(options);
    } catch (error) {
      console.error("Error generating simulated data:", error);
      alert(`Error generating data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearData = () => {
    // Show confirmation dialog before clearing data
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      setData([]);
      setIsDataLoaded(false);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const importData = (newData: Participant[]) => {
    setData(newData);
    setIsDataLoaded(true);
  };
  
  // Helper functions for data access patterns
  const getParticipantsByCondition = (condition: string) => {
    return data.filter(p => p.condition === condition);
  };
  
  const getParticipantsByUnit = (unit: string) => {
    return data.filter(p => p.unit === unit);
  };
  
  // Calculate common statistical measures for the dataset
  const getStatisticalSummary = () => {
    if (data.length === 0) return null;
    
    const ages = data.map(p => p.age);
    const riskScores = data.map(p => p.riskScore);
    const lengthsOfStay = data.map(p => p.lengthOfStay);
    
    // Helper function to calculate mean
    const mean = (arr: number[]) => arr.reduce((sum, val) => sum + val, 0) / arr.length;
    
    // Helper function to calculate standard deviation
    const stdDev = (arr: number[], meanVal: number) => {
      const squareDiffs = arr.map(value => Math.pow(value - meanVal, 2));
      const avgSquareDiff = mean(squareDiffs);
      return Math.sqrt(avgSquareDiff);
    };
    
    const ageMean = mean(ages);
    const ageStdDev = stdDev(ages, ageMean);
    
    const riskScoreMean = mean(riskScores);
    const riskScoreStdDev = stdDev(riskScores, riskScoreMean);
    
    const losNean = mean(lengthsOfStay);
    const losStdDev = stdDev(lengthsOfStay, losNean);
    
    return {
      participantCount: data.length,
      age: {
        mean: ageMean,
        stdDev: ageStdDev,
        min: Math.min(...ages),
        max: Math.max(...ages)
      },
      riskScore: {
        mean: riskScoreMean,
        stdDev: riskScoreStdDev,
        min: Math.min(...riskScores),
        max: Math.max(...riskScores)
      },
      lengthOfStay: {
        mean: losNean,
        stdDev: losStdDev,
        min: Math.min(...lengthsOfStay),
        max: Math.max(...lengthsOfStay)
      },
      conditionCounts: data.reduce((acc, p) => {
        acc[p.condition] = (acc[p.condition] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      unitCounts: data.reduce((acc, p) => {
        acc[p.unit] = (acc[p.unit] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      outcomeCounts: data.reduce((acc, p) => {
        acc[p.outcome] = (acc[p.outcome] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  };

  return (
    <DataContext.Provider
      value={{
        data,
        setData,
        isDataLoaded,
        setIsDataLoaded,
        generateSimulatedData,
        clearData,
        importData,
        simulationOptions,
        setSimulationOptions,
        getParticipantsByCondition,
        getParticipantsByUnit,
        getStatisticalSummary
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
