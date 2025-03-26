
import React from "react";
import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import ChartContainer from "./ChartContainer";

export interface ConfidenceBandCategory {
  upper: string;
  lower: string;
  target: string;
}

interface LineChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showConfidenceBands?: boolean;
  confidenceBandCategories?: ConfidenceBandCategory[];
  height?: number;
  showLegend?: boolean;
  yAxisLabel?: string;
}

export const LineChart = ({
  data,
  index,
  categories,
  colors = ["blue", "green", "red", "orange", "purple", "teal", "yellow", "pink", "indigo", "cyan"],
  valueFormatter = (value: number) => `${value}`,
  showConfidenceBands = false,
  confidenceBandCategories = [],
  height = 300,
  showLegend = true,
  yAxisLabel,
}: LineChartProps) => {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Generate a color for each category
  const getColor = (idx: number) => {
    if (colors && colors[idx]) return colors[idx];
    return `hsl(${(idx * 30) % 360}, 70%, 50%)`;
  };

  return (
    <ChartContainer height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis
          dataKey={index}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: "gray", strokeWidth: 1 }}
          axisLine={{ stroke: "gray", strokeWidth: 1 }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: "gray", strokeWidth: 1 }}
          axisLine={{ stroke: "gray", strokeWidth: 1 }}
          tickFormatter={valueFormatter}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          labelFormatter={(label) => `${label}`}
          contentStyle={{ backgroundColor: "white", borderRadius: "6px" }}
        />
        {showLegend && (
          <Legend
            align="center"
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: 12 }}
          />
        )}

        {/* Render confidence bands if enabled */}
        {showConfidenceBands &&
          confidenceBandCategories.map((category, idx) => {
            // Skip if category is not properly structured
            if (!category || typeof category !== 'object' || !('upper' in category) || !('lower' in category)) {
              return null;
            }
            
            const { upper, lower, target } = category;
            
            return (
              <Line
                key={`band-${idx}-${upper}`}
                type="monotone"
                dataKey={upper}
                stroke="none"
                dot={false}
                activeDot={false}
                fill={getColor(idx)}
                fillOpacity={0.1}
              />
            );
          })}

        {/* Render the actual lines */}
        {categories.map((category, idx) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={getColor(idx)}
            fill={getColor(idx)}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 1 }}
            activeDot={{ r: 6, strokeWidth: 1 }}
            name={category}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
};
