
import React from "react";
import {
  ResponsiveContainer,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend
} from "recharts";
import ChartTooltip from "@/components/ChartTooltip";

interface RadarChartProps {
  data: any[];
  dataKey: string;
  categories: string[];
  colors?: string[];
  height?: number;
  valueFormatter?: (value: number) => string;
}

export function RadarChart({
  data,
  dataKey,
  categories,
  colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"],
  height = 300,
  valueFormatter = (value: number) => `${value}`
}: RadarChartProps) {
  return (
    <div className="relative" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} outerRadius="75%">
          <PolarGrid />
          <PolarAngleAxis dataKey={dataKey} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
          
          {categories.map((category, index) => (
            <Radar
              key={category}
              name={category}
              dataKey={category}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.5}
            />
          ))}
          
          <Tooltip content={({ active, payload }) => (
            <ChartTooltip
              active={active}
              payload={payload}
              formatter={valueFormatter}
            />
          )} />
          <Legend />
        </RechartsRadarChart>
      </ResponsiveContainer>
      
      <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500 mt-2">
        © {new Date().getFullYear()} SOCR - Statistics Online Computational Resource
      </div>
    </div>
  );
}
