
import React from "react";
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { nameToHsl } from "@/lib/utils";

export interface ScatterChartProps {
  data: any[];
  xAxisKey: string;
  yAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipLabel?: string;
  tooltipValueFormatter?: (value: any) => string;
  height?: number;
}

const CustomTooltip = ({ 
  active, 
  payload, 
  label,
  valueFormatter,
  tooltipLabel 
}: TooltipProps<any, any> & { 
  valueFormatter?: (value: any) => string;
  tooltipLabel?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip bg-white p-3 border rounded-md shadow-sm">
        <p className="font-medium mb-1">{tooltipLabel || "Data Point"}</p>
        <div className="text-sm">
          <p>{`ID: ${valueFormatter ? valueFormatter(data.id) : data.id}`}</p>
          <p>{`X: ${data.x}`}</p>
          <p>{`Y: ${data.y}`}</p>
          {data.condition && <p>{`Condition: ${data.condition}`}</p>}
          {data.unit && <p>{`Unit: ${data.unit}`}</p>}
          {data.gender && <p>{`Gender: ${data.gender}`}</p>}
          {data.cluster !== undefined && <p>{`Cluster: ${data.cluster}`}</p>}
          {data.outcomeCategory && <p>{`Outcome: ${data.outcomeCategory}`}</p>}
        </div>
      </div>
    );
  }

  return null;
};

const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  xAxisKey,
  yAxisKey,
  xAxisLabel,
  yAxisLabel,
  tooltipLabel = "Data Point",
  tooltipValueFormatter,
  height = 400
}) => {
  // Group data by condition for coloring
  const dataGroups = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    data.forEach(item => {
      const groupKey = item.cluster !== undefined 
        ? `Cluster ${item.cluster}` 
        : item.condition || item.outcomeCategory || 'default';
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    return Object.entries(groups).map(([name, points], index) => ({
      name,
      points,
      color: item.cluster !== undefined 
        ? `hsl(${(item.cluster * 60) % 360}, 70%, 50%)` 
        : nameToHsl(name, index)
    }));
  }, [data]);

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatterChart
          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={xAxisLabel} 
            label={{ 
              value: xAxisLabel, 
              position: 'bottom', 
              offset: 5,
              style: { textAnchor: 'middle' }
            }} 
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yAxisLabel}
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'left',
              offset: 10,
              style: { textAnchor: 'middle' }
            }} 
          />
          <ZAxis range={[60, 60]} />
          <Tooltip 
            content={
              <CustomTooltip 
                valueFormatter={tooltipValueFormatter} 
                tooltipLabel={tooltipLabel} 
              />
            } 
          />
          <Legend />
          
          {dataGroups.map((group) => (
            <Scatter 
              key={group.name}
              name={group.name} 
              data={group.points} 
              fill={group.color}
              shape="circle"
            />
          ))}
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChart;
