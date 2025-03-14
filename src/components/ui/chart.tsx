
import React from "react";
import {
  Area,
  Bar,
  Line,
  Pie,
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";

// Define a palette of colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d53e4f', '#66c2a5'];

interface ChartContainerProps {
  children: React.ReactNode;
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
