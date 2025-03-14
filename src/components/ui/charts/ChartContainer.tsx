
import React from "react";
import { ResponsiveContainer } from "recharts";

interface ChartContainerProps {
  children: React.ReactElement;
  title?: string;
  height?: number;
}

// Common container for all charts that ensures proper layout and footer positioning
const ChartContainer: React.FC<ChartContainerProps> = ({ 
  children, 
  title,
  height = 300 
}) => {
  return (
    <div className="flex flex-col">
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
      <div className="w-full" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartContainer;
