
import { useMemo } from "react";
import { Participant } from "@/context/DataContext";

export const useParticipantTimeSeriesData = (
  data: Participant[],
  selectedParticipantIds: string[]
) => {
  return useMemo(() => {
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
    
    // Convert the map to an array and sort by date
    const allMeasurements = Array.from(dateMap.values());
    allMeasurements.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return allMeasurements;
  }, [data, selectedParticipantIds]);
};
