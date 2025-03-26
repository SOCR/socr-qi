
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
import { Checkbox } from "@/components/ui/checkbox";
import ScatterChart from "@/components/ScatterChart";

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

// Dummy function to simulate clustering for now
const simulateClustering = (points: any[], numClusters = 3) => {
  return points.map(point => {
    // Simple clustering based on distance from origin
    const distance = Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
    let cluster = 0;
    if (distance < 50) cluster = 0;
    else if (distance < 100) cluster = 1;
    else cluster = 2;
    
    return { ...point, cluster };
  });
};

const ClusteringAnalysis = () => {
  const { data } = useData();
  const [xMetric, setXMetric] = useState("age");
  const [yMetric, setYMetric] = useState("riskScore");
  const [colorByCluster, setColorByCluster] = useState(true);

  // Extract data points
  const scatterData = useMemo(() => {
    const rawData = data.map(participant => {
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
    
    // Apply clustering
    return simulateClustering(rawData);
  }, [data, xMetric, yMetric]);
  
  // Get the name of the metric
  const getMetricName = (id: string) => {
    const metric = MetricOptions.find(m => m.id === id);
    return metric ? metric.name : id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clustering Analysis</CardTitle>
        <CardDescription>
          Identify natural groupings in the data
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
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="color-by-cluster" 
            checked={colorByCluster}
            onCheckedChange={(checked) => {
              if (typeof checked === 'boolean') {
                setColorByCluster(checked);
              }
            }}
          />
          <label
            htmlFor="color-by-cluster"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Color points by cluster
          </label>
        </div>
        
        <div className="pt-2">
          <div className="bg-muted p-3 rounded-md mb-3">
            <h3 className="font-medium mb-1">Cluster Analysis Results</h3>
            <p className="text-sm">
              The data has been segmented into 3 clusters based on {getMetricName(xMetric)} and {getMetricName(yMetric)}.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-sm">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                Cluster 0: {scatterData.filter(d => d.cluster === 0).length} patients
              </div>
              <div className="text-sm">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                Cluster 1: {scatterData.filter(d => d.cluster === 1).length} patients
              </div>
              <div className="text-sm">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                Cluster 2: {scatterData.filter(d => d.cluster === 2).length} patients
              </div>
            </div>
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

export default ClusteringAnalysis;
