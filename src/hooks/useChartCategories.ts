
import { useMemo } from "react";

interface ChartCategoriesOptions {
  metric: string;
  showAggregateAverage: boolean;
  showIndividualCourses: boolean;
  filterType: string;
  selectedConditions: string[];
  selectedUnits: string[];
  selectedParticipants: string[];
  showConfidenceBands?: boolean;
}

export const useChartCategories = (options: ChartCategoriesOptions) => {
  const {
    metric,
    showAggregateAverage,
    showIndividualCourses,
    filterType,
    selectedConditions,
    selectedUnits,
    selectedParticipants,
    showConfidenceBands = false
  } = options;

  return useMemo(() => {
    const categories: string[] = [];
    const confidenceBandCategories: string[] = [];
    const legendItems: { label: string; color: string }[] = [];

    // Metric name mapping
    const metricNames: Record<string, { label: string; unit: string; avgPrefix: string }> = {
      'HeartRate': { 
        label: 'Heart Rate',
        unit: 'bpm', 
        avgPrefix: 'avgHeartRate'
      },
      'BpSystolic': { 
        label: 'Systolic Blood Pressure',
        unit: 'mmHg', 
        avgPrefix: 'avgBpSystolic'
      },
      'BpDiastolic': { 
        label: 'Diastolic Blood Pressure',
        unit: 'mmHg', 
        avgPrefix: 'avgBpDiastolic'
      },
      'OxygenSaturation': { 
        label: 'Oxygen Saturation',
        unit: '%', 
        avgPrefix: 'avgOxygenSaturation'
      },
      'Temperature': { 
        label: 'Temperature',
        unit: '°C', 
        avgPrefix: 'avgTemperature'
      },
    };

    const metricInfo = metricNames[metric];
    
    if (!metricInfo) {
      return { categories, confidenceBandCategories, legendItems };
    }

    // Add aggregate average if requested
    if (showAggregateAverage) {
      categories.push(metricInfo.avgPrefix);
      
      legendItems.push({
        label: `${metricInfo.avgPrefix}: Average ${metricInfo.label} (${metricInfo.unit})`,
        color: 'rgb(59, 130, 246)'  // Blue
      });
      
      if (showConfidenceBands) {
        confidenceBandCategories.push({
          upper: `${metricInfo.avgPrefix}_upper`,
          lower: `${metricInfo.avgPrefix}_lower`,
          target: metricInfo.avgPrefix
        } as any);
      }
    }
    
    // Add individual time courses based on filter type
    if (showIndividualCourses) {
      if (filterType === 'condition' && selectedConditions.length > 0) {
        selectedConditions.forEach((condition, index) => {
          const key = `${condition}_${metricInfo.avgPrefix}`;
          categories.push(key);
          
          legendItems.push({
            label: `${condition}: ${condition} Average ${metricInfo.label}`,
            color: `hsl(${(index * 30) % 360}, 70%, 50%)`
          });
          
          if (showConfidenceBands) {
            confidenceBandCategories.push({
              upper: `${condition}_${metricInfo.avgPrefix}_upper`,
              lower: `${condition}_${metricInfo.avgPrefix}_lower`,
              target: key
            } as any);
          }
        });
      } 
      else if (filterType === 'unit' && selectedUnits.length > 0) {
        selectedUnits.forEach((unit, index) => {
          const key = `${unit}_${metricInfo.avgPrefix}`;
          categories.push(key);
          
          legendItems.push({
            label: `${unit}: ${unit} Average ${metricInfo.label}`,
            color: `hsl(${(index * 30) % 360}, 70%, 50%)`
          });
          
          if (showConfidenceBands) {
            confidenceBandCategories.push({
              upper: `${unit}_${metricInfo.avgPrefix}_upper`,
              lower: `${unit}_${metricInfo.avgPrefix}_lower`,
              target: key
            } as any);
          }
        });
      }
      else if (filterType === 'participant' && selectedParticipants.length > 0) {
        selectedParticipants.forEach((participantId, index) => {
          const key = `participant_${participantId}_${metricInfo.avgPrefix}`;
          categories.push(key);
          
          legendItems.push({
            label: `Patient ${participantId}: ${metricInfo.label}`,
            color: `hsl(${(index * 30) % 360}, 70%, 50%)`
          });
        });
      }
    }

    return { categories, confidenceBandCategories, legendItems };
  }, [
    metric,
    showAggregateAverage,
    showIndividualCourses,
    filterType,
    selectedConditions,
    selectedUnits,
    selectedParticipants,
    showConfidenceBands
  ]);
};
