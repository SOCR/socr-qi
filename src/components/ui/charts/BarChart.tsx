
import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import ChartContainer from "./ChartContainer";

// Define a palette of colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d53e4f', '#66c2a5'];

// BarChart Component
interface BarChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  layout?: "vertical" | "horizontal";
  title?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  index,
  categories,
  colors = COLORS,
  valueFormatter = (value) => String(value),
  layout = "horizontal",
  title,
  height
}) => {
  return (
    <ChartContainer title={title} height={height}>
      <RechartsBarChart 
        data={data} 
        layout={layout}
        margin={{ top: 10, right: 30, left: 30, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {layout === "horizontal" ? (
          <>
            <XAxis dataKey={index} />
            <YAxis tickFormatter={valueFormatter} />
          </>
        ) : (
          <>
            <XAxis type="number" tickFormatter={valueFormatter} />
            <YAxis type="category" dataKey={index} />
          </>
        )}
        <Tooltip formatter={valueFormatter} />
        <Legend />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[i % colors.length]}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
};

export default BarChart;
