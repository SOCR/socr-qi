
import React from "react";
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface ScatterChartProps {
  data: any[];
  xAxisKey: string;
  yAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipLabel?: string;
  tooltipValueFormatter?: (value: any) => string;
  height?: number;
  colorBy?: "condition" | "unit" | "outcome";
}

const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  xAxisKey,
  yAxisKey,
  xAxisLabel,
  yAxisLabel,
  tooltipLabel = "Value",
  tooltipValueFormatter = (value) => `${value}`,
  height = 300,
  colorBy = "condition"
}) => {
  // Group data by the coloring dimension
  const groupedData = data.reduce((acc, item) => {
    const key = item[colorBy] || "Unknown";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  // Generate colors for each group
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Card>
      <CardContent className="p-0">
        <ResponsiveContainer width="100%" height={height}>
          <RechartsScatterChart
            margin={{
              top: 20,
              right: 20,
              bottom: 40,
              left: 40,
            }}
          >
            <CartesianGrid />
            <XAxis 
              type="number" 
              dataKey={xAxisKey} 
              name={xAxisLabel || xAxisKey} 
              label={{ 
                value: xAxisLabel || xAxisKey, 
                position: "bottom",
                style: { textAnchor: "middle" }
              }}
            />
            <YAxis 
              type="number" 
              dataKey={yAxisKey} 
              name={yAxisLabel || yAxisKey} 
              label={{ 
                value: yAxisLabel || yAxisKey, 
                angle: -90, 
                position: "left",
                style: { textAnchor: "middle" }
              }}
            />
            <Tooltip 
              formatter={tooltipValueFormatter}
              labelFormatter={(label) => `${tooltipLabel}: ${label}`}
            />
            <Legend />
            
            {Object.entries(groupedData).map(([groupName, points], index) => (
              <Scatter 
                key={groupName}
                name={groupName} 
                data={points as any[]} 
                fill={COLORS[index % COLORS.length]}
                shape="circle"
              />
            ))}
          </RechartsScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ScatterChart;
