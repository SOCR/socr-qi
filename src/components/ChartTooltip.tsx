
import React from "react";

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  formatter?: (value: any) => string;
}

export const CustomTooltip: React.FC<ChartTooltipProps> = ({ 
  active, 
  payload,
}) => {
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

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ 
  active, 
  payload, 
  formatter = (value) => String(value)
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-md">
        <p className="font-medium text-sm mb-1">{payload[0].payload.date}</p>
        {payload.map((entry, index) => {
          // Extract participant ID from dataKey if it's in format "metric_participantId"
          let label = entry.dataKey;
          let participantId = "";
          
          if (entry.dataKey.includes("_")) {
            const parts = entry.dataKey.split("_");
            label = parts[0];
            participantId = parts.slice(1).join("_");
          }
          
          return (
            <div 
              key={`item-${index}`}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">
                {label} {participantId && `(${participantId})`}: 
              </span>
              <span className="font-medium">
                {entry.value !== null && entry.value !== undefined 
                  ? formatter(entry.value)
                  : "N/A"
                }
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};
