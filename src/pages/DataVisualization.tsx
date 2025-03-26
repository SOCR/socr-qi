
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NoDataMessage from "@/components/NoDataMessage";
import { AreaChart, BarChart, LineChart, PieChart } from "@/components/ui/chart";
import ParticipantTimeSeriesChart from "@/components/ParticipantTimeSeriesChart";

const DataVisualization = () => {
  const { data, isDataLoaded } = useData();
  const [riskScoreView, setRiskScoreView] = useState<"distribution" | "temporal">("distribution");
  
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
  
  // Risk score distribution for line chart (static)
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

  // Risk score temporal distribution
  // Group by month and calculate average risk score
  const riskByTime = data.reduce((acc, participant) => {
    // Extract month and year from the first measurement
    if (participant.measurements.length > 0) {
      const dateObj = new Date(participant.measurements[0].date);
      const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          count: 0,
          totalRisk: 0,
          avgRisk: 0
        };
      }
      
      acc[monthYear].count += 1;
      acc[monthYear].totalRisk += participant.riskScore;
    }
    return acc;
  }, {} as Record<string, { month: string; count: number; totalRisk: number; avgRisk: number }>);

  // Calculate averages and sort by month
  const riskTemporalData = Object.values(riskByTime).map(entry => ({
    month: entry.month,
    avgRisk: entry.count > 0 ? Math.round(entry.totalRisk / entry.count) : 0
  })).sort((a, b) => a.month.localeCompare(b.month));

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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Risk Score Analysis</CardTitle>
                <CardDescription>Analysis of risk scores across the participant population</CardDescription>
              </div>
              <Select value={riskScoreView} onValueChange={(value: "distribution" | "temporal") => setRiskScoreView(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distribution">Distribution</SelectItem>
                  <SelectItem value="temporal">Temporal Trends</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="h-[300px]">
              {riskScoreView === "distribution" ? (
                <>
                  <BarChart
                    data={riskLineData}
                    index="name"
                    categories={["value"]}
                    colors={["blue"]}
                    valueFormatter={(value) => `${value} patients`}
                  />
                  <div className="mt-2 text-xs text-center text-muted-foreground">
                    Distribution of participants by risk score range (0-100)
                  </div>
                </>
              ) : (
                <>
                  <LineChart
                    data={riskTemporalData}
                    index="month"
                    categories={["avgRisk"]}
                    colors={["red"]}
                    valueFormatter={(value) => `${value}`}
                  />
                  <div className="mt-2 text-xs text-center text-muted-foreground">
                    Average risk score trends over time (by admission month)
                  </div>
                </>
              )}
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
          <ParticipantTimeSeriesChart />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataVisualization;
