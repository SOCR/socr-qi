
import React, { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ScatterChart from "@/components/ScatterChart";
import { calculateCorrelation, linearRegression } from "@/utils/analyticsUtils";

// Define the statistical metric options
const MetricOptions = [
  { id: "age", name: "Age" },
  { id: "riskScore", name: "Risk Score" },
  { id: "readmissionRisk", name: "Readmission Risk" },
  { id: "lengthOfStay", name: "Length of Stay" },
  { id: "heartRate", name: "Heart Rate (latest)" },
  { id: "bloodPressure", name: "Blood Pressure (latest)" },
  { id: "temperature", name: "Temperature (latest)" },
  { id: "oxygenSaturation", name: "Oxygen Saturation (latest)" },
];

const CorrelationAnalysis = () => {
  const { data } = useData();
  const [xMetric, setXMetric] = useState("age");
  const [yMetric, setYMetric] = useState("riskScore");

  // Extract data points
  const scatterData = useMemo(() => {
    return data.map(participant => {
      let xValue;
      let yValue;
      
      // Extract X value
      if (xMetric === "age" || xMetric === "riskScore" || xMetric === "readmissionRisk" || xMetric === "lengthOfStay") {
        xValue = participant[xMetric as keyof typeof participant];
      } else {
        // Get latest vital sign measurement
        if (participant.measurements.length > 0) {
          const latest = participant.measurements[participant.measurements.length - 1];
          if (xMetric === "heartRate") xValue = latest.heartRate;
          else if (xMetric === "bloodPressure") xValue = latest.bloodPressureSystolic;
          else if (xMetric === "temperature") xValue = latest.temperature;
          else if (xMetric === "oxygenSaturation") xValue = latest.oxygenSaturation;
        }
      }
      
      // Extract Y value
      if (yMetric === "age" || yMetric === "riskScore" || yMetric === "readmissionRisk" || yMetric === "lengthOfStay") {
        yValue = participant[yMetric as keyof typeof participant];
      } else {
        // Get latest vital sign measurement
        if (participant.measurements.length > 0) {
          const latest = participant.measurements[participant.measurements.length - 1];
          if (yMetric === "heartRate") yValue = latest.heartRate;
          else if (yMetric === "bloodPressure") yValue = latest.bloodPressureSystolic;
          else if (yMetric === "temperature") yValue = latest.temperature;
          else if (yMetric === "oxygenSaturation") yValue = latest.oxygenSaturation;
        }
      }
      
      if (xValue !== undefined && yValue !== undefined) {
        return {
          id: participant.id,
          x: xValue,
          y: yValue,
          outcome: participant.outcome,
          condition: participant.condition,
          unit: participant.unit,
          gender: participant.gender
        };
      }
      return null;
    }).filter(point => point !== null) as any[];
  }, [data, xMetric, yMetric]);
  
  // Calculate correlation
  const correlation = useMemo(() => {
    if (scatterData.length < 3) return 0;
    
    const xValues = scatterData.map(d => d.x);
    const yValues = scatterData.map(d => d.y);
    
    return calculateCorrelation(xValues, yValues);
  }, [scatterData]);
  
  // Calculate regression line
  const regressionPoints = useMemo(() => {
    if (scatterData.length < 3) return [];
    
    const xValues = scatterData.map(d => d.x);
    const yValues = scatterData.map(d => d.y);
    
    const { slope, intercept } = linearRegression(xValues, yValues);
    
    // Get min and max X values
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    
    // Create points for line
    return [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept }
    ];
  }, [scatterData]);
  
  // Get the name of the metric
  const getMetricName = (id: string) => {
    const metric = MetricOptions.find(m => m.id === id);
    return metric ? metric.name : id;
  };
  
  // Assess correlation strength
  const getCorrelationStrength = () => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.7) return "Strong";
    if (absCorr >= 0.5) return "Moderate";
    if (absCorr >= 0.3) return "Weak";
    return "Very weak";
  };
  
  // Get badge color based on correlation strength
  const getCorrelationColor = () => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.7) return "destructive";
    if (absCorr >= 0.5) return "secondary";
    if (absCorr >= 0.3) return "default";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Correlation Analysis</CardTitle>
        <CardDescription>
          Analyze relationships between different parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1 min-w-[150px] flex-1">
            <label className="text-sm font-medium">X Axis</label>
            <Select value={xMetric} onValueChange={setXMetric}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {MetricOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 min-w-[150px] flex-1">
            <label className="text-sm font-medium">Y Axis</label>
            <Select value={yMetric} onValueChange={setYMetric}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {MetricOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="bg-muted p-3 rounded-md mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Correlation Analysis</h3>
              <Badge variant={getCorrelationColor() as any}>
                {getCorrelationStrength()}
              </Badge>
            </div>
            <p className="text-sm">
              <strong>Correlation coefficient:</strong> {correlation.toFixed(3)}
            </p>
            <p className="text-sm">
              <strong>Direction:</strong> {correlation > 0 ? "Positive" : correlation < 0 ? "Negative" : "No correlation"}
            </p>
            <p className="text-sm mt-1">
              {correlation > 0.7 || correlation < -0.7
                ? `Strong ${correlation > 0 ? "positive" : "negative"} relationship between ${getMetricName(xMetric)} and ${getMetricName(yMetric)}.`
                : correlation > 0.5 || correlation < -0.5
                  ? `Moderate ${correlation > 0 ? "positive" : "negative"} relationship between ${getMetricName(xMetric)} and ${getMetricName(yMetric)}.`
                  : `Weak or no significant relationship between ${getMetricName(xMetric)} and ${getMetricName(yMetric)}.`
              }
            </p>
          </div>
          
          <div className="h-[350px]">
            <ScatterChart
              data={scatterData}
              xAxisKey="x"
              yAxisKey="y"
              xAxisLabel={getMetricName(xMetric)}
              yAxisLabel={getMetricName(yMetric)}
              tooltipLabel="Participant"
              height={350}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrelationAnalysis;
