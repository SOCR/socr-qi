
import { useMemo } from "react";
import { Participant } from "@/context/DataContext";

export const useTemporalData = (data: Participant[]) => {
  return useMemo(() => {
    // Get all measurements from all participants
    const allMeasurements = data.flatMap(p => 
      p.measurements.map(m => ({
        ...m,
        participantId: p.id,
        participantOutcome: p.outcome
      }))
    );

    // Sort by date
    allMeasurements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by month
    const measurementsByMonth: Record<string, any> = {};
    
    allMeasurements.forEach(m => {
      const date = new Date(m.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!measurementsByMonth[monthKey]) {
        measurementsByMonth[monthKey] = {
          month: monthKey,
          count: 0,
          avgBpSystolic: 0,
          avgBpDiastolic: 0,
          avgHeartRate: 0,
          avgTemperature: 0,
          avgOxygenSaturation: 0,
          sumBpSystolic: 0,
          sumBpDiastolic: 0,
          sumHeartRate: 0,
          sumTemperature: 0,
          sumOxygenSaturation: 0,
        };
      }
      
      const entry = measurementsByMonth[monthKey];
      
      // Only include non-null values in averages
      if (m.bloodPressureSystolic !== null) {
        entry.sumBpSystolic += m.bloodPressureSystolic;
      }
      
      if (m.bloodPressureDiastolic !== null) {
        entry.sumBpDiastolic += m.bloodPressureDiastolic;
      }
      
      if (m.heartRate !== null) {
        entry.sumHeartRate += m.heartRate;
      }
      
      if (m.temperature !== null) {
        entry.sumTemperature += m.temperature;
      }
      
      if (m.oxygenSaturation !== null) {
        entry.sumOxygenSaturation += m.oxygenSaturation;
      }
      
      entry.count += 1;
    });
    
    // Calculate averages
    Object.values(measurementsByMonth).forEach((entry: any) => {
      if (entry.count > 0) {
        entry.avgBpSystolic = entry.sumBpSystolic / entry.count;
        entry.avgBpDiastolic = entry.sumBpDiastolic / entry.count;
        entry.avgHeartRate = entry.sumHeartRate / entry.count;
        entry.avgTemperature = entry.sumTemperature / entry.count;
        entry.avgOxygenSaturation = entry.sumOxygenSaturation / entry.count;
      }
      
      // Delete sum fields
      delete entry.sumBpSystolic;
      delete entry.sumBpDiastolic;
      delete entry.sumHeartRate;
      delete entry.sumTemperature;
      delete entry.sumOxygenSaturation;
    });
    
    return Object.values(measurementsByMonth);
  }, [data]);
};
