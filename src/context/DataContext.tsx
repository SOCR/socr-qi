
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { simulateData } from "@/lib/dataSimulation";

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
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
    pain: number;
  }[];
  treatments: {
    name: string;
    startDate: string;
    endDate: string | null;
    effectiveness: number;
  }[];
  [key: string]: any;
}

interface SimulationOptions {
  numParticipants: number;
  startDate: Date;
  endDate: Date;
  includeComorbidities: boolean;
  includeMissingData: boolean;
}

interface DataContextType {
  data: Participant[];
  setData: React.Dispatch<React.SetStateAction<Participant[]>>;
  isDataLoaded: boolean;
  setIsDataLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  generateSimulatedData: (options: SimulationOptions) => void;
  clearData: () => void;
  importData: (data: Participant[]) => void;
  simulationOptions: SimulationOptions;
  setSimulationOptions: React.Dispatch<React.SetStateAction<SimulationOptions>>;
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
  
  const [simulationOptions, setSimulationOptions] = useState<SimulationOptions>(() => {
    const storedOptions = localStorage.getItem(OPTIONS_STORAGE_KEY);
    if (storedOptions) {
      const parsedOptions = JSON.parse(storedOptions);
      // Convert string dates back to Date objects
      return {
        ...parsedOptions,
        startDate: new Date(parsedOptions.startDate),
        endDate: new Date(parsedOptions.endDate)
      };
    }
    return {
      numParticipants: 50,
      startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      endDate: new Date(),
      includeComorbidities: true,
      includeMissingData: false
    };
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

  const generateSimulatedData = (options: SimulationOptions) => {
    try {
      console.log("Generating simulated data with options:", options);
      
      // Ensure the dates are proper Date objects
      const startDate = options.startDate instanceof Date ? options.startDate : new Date(options.startDate);
      const endDate = options.endDate instanceof Date ? options.endDate : new Date(options.endDate);
      
      const simulatedData = simulateData(
        options.numParticipants,
        startDate,
        endDate,
        options.includeComorbidities,
        options.includeMissingData
      );
      
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
