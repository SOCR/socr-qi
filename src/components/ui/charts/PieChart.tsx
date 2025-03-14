
import React from "react";
import {
  Pie,
  PieChart as RechartsPieChart,
  Tooltip,
  Legend,
  Cell
} from "recharts";
import ChartContainer from "./ChartContainer";

// Define a palette of colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d53e4f', '#66c2a5'];

// PieChart Component
interface PieChartProps {
  data: any[];
  index: string;
  categoryKey: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  title?: string;
  height?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  index,
  categoryKey,
  colors = COLORS,
  valueFormatter = (value) => String(value),
  title,
  height
}) => {
  return (
    <ChartContainer title={title} height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey={categoryKey}
          nameKey={index}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={valueFormatter} />
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  );
};

export default PieChart;
