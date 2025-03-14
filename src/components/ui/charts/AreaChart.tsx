
import React from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import ChartContainer from "./ChartContainer";

// Define a palette of colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d53e4f', '#66c2a5'];

// AreaChart Component
interface AreaChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  stacked?: boolean;
  valueFormatter?: (value: number) => string;
  title?: string;
  height?: number;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  index,
  categories,
  colors = COLORS,
  stacked = false,
  valueFormatter = (value) => String(value),
  title,
  height
}) => {
  return (
    <ChartContainer title={title} height={height}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} />
        <Tooltip formatter={valueFormatter} />
        <Legend />
        {categories.map((category, i) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            stackId={stacked ? "1" : i.toString()}
            fill={colors[i % colors.length]}
            stroke={colors[i % colors.length]}
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  );
};

export default AreaChart;
