
import { useMemo } from "react";
import { Participant } from "@/context/DataContext";

export const useMissingnessData = (data: Participant[]) => {
  return useMemo(() => {
    const fields = [
      { name: "Blood Pressure", key: "bloodPressureSystolic" },
      { name: "Heart Rate", key: "heartRate" },
      { name: "Temperature", key: "temperature" },
      { name: "Oxygen Saturation", key: "oxygenSaturation" },
      { name: "Pain Level", key: "pain" }
    ];

    const missingCounts = fields.map(field => {
      const totalMeasurements = data.flatMap(p => p.measurements).length;
      const missingCount = data.flatMap(p => p.measurements)
        .filter(m => m[field.key] === null || m[field.key] === undefined).length;
      
      const percentage = totalMeasurements > 0 
        ? (missingCount / totalMeasurements) * 100 
        : 0;
          
      return {
        field: field.name,
        missingPercentage: parseFloat(percentage.toFixed(2))
      };
    });

    return missingCounts;
  }, [data]);
};
