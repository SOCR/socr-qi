
import React from "react";
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
  Line
} from "recharts";

interface ScatterChartProps {
  data: any[];
  xAxis: string;
  yAxis: string;
  regressionLine?: { x: number; y: number }[];
  colorByCluster?: boolean;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const OUTCOME_COLORS = {
  "Improved": "#4CAF50",
  "Stable": "#2196F3",
  "Deteriorated": "#FF9800",
  "Transferred": "#9C27B0",
  "Deceased": "#F44336"
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow-sm text-xs">
        <p className="font-medium">{`ID: ${payload[0].payload.id}`}</p>
        <p>{`X: ${payload[0].value.toFixed(2)}`}</p>
        <p>{`Y: ${payload[0].payload.y.toFixed(2)}`}</p>
        {payload[0].payload.outcome && (
          <p>{`Outcome: ${payload[0].payload.outcome}`}</p>
        )}
        {payload[0].payload.cluster !== undefined && (
          <p>{`Cluster: ${payload[0].payload.cluster + 1}`}</p>
        )}
      </div>
    );
  }
  return null;
};

export const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  xAxis,
  yAxis,
  regressionLine,
  colorByCluster = false,
  height = 300
}) => {
  // Group data by outcome or cluster
  const getGroupedData = () => {
    if (colorByCluster) {
      // Group by cluster
      const clusters: Record<string, any[]> = {};
      data.forEach(item => {
        const clusterKey = `Cluster ${item.cluster + 1}`;
        if (!clusters[clusterKey]) {
          clusters[clusterKey] = [];
        }
        clusters[clusterKey].push(item);
      });
      return Object.entries(clusters).map(([name, points]) => ({
        name,
        data: points
      }));
    } else {
      // Group by outcome
      const outcomes: Record<string, any[]> = {};
      data.forEach(item => {
        if (!outcomes[item.outcome]) {
          outcomes[item.outcome] = [];
        }
        outcomes[item.outcome].push(item);
      });
      return Object.entries(outcomes).map(([name, points]) => ({
        name,
        data: points
      }));
    }
  };

  const groupedData = getGroupedData();

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
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
            dataKey="x" 
            name={xAxis}
            domain={['auto', 'auto']}
          >
            <Label value={xAxis} offset={-10} position="insideBottom" />
          </XAxis>
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yAxis}
            domain={['auto', 'auto']}
          >
            <Label value={yAxis} angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {groupedData.map((group, index) => (
            <Scatter
              key={group.name}
              name={group.name}
              data={group.data}
              fill={colorByCluster ? COLORS[index % COLORS.length] : (OUTCOME_COLORS as any)[group.name] || COLORS[index % COLORS.length]}
            />
          ))}
          
          {regressionLine && (
            <Line
              type="linear"
              dataKey="y"
              data={regressionLine}
              stroke="#ff7300"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              legendType="none"
            />
          )}
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
