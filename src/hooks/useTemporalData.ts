import { useMemo } from "react";
import { Participant } from "@/context/DataContext";

export const useTemporalData = (data: Participant[]) => {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    // Get all measurements from all participants
    const allMeasurements = data.flatMap(p => 
      p.measurements.map(m => ({
        ...m,
        participantId: p.id,
        participantOutcome: p.outcome,
        participantCondition: p.condition,
        participantUnit: p.unit
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
          validBpSystolicCount: 0,
          validBpDiastolicCount: 0,
          validHeartRateCount: 0,
          validTemperatureCount: 0,
          validOxygenSaturationCount: 0,
          validPainCount: 0,
          avgBpSystolic: 0,
          avgBpDiastolic: 0,
          avgHeartRate: 0,
          avgTemperature: 0,
          avgOxygenSaturation: 0,
          avgPain: 0,
          sumBpSystolic: 0,
          sumBpDiastolic: 0,
          sumHeartRate: 0,
          sumTemperature: 0,
          sumOxygenSaturation: 0,
          sumPain: 0,
          // Add statistics by condition and unit
          conditionStats: {},
          unitStats: {}
        };
      }
      
      const entry = measurementsByMonth[monthKey];
      
      // Only include non-null values in averages
      if (m.bloodPressureSystolic !== null) {
        entry.sumBpSystolic += m.bloodPressureSystolic;
        entry.validBpSystolicCount += 1;
      }
      
      if (m.bloodPressureDiastolic !== null) {
        entry.sumBpDiastolic += m.bloodPressureDiastolic;
        entry.validBpDiastolicCount += 1;
      }
      
      if (m.heartRate !== null) {
        entry.sumHeartRate += m.heartRate;
        entry.validHeartRateCount += 1;
      }
      
      if (m.temperature !== null) {
        entry.sumTemperature += m.temperature;
        entry.validTemperatureCount += 1;
      }
      
      if (m.oxygenSaturation !== null) {
        entry.sumOxygenSaturation += m.oxygenSaturation;
        entry.validOxygenSaturationCount += 1;
      }
      
      if (m.pain !== null) {
        entry.sumPain += m.pain;
        entry.validPainCount += 1;
      }
      
      // Track condition-specific data
      if (m.participantCondition) {
        if (!entry.conditionStats[m.participantCondition]) {
          entry.conditionStats[m.participantCondition] = {
            count: 0,
            sumBpSystolic: 0,
            sumBpDiastolic: 0,
            sumHeartRate: 0,
            sumTemperature: 0,
            sumOxygenSaturation: 0,
            validBpSystolicCount: 0,
            validBpDiastolicCount: 0,
            validHeartRateCount: 0,
            validTemperatureCount: 0,
            validOxygenSaturationCount: 0
          };
        }
        
        const conditionEntry = entry.conditionStats[m.participantCondition];
        conditionEntry.count += 1;
        
        if (m.bloodPressureSystolic !== null) {
          conditionEntry.sumBpSystolic += m.bloodPressureSystolic;
          conditionEntry.validBpSystolicCount += 1;
        }
        
        if (m.bloodPressureDiastolic !== null) {
          conditionEntry.sumBpDiastolic += m.bloodPressureDiastolic;
          conditionEntry.validBpDiastolicCount += 1;
        }
        
        if (m.heartRate !== null) {
          conditionEntry.sumHeartRate += m.heartRate;
          conditionEntry.validHeartRateCount += 1;
        }
        
        if (m.temperature !== null) {
          conditionEntry.sumTemperature += m.temperature;
          conditionEntry.validTemperatureCount += 1;
        }
        
        if (m.oxygenSaturation !== null) {
          conditionEntry.sumOxygenSaturation += m.oxygenSaturation;
          conditionEntry.validOxygenSaturationCount += 1;
        }
      }
      
      // Track unit-specific data
      if (m.participantUnit) {
        if (!entry.unitStats[m.participantUnit]) {
          entry.unitStats[m.participantUnit] = {
            count: 0,
            sumBpSystolic: 0,
            sumBpDiastolic: 0,
            sumHeartRate: 0,
            sumTemperature: 0,
            sumOxygenSaturation: 0,
            validBpSystolicCount: 0,
            validBpDiastolicCount: 0,
            validHeartRateCount: 0,
            validTemperatureCount: 0,
            validOxygenSaturationCount: 0
          };
        }
        
        const unitEntry = entry.unitStats[m.participantUnit];
        unitEntry.count += 1;
        
        if (m.bloodPressureSystolic !== null) {
          unitEntry.sumBpSystolic += m.bloodPressureSystolic;
          unitEntry.validBpSystolicCount += 1;
        }
        
        if (m.bloodPressureDiastolic !== null) {
          unitEntry.sumBpDiastolic += m.bloodPressureDiastolic;
          unitEntry.validBpDiastolicCount += 1;
        }
        
        if (m.heartRate !== null) {
          unitEntry.sumHeartRate += m.heartRate;
          unitEntry.validHeartRateCount += 1;
        }
        
        if (m.temperature !== null) {
          unitEntry.sumTemperature += m.temperature;
          unitEntry.validTemperatureCount += 1;
        }
        
        if (m.oxygenSaturation !== null) {
          unitEntry.sumOxygenSaturation += m.oxygenSaturation;
          unitEntry.validOxygenSaturationCount += 1;
        }
      }
      
      entry.count += 1;
    });
    
    // Calculate averages
    Object.values(measurementsByMonth).forEach((entry: any) => {
      // Calculate overall averages
      entry.avgBpSystolic = entry.validBpSystolicCount > 0 ? entry.sumBpSystolic / entry.validBpSystolicCount : null;
      entry.avgBpDiastolic = entry.validBpDiastolicCount > 0 ? entry.sumBpDiastolic / entry.validBpDiastolicCount : null;
      entry.avgHeartRate = entry.validHeartRateCount > 0 ? entry.sumHeartRate / entry.validHeartRateCount : null;
      entry.avgTemperature = entry.validTemperatureCount > 0 ? entry.sumTemperature / entry.validTemperatureCount : null;
      entry.avgOxygenSaturation = entry.validOxygenSaturationCount > 0 ? entry.sumOxygenSaturation / entry.validOxygenSaturationCount : null;
      entry.avgPain = entry.validPainCount > 0 ? entry.sumPain / entry.validPainCount : null;
      
      // Calculate condition-specific averages
      Object.keys(entry.conditionStats).forEach(condition => {
        const conditionStat = entry.conditionStats[condition];
        
        conditionStat.avgBpSystolic = conditionStat.validBpSystolicCount > 0 
          ? conditionStat.sumBpSystolic / conditionStat.validBpSystolicCount 
          : null;
          
        conditionStat.avgBpDiastolic = conditionStat.validBpDiastolicCount > 0 
          ? conditionStat.sumBpDiastolic / conditionStat.validBpDiastolicCount 
          : null;
          
        conditionStat.avgHeartRate = conditionStat.validHeartRateCount > 0 
          ? conditionStat.sumHeartRate / conditionStat.validHeartRateCount 
          : null;
          
        conditionStat.avgTemperature = conditionStat.validTemperatureCount > 0 
          ? conditionStat.sumTemperature / conditionStat.validTemperatureCount 
          : null;
          
        conditionStat.avgOxygenSaturation = conditionStat.validOxygenSaturationCount > 0 
          ? conditionStat.sumOxygenSaturation / conditionStat.validOxygenSaturationCount 
          : null;
          
        // Add prefix to condition stats for easier access
        entry[`${condition}_avgBpSystolic`] = conditionStat.avgBpSystolic;
        entry[`${condition}_avgBpDiastolic`] = conditionStat.avgBpDiastolic;
        entry[`${condition}_avgHeartRate`] = conditionStat.avgHeartRate;
        entry[`${condition}_avgTemperature`] = conditionStat.avgTemperature;
        entry[`${condition}_avgOxygenSaturation`] = conditionStat.avgOxygenSaturation;
      });
      
      // Calculate unit-specific averages
      Object.keys(entry.unitStats).forEach(unit => {
        const unitStat = entry.unitStats[unit];
        
        unitStat.avgBpSystolic = unitStat.validBpSystolicCount > 0 
          ? unitStat.sumBpSystolic / unitStat.validBpSystolicCount 
          : null;
          
        unitStat.avgBpDiastolic = unitStat.validBpDiastolicCount > 0 
          ? unitStat.sumBpDiastolic / unitStat.validBpDiastolicCount 
          : null;
          
        unitStat.avgHeartRate = unitStat.validHeartRateCount > 0 
          ? unitStat.sumHeartRate / unitStat.validHeartRateCount 
          : null;
          
        unitStat.avgTemperature = unitStat.validTemperatureCount > 0 
          ? unitStat.sumTemperature / unitStat.validTemperatureCount 
          : null;
          
        unitStat.avgOxygenSaturation = unitStat.validOxygenSaturationCount > 0 
          ? unitStat.sumOxygenSaturation / unitStat.validOxygenSaturationCount 
          : null;
          
        // Add prefix to unit stats for easier access
        entry[`${unit}_avgBpSystolic`] = unitStat.avgBpSystolic;
        entry[`${unit}_avgBpDiastolic`] = unitStat.avgBpDiastolic;
        entry[`${unit}_avgHeartRate`] = unitStat.avgHeartRate;
        entry[`${unit}_avgTemperature`] = unitStat.avgTemperature;
        entry[`${unit}_avgOxygenSaturation`] = unitStat.avgOxygenSaturation;
      });
      
      // Remove sum fields and count fields to clean up the object
      delete entry.sumBpSystolic;
      delete entry.sumBpDiastolic;
      delete entry.sumHeartRate;
      delete entry.sumTemperature;
      delete entry.sumOxygenSaturation;
      delete entry.sumPain;
      delete entry.validBpSystolicCount;
      delete entry.validBpDiastolicCount;
      delete entry.validHeartRateCount;
      delete entry.validTemperatureCount;
      delete entry.validOxygenSaturationCount;
      delete entry.validPainCount;
      // Keep conditionStats and unitStats for potential use
    });
    
    return Object.values(measurementsByMonth).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }, [data]);
};
