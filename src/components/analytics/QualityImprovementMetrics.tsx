
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AreaChart, BarChart, LineChart } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { useTemporalData } from "@/hooks/useTemporalData";

const QualityImprovementMetrics = () => {
  const { data } = useData();
  const [timeframe, setTimeframe] = useState<"all" | "3m" | "6m" | "12m">("all");
  
  // Filter data based on timeframe
  const getFilteredData = () => {
    if (timeframe === "all") return data;
    
    const now = new Date();
    const monthsAgo = timeframe === "3m" ? 3 : timeframe === "6m" ? 6 : 12;
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsAgo);
    
    return data.filter(p => {
      if (p.measurements.length === 0) return false;
      const latestMeasurement = new Date(p.measurements[p.measurements.length - 1].date);
      return latestMeasurement >= cutoffDate;
    });
  };
  
  const filteredData = getFilteredData();
  const temporalData = useTemporalData(filteredData);
  
  // Group data by month and calculate improvement metrics
  const months = temporalData.map(d => d.month);
  
  // Calculate outcome improvement over time
  const outcomeByMonth = months.map(month => {
    // Find participants who had measurements in this month
    const relevantParticipants = filteredData.filter(p => 
      p.measurements.some(m => {
        const date = new Date(m.date);
        const measurementMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return measurementMonth === month;
      })
    );
    
    const total = relevantParticipants.length;
    const improved = relevantParticipants.filter(p => p.outcome === "Improved").length;
    const unchanged = relevantParticipants.filter(p => p.outcome === "Unchanged").length;
    const worsened = relevantParticipants.filter(p => p.outcome === "Worsened").length;
    
    return {
      month,
      total,
      improved,
      unchanged,
      worsened,
      improvedPercent: total > 0 ? (improved / total) * 100 : 0,
      unchangedPercent: total > 0 ? (unchanged / total) * 100 : 0,
      worsenedPercent: total > 0 ? (worsened / total) * 100 : 0
    };
  }).filter(d => d.total > 0);
  
  // Calculate average length of stay over time
  const losByMonth = months.map(month => {
    const relevantParticipants = filteredData.filter(p => 
      p.measurements.some(m => {
        const date = new Date(m.date);
        const measurementMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return measurementMonth === month;
      })
    );
    
    const avgLOS = relevantParticipants.length > 0
      ? relevantParticipants.reduce((sum, p) => sum + p.lengthOfStay, 0) / relevantParticipants.length
      : 0;
      
    return {
      month,
      avgLOS: parseFloat(avgLOS.toFixed(1))
    };
  }).filter(d => d.avgLOS > 0);
  
  // Calculate quality metrics by unit
  const units = Array.from(new Set(filteredData.map(p => p.unit)));
  const unitMetrics = units.map(unit => {
    const unitParticipants = filteredData.filter(p => p.unit === unit);
    const total = unitParticipants.length;
    const improved = unitParticipants.filter(p => p.outcome === "Improved").length;
    const avgLOS = unitParticipants.reduce((sum, p) => sum + p.lengthOfStay, 0) / total;
    const avgRisk = unitParticipants.reduce((sum, p) => sum + p.riskScore, 0) / total;
    
    return {
      unit,
      total,
      improved,
      avgLOS: parseFloat(avgLOS.toFixed(1)),
      avgRisk: parseFloat(avgRisk.toFixed(1)),
      improvementRate: parseFloat(((improved / total) * 100).toFixed(1))
    };
  }).sort((a, b) => b.improvementRate - a.improvementRate);
  
  // Calculate trend directions for key metrics
  const calculateTrend = (data: any[], key: string) => {
    if (data.length < 2) return "neutral";
    
    const firstValue = data[0][key];
    const lastValue = data[data.length - 1][key];
    const percentChange = ((lastValue - firstValue) / firstValue) * 100;
    
    if (percentChange > 5) return "improving";
    if (percentChange < -5) return "worsening";
    return "neutral";
  };
  
  const improvementTrend = calculateTrend(outcomeByMonth, "improvedPercent");
  const losTrend = losByMonth.length >= 2 
    ? (losByMonth[losByMonth.length - 1].avgLOS < losByMonth[0].avgLOS ? "improving" : "worsening")
    : "neutral";
  
  // Calculate overall metrics
  const overallImproved = filteredData.filter(p => p.outcome === "Improved").length;
  const overallImprovementRate = (overallImproved / filteredData.length) * 100;
  const avgLOS = filteredData.reduce((sum, p) => sum + p.lengthOfStay, 0) / filteredData.length;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Quality Improvement Metrics</CardTitle>
            <CardDescription>
              Track key performance indicators for quality improvement initiatives
            </CardDescription>
          </div>
          <Select value={timeframe} onValueChange={(value: "all" | "3m" | "6m" | "12m") => setTimeframe(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="text-sm text-muted-foreground">Improvement Rate</div>
            <div className="text-2xl font-bold">{overallImprovementRate.toFixed(1)}%</div>
            <div className="flex items-center">
              <Badge variant={improvementTrend === "improving" ? "success" : improvementTrend === "worsening" ? "destructive" : "secondary"}>
                {improvementTrend === "improving" ? "Improving" : improvementTrend === "worsening" ? "Declining" : "Stable"}
              </Badge>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="text-sm text-muted-foreground">Avg. Length of Stay</div>
            <div className="text-2xl font-bold">{avgLOS.toFixed(1)} days</div>
            <div className="flex items-center">
              <Badge variant={losTrend === "improving" ? "success" : losTrend === "worsening" ? "destructive" : "secondary"}>
                {losTrend === "improving" ? "Decreasing" : losTrend === "worsening" ? "Increasing" : "Stable"}
              </Badge>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="text-sm text-muted-foreground">Top Performing Unit</div>
            <div className="text-2xl font-bold">
              {unitMetrics.length > 0 ? unitMetrics[0].unit : "N/A"}
            </div>
            <div className="text-sm">
              {unitMetrics.length > 0 ? `${unitMetrics[0].improvementRate}% improvement` : ""}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="trends">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Outcome Trends</TabsTrigger>
            <TabsTrigger value="los">Length of Stay</TabsTrigger>
            <TabsTrigger value="units">Unit Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends" className="space-y-4">
            <div className="h-64">
              <AreaChart
                data={outcomeByMonth}
                index="month"
                categories={["improvedPercent", "unchangedPercent", "worsenedPercent"]}
                colors={["green", "blue", "red"]}
                valueFormatter={(value) => `${value.toFixed(1)}%`}
                stack
              />
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="text-xs font-medium">Chart Legend:</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span>Improved</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span>Unchanged</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                  <span>Worsened</span>
                </div>
              </div>
              
              <p>
                {outcomeByMonth.length > 0 ? (
                  <>
                    {improvementTrend === "improving" 
                      ? "Improvement rates have shown a positive trend over the analyzed period. " 
                      : improvementTrend === "worsening" 
                        ? "Improvement rates have declined over the analyzed period. " 
                        : "Improvement rates have remained relatively stable over the analyzed period. "}
                    
                    The most recent data shows a 
                    {outcomeByMonth[outcomeByMonth.length - 1].improvedPercent > 70 
                      ? " very high" 
                      : outcomeByMonth[outcomeByMonth.length - 1].improvedPercent > 50 
                        ? " good" 
                        : " moderate"} 
                    improvement rate of {outcomeByMonth[outcomeByMonth.length - 1].improvedPercent.toFixed(1)}%.
                    
                    {outcomeByMonth[outcomeByMonth.length - 1].worsenedPercent > 20 
                      ? " The proportion of worsening cases remains concerning and warrants further investigation." 
                      : " The low proportion of worsening cases indicates effective intervention strategies."}
                  </>
                ) : (
                  "Insufficient temporal data to analyze outcome trends."
                )}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="los" className="space-y-4">
            <div className="h-64">
              <LineChart
                data={losByMonth}
                index="month"
                categories={["avgLOS"]}
                colors={["blue"]}
                valueFormatter={(value) => `${value.toFixed(1)} days`}
              />
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                {losByMonth.length > 0 ? (
                  <>
                    {losTrend === "improving" 
                      ? "Length of stay has been decreasing over time, suggesting more efficient care protocols. " 
                      : losTrend === "worsening" 
                        ? "Length of stay has been increasing over time, indicating potential care delivery challenges. " 
                        : "Length of stay has remained relatively consistent over time. "}
                    
                    The average length of stay is currently {losByMonth[losByMonth.length - 1].avgLOS.toFixed(1)} days
                    {losByMonth.length > 1 
                      ? `, compared to ${losByMonth[0].avgLOS.toFixed(1)} days at the beginning of the analysis period.` 
                      : "."}
                    
                    {losByMonth[losByMonth.length - 1].avgLOS < 5 
                      ? " This short average stay suggests efficient care protocols." 
                      : losByMonth[losByMonth.length - 1].avgLOS > 10 
                        ? " This extended average stay may indicate opportunities for care pathway optimization." 
                        : " This moderate length of stay is within expected parameters."}
                  </>
                ) : (
                  "Insufficient temporal data to analyze length of stay trends."
                )}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="units" className="space-y-4">
            <div className="h-64">
              <BarChart
                data={unitMetrics}
                index="unit"
                categories={["improvementRate"]}
                colors={["green"]}
                valueFormatter={(value) => `${value.toFixed(1)}%`}
              />
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                {unitMetrics.length > 0 ? (
                  <>
                    {unitMetrics[0].unit} has the highest improvement rate at {unitMetrics[0].improvementRate}%, 
                    while {unitMetrics[unitMetrics.length - 1].unit} shows the lowest at {unitMetrics[unitMetrics.length - 1].improvementRate}%.
                    
                    {(unitMetrics[0].improvementRate - unitMetrics[unitMetrics.length - 1].improvementRate) > 20 
                      ? " This significant performance gap suggests opportunities for cross-unit learning and standardization of best practices." 
                      : " The relatively narrow performance range across units suggests consistent care quality."}
                    
                    {unitMetrics.some(u => u.improvementRate < 40) 
                      ? " Units with improvement rates below 40% may benefit from targeted quality improvement initiatives." 
                      : " All units are performing at acceptable improvement levels."}
                  </>
                ) : (
                  "Insufficient data to analyze unit performance."
                )}
              </p>
              
              {unitMetrics.length > 0 && (
                <table className="w-full text-xs mt-2">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">Unit</th>
                      <th className="text-right p-1">Improvement Rate</th>
                      <th className="text-right p-1">Avg. LOS</th>
                      <th className="text-right p-1">Avg. Risk</th>
                      <th className="text-right p-1">Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitMetrics.map(unit => (
                      <tr key={unit.unit} className="border-b">
                        <td className="p-1">{unit.unit}</td>
                        <td className="text-right p-1">{unit.improvementRate}%</td>
                        <td className="text-right p-1">{unit.avgLOS}</td>
                        <td className="text-right p-1">{unit.avgRisk}</td>
                        <td className="text-right p-1">{unit.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QualityImprovementMetrics;
