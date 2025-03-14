
import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-sm text-xs">
        <p className="font-medium">{`ID: ${payload[0].payload.id}`}</p>
        <p>{`X: ${payload[0].value.toFixed(2)}`}</p>
        <p>{`Y: ${payload[0].payload.y.toFixed(2)}`}</p>
        {payload[0].payload.outcome && (
          <p>{`Outcome: ${payload[0].payload.outcome}`}</p>
        )}
        {payload[0].payload.cluster !== undefined && (
          <p>{`Cluster: ${payload[0].payload.cluster + 1}`}</p>
        )}
      </div>
    );
  }
  return null;
};
