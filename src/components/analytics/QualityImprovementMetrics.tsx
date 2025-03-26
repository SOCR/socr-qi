import React from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { AreaChart, BarChart, LineChart } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

const QualityImprovementMetrics = () => {
  const { data } = useData();
  
  // Calculate average length of stay
  const avgLengthOfStay = data.length > 0
    ? data.reduce((sum, p) => sum + p.lengthOfStay, 0) / data.length
    : 0;
    
  // Calculate readmission rates
  const totalReadmissions = data.filter(p => p.readmissionRisk > 50).length;
  const readmissionRate = data.length > 0
    ? (totalReadmissions / data.length) * 100
    : 0;
    
  // Calculate outcome distribution
  const outcomeCounts = data.reduce((acc, p) => {
    acc[p.outcome] = (acc[p.outcome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalParticipants = data.length;
  const improvedRate = (outcomeCounts["Improved"] || 0) / totalParticipants * 100;
  const stableRate = (outcomeCounts["Stable"] || 0) / totalParticipants * 100;
  const deterioratedRate = (outcomeCounts["Deteriorated"] || 0) / totalParticipants * 100;
  
  // Mock data for trends (replace with actual trend analysis)
  const metrics = [
    {
      name: "Avg. Length of Stay",
      value: parseFloat(avgLengthOfStay.toFixed(1)),
      trend: "down", // "up", "down", "stable"
      target: 7,
      status: avgLengthOfStay <= 7 ? "good" : "warning" // "good", "warning", "critical"
    },
    {
      name: "Readmission Rate",
      value: parseFloat(readmissionRate.toFixed(1)),
      trend: "down",
      target: 10,
      status: readmissionRate <= 10 ? "good" : "warning"
    },
    {
      name: "Improved Outcomes",
      value: parseFloat(improvedRate.toFixed(1)),
      trend: "up",
      target: 70,
      status: improvedRate >= 70 ? "good" : "warning"
    }
  ];
  
  // Mock data for monthly outcomes (replace with actual time series data)
  const outcomesByMonth = [
    { month: "Jan", improved: 60, unchanged: 30, worsened: 10 },
    { month: "Feb", improved: 65, unchanged: 25, worsened: 10 },
    { month: "Mar", improved: 70, unchanged: 20, worsened: 10 },
    { month: "Apr", improved: 75, unchanged: 15, worsened: 10 },
    { month: "May", improved: 80, unchanged: 10, worsened: 10 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Improvement Metrics</CardTitle>
        <CardDescription>
          Track key performance indicators to drive quality improvement efforts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map(metric => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{metric.name}</h3>
                <Badge variant={metric.trend === 'up' ? 'default' : (metric.trend === 'down' ? 'destructive' : 'secondary')}>
                  {metric.trend === "up" ? "Improving" : (metric.trend === "down" ? "Worsening" : "Stable")}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                Target: {metric.target}
                <Badge variant={metric.status === 'good' ? 'default' : (metric.status === 'warning' ? 'secondary' : 'destructive')} className="ml-2">
                  {metric.status === "good" ? "Achieved" : "Needs Improvement"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <h3 className="text-sm font-medium">Monthly Outcome Trends</h3>
          <AreaChart
            data={outcomesByMonth}
            index="month"
            categories={["improved", "unchanged", "worsened"]}
            colors={["green", "blue", "red"]}
            valueFormatter={(value) => `${value}%`}
            stacked={true}
          />
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Percentage of patient outcomes each month
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QualityImprovementMetrics;
