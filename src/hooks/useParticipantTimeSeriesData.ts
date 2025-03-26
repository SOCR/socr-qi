
import { useMemo } from "react";
import { Participant } from "@/context/DataContext";

interface TimeSeriesOptions {
  selectedParticipantIds: string[];
  compareToConditionMean?: boolean;
  compareToUnitMean?: boolean;
  showConfidenceBands?: boolean;
  confidenceLevel?: number; // 0.95 for 95% confidence
}

export const useParticipantTimeSeriesData = (
  data: Participant[],
  options: TimeSeriesOptions
) => {
  return useMemo(() => {
    const { 
      selectedParticipantIds,
      compareToConditionMean = false,
      compareToUnitMean = false,
      showConfidenceBands = false,
      confidenceLevel = 0.95
    } = options;
    
    if (!selectedParticipantIds.length) return [];

    // Get measurements from the selected participants
    const selectedParticipants = data.filter(p => 
      selectedParticipantIds.includes(p.id)
    );
    
    // Create a map of all dates from all participants to ensure we have data points for every date
    const dateMap = new Map<string, any>();
    
    // First, collect all unique dates across all selected participants
    selectedParticipants.forEach(participant => {
      participant.measurements.forEach(measurement => {
        const dateStr = new Date(measurement.date).toISOString().split('T')[0];
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, {
            date: measurement.date,
            displayDate: dateStr,
          });
        }
      });
    });
    
    // Then, for each participant, fill in their measurements for each date
    selectedParticipants.forEach(participant => {
      const measurementsByDate = new Map<string, any>();
      
      // First, organize measurements by date
      participant.measurements.forEach(measurement => {
        const dateStr = new Date(measurement.date).toISOString().split('T')[0];
        measurementsByDate.set(dateStr, measurement);
      });
      
      // Then, for each date in our map, add this participant's data
      dateMap.forEach((entry, dateStr) => {
        const measurement = measurementsByDate.get(dateStr);
        
        // Add participant-specific fields
        if (measurement) {
          // Add base data fields if they don't exist
          if (!entry.systolic) entry.systolic = null;
          if (!entry.diastolic) entry.diastolic = null;
          if (!entry.heartRate) entry.heartRate = null;
          if (!entry.oxygenSaturation) entry.oxygenSaturation = null;
          if (!entry.temperature) entry.temperature = null;

          // If this is the participant's measurement, use it
          if (participant.id === selectedParticipantIds[0] && selectedParticipantIds.length === 1) {
            entry.systolic = measurement.bloodPressureSystolic;
            entry.diastolic = measurement.bloodPressureDiastolic;
            entry.heartRate = measurement.heartRate;
            entry.oxygenSaturation = measurement.oxygenSaturation;
            entry.temperature = measurement.temperature;
          }
          
          // Add participant-specific fields for charting (for all participants)
          entry[`systolic_${participant.id}`] = measurement.bloodPressureSystolic;
          entry[`diastolic_${participant.id}`] = measurement.bloodPressureDiastolic;
          entry[`heartRate_${participant.id}`] = measurement.heartRate;
          entry[`oxygenSaturation_${participant.id}`] = measurement.oxygenSaturation;
          entry[`temperature_${participant.id}`] = measurement.temperature;
        } else {
          // No measurement for this date, set to null for this participant
          entry[`systolic_${participant.id}`] = null;
          entry[`diastolic_${participant.id}`] = null;
          entry[`heartRate_${participant.id}`] = null;
          entry[`oxygenSaturation_${participant.id}`] = null;
          entry[`temperature_${participant.id}`] = null;
        }
      });
    });
    
    // Add comparison data if requested
    if ((compareToConditionMean || compareToUnitMean) && selectedParticipants.length > 0) {
      // Get reference participant for condition/unit
      const referenceParticipant = selectedParticipants[0];
      
      // Get all participants that match the condition or unit
      let comparisonGroup: Participant[] = [];
      
      if (compareToConditionMean) {
        comparisonGroup = data.filter(p => 
          p.condition === referenceParticipant.condition && 
          !selectedParticipantIds.includes(p.id)
        );
      } else if (compareToUnitMean) {
        comparisonGroup = data.filter(p => 
          p.unit === referenceParticipant.unit && 
          !selectedParticipantIds.includes(p.id)
        );
      }
      
      if (comparisonGroup.length > 0) {
        // For each date, calculate mean values from the comparison group
        dateMap.forEach((entry, dateStr) => {
          // Find all measurements for this date from the comparison group
          const measurementsForDate = comparisonGroup
            .map(p => {
              const measurement = p.measurements.find(m => 
                new Date(m.date).toISOString().split('T')[0] === dateStr
              );
              return measurement || null;
            })
            .filter(m => m !== null) as any[];
            
          if (measurementsForDate.length > 0) {
            // Calculate mean and standard deviation for each metric
            const metrics = [
              { key: 'systolic', source: 'bloodPressureSystolic' },
              { key: 'diastolic', source: 'bloodPressureDiastolic' },
              { key: 'heartRate', source: 'heartRate' },
              { key: 'oxygenSaturation', source: 'oxygenSaturation' },
              { key: 'temperature', source: 'temperature' }
            ];
            
            metrics.forEach(({ key, source }) => {
              const validValues = measurementsForDate
                .map(m => m[source])
                .filter(v => v !== null && v !== undefined) as number[];
                
              if (validValues.length > 0) {
                // Calculate mean
                const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
                entry[`${key}_mean`] = mean;
                
                // Calculate standard deviation
                if (validValues.length > 1 && showConfidenceBands) {
                  const squaredDiffs = validValues.map(value => Math.pow(value - mean, 2));
                  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / (validValues.length - 1);
                  const stdDev = Math.sqrt(variance);
                  
                  // Calculate confidence interval (using t-distribution would be more accurate for small samples)
                  // Here we use a simple approximation
                  const z = 1.96; // For 95% confidence
                  const marginOfError = z * stdDev / Math.sqrt(validValues.length);
                  
                  entry[`${key}_upper`] = mean + marginOfError;
                  entry[`${key}_lower`] = mean - marginOfError;
                }
              } else {
                entry[`${key}_mean`] = null;
                if (showConfidenceBands) {
                  entry[`${key}_upper`] = null;
                  entry[`${key}_lower`] = null;
                }
              }
            });
          }
        });
      }
    }
    
    // Convert the map to an array and sort by date
    const allMeasurements = Array.from(dateMap.values());
    allMeasurements.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return allMeasurements;
  }, [data, options]);
};
