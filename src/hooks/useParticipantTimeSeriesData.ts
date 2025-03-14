
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
    
    // Combine and process all measurements
    const allMeasurements: any[] = [];
    
    selectedParticipants.forEach(participant => {
      participant.measurements.forEach(measurement => {
        // Create a unique date-participant compound key to avoid overwriting
        const dateStr = new Date(measurement.date).toISOString().split('T')[0];
        const entry = {
          date: measurement.date,
          displayDate: dateStr,
          participantId: participant.id,
          participantInfo: `${participant.id} (${participant.condition})`,
          systolic: measurement.bloodPressureSystolic,
          diastolic: measurement.bloodPressureDiastolic,
          heartRate: measurement.heartRate,
          oxygenSaturation: measurement.oxygenSaturation,
          temperature: measurement.temperature,
        };
        
        // Add participant-specific fields for charting
        selectedParticipantIds.forEach(id => {
          if (id === participant.id) {
            entry[`systolic_${id}`] = measurement.bloodPressureSystolic;
            entry[`diastolic_${id}`] = measurement.bloodPressureDiastolic;
            entry[`heartRate_${id}`] = measurement.heartRate;
            entry[`oxygenSaturation_${id}`] = measurement.oxygenSaturation;
            entry[`temperature_${id}`] = measurement.temperature;
          } else {
            // Set null for other participants' data points
            entry[`systolic_${id}`] = null;
            entry[`diastolic_${id}`] = null;
            entry[`heartRate_${id}`] = null;
            entry[`oxygenSaturation_${id}`] = null;
            entry[`temperature_${id}`] = null;
          }
        });
        
        allMeasurements.push(entry);
      });
    });

    // Sort by date
    allMeasurements.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return allMeasurements;
  }, [data, selectedParticipantIds]);
};
