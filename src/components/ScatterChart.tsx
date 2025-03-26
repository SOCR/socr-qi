
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
  ZAxis,
  Line
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface ScatterChartProps {
  data: any[];
  xAxisKey?: string;
  yAxisKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipLabel?: string;
  tooltipValueFormatter?: (value: any) => string;
  height?: number;
  colorBy?: "condition" | "unit" | "outcome" | "cluster";
  // For backward compatibility
  xAxis?: string;
  yAxis?: string;
  colorByCluster?: boolean;
  regressionLine?: { x: number; y: number }[];
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
  colorBy = "condition",
  // Handle backward compatibility
  xAxis,
  yAxis,
  colorByCluster = false,
  regressionLine
}) => {
  // Backward compatibility - map old prop names to new ones
  const effectiveXAxisKey = xAxisKey || (xAxis ? "x" : "x");
  const effectiveYAxisKey = yAxisKey || (yAxis ? "y" : "y");
  const effectiveXAxisLabel = xAxisLabel || xAxis || effectiveXAxisKey;
  const effectiveYAxisLabel = yAxisLabel || yAxis || effectiveYAxisKey;
  const effectiveColorBy = colorByCluster ? "cluster" : colorBy;

  // Group data by the coloring dimension
  const groupedData = data.reduce((acc, item) => {
    const key = item[effectiveColorBy] || "Unknown";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);

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
              dataKey={effectiveXAxisKey} 
              name={effectiveXAxisLabel} 
              label={{ 
                value: effectiveXAxisLabel, 
                position: "bottom",
                style: { textAnchor: "middle" }
              }}
            />
            <YAxis 
              type="number" 
              dataKey={effectiveYAxisKey} 
              name={effectiveYAxisLabel} 
              label={{ 
                value: effectiveYAxisLabel, 
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

            {/* Render regression line if provided */}
            {regressionLine && regressionLine.length >= 2 && (
              <Line
                type="linear"
                dataKey="y"
                data={regressionLine}
                stroke="#ff7300"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
                name="Regression Line"
              />
            )}
          </RechartsScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ScatterChart;
