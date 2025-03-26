
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
  TooltipProps
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
  customTooltip?: React.ComponentType<TooltipProps<any, any>>;
  customTooltipParams?: Record<string, any>;
  showConfidenceBands?: boolean;
  confidenceBandCategories?: {
    main: string;
    upper: string;
    lower: string;
  }[];
  showIndividualSeries?: boolean;
  individualSeriesPattern?: string;
  individualSeriesCategories?: string[];
  strokeDasharray?: string;
  regressionLine?: {
    x: string;
    y: string;
    slope: number;
    intercept: number;
  };
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  index,
  categories,
  colors = COLORS,
  valueFormatter = (value) => String(value),
  title,
  height,
  customTooltip,
  customTooltipParams = {},
  showConfidenceBands = false,
  confidenceBandCategories = [],
  showIndividualSeries = false,
  individualSeriesPattern = "",
  individualSeriesCategories = [],
  strokeDasharray = "3 3",
  regressionLine
}) => {
  // Extract individual series if a pattern is provided and no specific categories are provided
  const individualSeries: string[] = individualSeriesCategories.length > 0 
    ? individualSeriesCategories 
    : [];
  
  if (showIndividualSeries && individualSeriesPattern && individualSeriesCategories.length === 0) {
    // Find all keys in data that match the pattern
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        if (key.includes(individualSeriesPattern) && !categories.includes(key)) {
          individualSeries.push(key);
        }
      });
    }
  }

  // Add regression line points if provided
  let processedData = [...data];
  if (regressionLine) {
    const { x, y, slope, intercept } = regressionLine;
    
    // Sort data by x value for a clean line
    processedData = [...data].sort((a, b) => a[x] - b[x]);
    
    // Calculate predicted values
    processedData = processedData.map(point => ({
      ...point,
      [`${y}_predicted`]: slope * point[x] + intercept
    }));
  }

  return (
    <ChartContainer title={title} height={height}>
      <RechartsLineChart data={processedData} margin={{ top: 10, right: 30, left: 30, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} />
        
        {/* Use custom tooltip if provided, otherwise use default */}
        {customTooltip ? (
          <Tooltip content={(props) => {
            const CustomTooltipComponent = customTooltip;
            return <CustomTooltipComponent {...props} formatter={valueFormatter} {...customTooltipParams} />;
          }} />
        ) : (
          <Tooltip formatter={valueFormatter} />
        )}
        
        <Legend />
        
        {/* Regular line series */}
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            activeDot={{ r: 8 }}
            name={category}
            connectNulls={true}
            strokeWidth={2}
          />
        ))}
        
        {/* Regression line if provided */}
        {regressionLine && (
          <Line
            type="monotone"
            dataKey={`${regressionLine.y}_predicted`}
            stroke="#ff0000"
            strokeWidth={2}
            dot={false}
            activeDot={false}
            name={`${regressionLine.y} (predicted)`}
            connectNulls={true}
            strokeDasharray="5 5"
          />
        )}
        
        {/* Individual series with thinner, lighter lines */}
        {showIndividualSeries && individualSeries.map((series, i) => (
          <Line
            key={series}
            type="monotone"
            dataKey={series}
            stroke={colors[(i + categories.length) % colors.length]}
            strokeOpacity={0.6}
            strokeWidth={1}
            dot={false}
            activeDot={false}
            name={series}
            connectNulls={true}
          />
        ))}
        
        {/* Confidence bands if enabled */}
        {showConfidenceBands && confidenceBandCategories.map((bandSet, i) => (
          <React.Fragment key={`band-${i}`}>
            <Line
              type="monotone"
              dataKey={bandSet.main}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              activeDot={{ r: 8 }}
              connectNulls={true}
              name={bandSet.main}
            />
            <Line
              type="monotone"
              dataKey={bandSet.upper}
              stroke={colors[i % colors.length]}
              strokeWidth={1}
              strokeDasharray={strokeDasharray}
              activeDot={false}
              connectNulls={true}
              name={`${bandSet.main} (Upper)`}
            />
            <Line
              type="monotone"
              dataKey={bandSet.lower}
              stroke={colors[i % colors.length]}
              strokeWidth={1}
              strokeDasharray={strokeDasharray}
              activeDot={false}
              connectNulls={true}
              name={`${bandSet.main} (Lower)`}
            />
          </React.Fragment>
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
};

export default LineChart;
