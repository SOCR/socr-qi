
import React, { createContext, useContext, useState, ReactNode } from "react";
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

interface DataContextType {
  data: Participant[];
  setData: React.Dispatch<React.SetStateAction<Participant[]>>;
  isDataLoaded: boolean;
  setIsDataLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  generateSimulatedData: (numParticipants: number) => void;
  clearData: () => void;
  importData: (data: Participant[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Participant[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const generateSimulatedData = (numParticipants: number) => {
    const simulatedData = simulateData(numParticipants);
    setData(simulatedData);
    setIsDataLoaded(true);
  };

  const clearData = () => {
    setData([]);
    setIsDataLoaded(false);
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
