
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoDataMessage from "@/components/NoDataMessage";
import { AreaChart, BarChart, LineChart, PieChart } from "@/components/ui/chart";
import MultiParticipantChartControls from "@/components/MultiParticipantChartControls";
import { useParticipantTimeSeriesData } from "@/hooks/useParticipantTimeSeriesData";
import { ChartTooltip } from "@/components/ChartTooltip";

const DataVisualization = () => {
  const { data, isDataLoaded } = useData();
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("vitals");
  
  // Get the time series data for selected participants
  const timeSeriesData = useParticipantTimeSeriesData(data, selectedParticipantIds);
  
  if (!isDataLoaded) {
    return <NoDataMessage />;
  }

  // Prepare data for charts
  // Unit distribution for pie chart
  const unitCounts = data.reduce((acc, participant) => {
    acc[participant.unit] = (acc[participant.unit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const unitPieData = Object.entries(unitCounts).map(([name, value]) => ({ name, value }));
  
  // Outcome distribution for bar chart
  const outcomeCounts = data.reduce((acc, participant) => {
    acc[participant.outcome] = (acc[participant.outcome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const outcomeBarData = Object.entries(outcomeCounts).map(([name, value]) => ({ name, value }));
  
  // Risk score distribution for line chart
  const riskGroups = ["0-20", "21-40", "41-60", "61-80", "81-100"];
  const riskDistribution = data.reduce((acc, participant) => {
    const score = participant.riskScore;
    if (score <= 20) acc["0-20"] = (acc["0-20"] || 0) + 1;
    else if (score <= 40) acc["21-40"] = (acc["21-40"] || 0) + 1;
    else if (score <= 60) acc["41-60"] = (acc["41-60"] || 0) + 1;
    else if (score <= 80) acc["61-80"] = (acc["61-80"] || 0) + 1;
    else acc["81-100"] = (acc["81-100"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const riskLineData = riskGroups.map(group => ({ 
    name: group, 
    value: riskDistribution[group] || 0 
  }));

  // Define chart categories based on selected metric
  const getChartCategories = () => {
    if (selectedParticipantIds.length === 0) return [];
    
    if (selectedParticipantIds.length === 1) {
      switch (selectedMetric) {
        case "vitals":
          return ["heartRate"];
        case "bloodPressure":
          return ["systolic", "diastolic"];
        case "oxygenation":
          return ["oxygenSaturation"];
        case "temperature":
          return ["temperature"];
        default:
          return ["heartRate", "systolic", "diastolic", "oxygenSaturation"];
      }
    } else {
      // For multiple participants, create categories with participant IDs
      const participantSpecificCategories: string[] = [];
      
      switch (selectedMetric) {
        case "vitals":
          selectedParticipantIds.forEach(id => {
            participantSpecificCategories.push(`heartRate_${id}`);
          });
          break;
        case "bloodPressure":
          selectedParticipantIds.forEach(id => {
            participantSpecificCategories.push(`systolic_${id}`);
            participantSpecificCategories.push(`diastolic_${id}`);
          });
          break;
        case "oxygenation":
          selectedParticipantIds.forEach(id => {
            participantSpecificCategories.push(`oxygenSaturation_${id}`);
          });
          break;
        case "temperature":
          selectedParticipantIds.forEach(id => {
            participantSpecificCategories.push(`temperature_${id}`);
          });
          break;
      }
      
      return participantSpecificCategories;
    }
  };

  // Get chart title based on selected metric
  const getChartTitle = () => {
    switch (selectedMetric) {
      case "vitals":
        return "Heart Rate Over Time";
      case "bloodPressure":
        return "Blood Pressure Over Time";
      case "oxygenation":
        return "Oxygen Saturation Over Time";
      case "temperature":
        return "Temperature Over Time";
      default:
        return "Vital Signs Over Time";
    }
  };

  // Generate dynamic chart legend based on selected participants and metric
  const getLegendLabels = () => {
    if (selectedParticipantIds.length === 0) return [];
    
    const labels: Record<string, string> = {};
    
    selectedParticipantIds.forEach(id => {
      const participant = data.find(p => p.id === id);
      const shortId = id.substring(0, 6);
      
      switch (selectedMetric) {
        case "vitals":
          labels[`heartRate_${id}`] = `HR - ${shortId}`;
          break;
        case "bloodPressure":
          labels[`systolic_${id}`] = `Sys - ${shortId}`;
          labels[`diastolic_${id}`] = `Dia - ${shortId}`;
          break;
        case "oxygenation":
          labels[`oxygenSaturation_${id}`] = `O2 - ${shortId}`;
          break;
        case "temperature":
          labels[`temperature_${id}`] = `Temp - ${shortId}`;
          break;
      }
    });
    
    return labels;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Data Visualization</h1>
      
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary Charts</TabsTrigger>
          <TabsTrigger value="table">Data Table</TabsTrigger>
          <TabsTrigger value="timeseries">Time Series</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Unit Distribution</CardTitle>
                <CardDescription>Distribution of participants across clinical units</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <PieChart
                  data={unitPieData}
                  index="name"
                  categoryKey="value"
                  valueFormatter={(value) => `${value} patients`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outcome Distribution</CardTitle>
                <CardDescription>Distribution of clinical outcomes</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChart
                  data={outcomeBarData}
                  index="name"
                  categories={["value"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value} patients`}
                  layout="vertical"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Score Distribution</CardTitle>
              <CardDescription>Number of participants by risk score range</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <LineChart
                data={riskLineData}
                index="name"
                categories={["value"]}
                colors={["blue"]}
                valueFormatter={(value) => `${value} patients`}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Participant Data</CardTitle>
              <CardDescription>Tabular view of all participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="px-4 py-2 text-left font-medium">ID</th>
                        <th className="px-4 py-2 text-left font-medium">Age</th>
                        <th className="px-4 py-2 text-left font-medium">Gender</th>
                        <th className="px-4 py-2 text-left font-medium">Unit</th>
                        <th className="px-4 py-2 text-left font-medium">Condition</th>
                        <th className="px-4 py-2 text-left font-medium">Outcome</th>
                        <th className="px-4 py-2 text-left font-medium">Risk Score</th>
                        <th className="px-4 py-2 text-left font-medium">Length of Stay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 50).map((participant) => (
                        <tr key={participant.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{participant.id}</td>
                          <td className="px-4 py-2">{participant.age}</td>
                          <td className="px-4 py-2">{participant.gender}</td>
                          <td className="px-4 py-2">{participant.unit}</td>
                          <td className="px-4 py-2">{participant.condition}</td>
                          <td className="px-4 py-2">{participant.outcome}</td>
                          <td className="px-4 py-2">{participant.riskScore.toFixed(1)}</td>
                          <td className="px-4 py-2">{participant.lengthOfStay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {data.length > 50 && (
                  <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-t">
                    Showing 50 of {data.length} participants
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeseries">
          <Card>
            <CardHeader>
              <CardTitle>Participant Time Series Data</CardTitle>
              <CardDescription>
                Longitudinal measurements for selected participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MultiParticipantChartControls
                data={data}
                selectedParticipantIds={selectedParticipantIds}
                setSelectedParticipantIds={setSelectedParticipantIds}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
              />

              {selectedParticipantIds.length > 0 ? (
                <div className="h-[400px]">
                  <LineChart
                    data={timeSeriesData}
                    index="displayDate"
                    categories={getChartCategories()}
                    title={getChartTitle()}
                    valueFormatter={(value) => `${value}`}
                    customTooltip={ChartTooltip}
                    customTooltipParams={{
                      formatter: (value: number) => {
                        if (selectedMetric === "temperature") {
                          return `${value.toFixed(1)}°C`;
                        } else if (selectedMetric === "oxygenation") {
                          return `${value.toFixed(1)}%`;
                        } else {
                          return `${Math.round(value)}`;
                        }
                      }
                    }}
                  />
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      {selectedParticipantIds.length === 1 
                        ? "This chart shows the time series data for the selected participant."
                        : "This chart shows the time series data for multiple participants, allowing comparison of trends."}
                    </p>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {Object.entries(getLegendLabels()).map(([key, label]) => {
                      const participantId = key.split('_')[1];
                      const participant = data.find(p => p.id === participantId);
                      const metricName = key.split('_')[0];
                      
                      return (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span>{label} - {participant?.condition} ({metricName})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-md">
                  <p>Select at least one participant to view time series data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataVisualization;
