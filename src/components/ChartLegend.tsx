
import React from "react";

interface ChartLegendProps {
  items: {
    label: string;
    color: string;
  }[];
  filterType: string;
  selectedConditions: string[];
  selectedUnits: string[];
  selectedParticipants: string[];
}

const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  filterType,
  selectedConditions,
  selectedUnits,
  selectedParticipants,
}) => {
  return (
    <div className="mt-2 text-sm">
      {items.map((item, index) => (
        <p key={index} style={{ color: item.color }}>
          ● {item.label}
        </p>
      ))}
      
      {filterType !== 'all' && (
        <p className="mt-1 text-xs text-muted-foreground">
          {filterType === 'condition' && selectedConditions.length > 0 && 
            `Filtered by Conditions: ${selectedConditions.join(', ')}`}
          {filterType === 'unit' && selectedUnits.length > 0 && 
            `Filtered by Units: ${selectedUnits.join(', ')}`}
          {filterType === 'participant' && selectedParticipants.length > 0 && 
            `Filtered by Participants: ${selectedParticipants.length} selected`}
        </p>
      )}
    </div>
  );
};

export default ChartLegend;
