
import React from "react";
import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import ChartContainer from "./ChartContainer";

// Define a palette of colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d53e4f', '#66c2a5'];

// LineChart Component
interface LineChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  title?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  index,
  categories,
  colors = COLORS,
  valueFormatter = (value) => String(value),
  title,
  height
}) => {
  return (
    <ChartContainer title={title} height={height}>
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} />
        <Tooltip formatter={valueFormatter} />
        <Legend />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
};

export default LineChart;
