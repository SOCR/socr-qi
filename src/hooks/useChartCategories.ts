
import { useMemo } from "react";

interface UseChartCategoriesProps {
  metric: string;
  showAggregateAverage: boolean;
  showIndividualCourses: boolean;
  filterType: string;
  selectedConditions: string[];
  selectedUnits: string[];
  selectedParticipants: string[];
  showConfidenceBands: boolean;
}

export const useChartCategories = ({
  metric,
  showAggregateAverage,
  showIndividualCourses,
  filterType,
  selectedConditions,
  selectedUnits,
  selectedParticipants,
  showConfidenceBands,
}: UseChartCategoriesProps) => {
  return useMemo(() => {
    const categories: string[] = [];
    const confidenceBandCategories: string[] = [];
    const legendItems: { label: string; color: string }[] = [];
    
    // Add aggregate average if requested
    if (showAggregateAverage) {
      const avgKey = `avg${metric}`;
      categories.push(avgKey);
      legendItems.push({
        label: `${avgKey}: Average ${metric}`,
        color: "rgb(59, 130, 246)" // blue-500
      });
      
      // Add confidence bands if requested
      if (showConfidenceBands) {
        confidenceBandCategories.push(`${metric}_upper`, `${metric}_lower`);
      }
    }
    
    // Add individual courses if requested
    if (showIndividualCourses) {
      if (filterType === 'condition' && selectedConditions.length > 0) {
        selectedConditions.forEach((condition, index) => {
          const key = `${condition}_avg${metric}`;
          categories.push(key);
          legendItems.push({
            label: `${condition}: ${condition} Average ${metric}`,
            color: `hsl(${(index * 30) % 360}, 70%, 50%)`
          });
        });
      } else if (filterType === 'unit' && selectedUnits.length > 0) {
        selectedUnits.forEach((unit, index) => {
          const key = `${unit}_avg${metric}`;
          categories.push(key);
          legendItems.push({
            label: `${unit}: ${unit} Average ${metric}`,
            color: `hsl(${(index * 30) % 360}, 70%, 50%)`
          });
        });
      } else if (filterType === 'participant' && selectedParticipants.length > 0) {
        // For participants, we would show individual participant data
        selectedParticipants.forEach((participantId, index) => {
          const key = `${participantId}_${metric.toLowerCase()}`;
          categories.push(key);
          legendItems.push({
            label: `Participant ${participantId}`,
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
    showConfidenceBands,
  ]);
};
