
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
        allMeasurements.push({
          date: measurement.date,
          participantId: participant.id,
          systolic: measurement.bloodPressureSystolic,
          diastolic: measurement.bloodPressureDiastolic,
          heartRate: measurement.heartRate,
          oxygenSaturation: measurement.oxygenSaturation,
          temperature: measurement.temperature,
          // Add a suffix to make each participant's data distinguishable in charts
          [`systolic_${participant.id}`]: measurement.bloodPressureSystolic,
          [`diastolic_${participant.id}`]: measurement.bloodPressureDiastolic,
          [`heartRate_${participant.id}`]: measurement.heartRate,
          [`oxygenSaturation_${participant.id}`]: measurement.oxygenSaturation,
          [`temperature_${participant.id}`]: measurement.temperature,
        });
      });
    });

    // Sort by date
    allMeasurements.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return allMeasurements;
  }, [data, selectedParticipantIds]);
};
