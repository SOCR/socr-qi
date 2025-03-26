
import React from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

const StatisticalAnalysis = () => {
  const { data } = useData();
  
  const calculateStats = (values: number[]) => {
    const n = values.length;
    if (n === 0) return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };
    
    // Sort values for median and percentiles
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Calculate mean
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;
    
    // Calculate median
    const median = n % 2 === 0 
      ? (sortedValues[n / 2 - 1] + sortedValues[n / 2]) / 2 
      : sortedValues[Math.floor(n / 2)];
    
    // Calculate standard deviation
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Min and max
    const min = sortedValues[0];
    const max = sortedValues[n - 1];
    
    return { mean, median, stdDev, min, max };
  };
  
  // Age statistics
  const ages = data.map(p => p.age);
  const ageStats = calculateStats(ages);
  
  // Length of stay statistics
  const losValues = data.map(p => p.lengthOfStay);
  const losStats = calculateStats(losValues);
  
  // Risk scores statistics
  const riskScores = data.map(p => p.riskScore);
  const riskStats = calculateStats(riskScores);
  
  // Readmission risk statistics
  const readmissionRisks = data.map(p => p.readmissionRisk);
  const readmissionStats = calculateStats(readmissionRisks);
  
  // Distribution data for charts
  // Age distribution by decade
  const ageGroups = ["0-20", "21-40", "41-60", "61-80", "81+"];
  const ageDistribution = ages.reduce((acc, age) => {
    if (age <= 20) acc["0-20"] = (acc["0-20"] || 0) + 1;
    else if (age <= 40) acc["21-40"] = (acc["21-40"] || 0) + 1;
    else if (age <= 60) acc["41-60"] = (acc["41-60"] || 0) + 1;
    else if (age <= 80) acc["61-80"] = (acc["61-80"] || 0) + 1;
    else acc["81+"] = (acc["81+"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const ageChartData = ageGroups.map(group => ({
    group,
    count: ageDistribution[group] || 0
  }));
  
  // Length of stay distribution
  const losGroups = ["0-3", "4-7", "8-14", "15-30", "31+"];
  const losDistribution = losValues.reduce((acc, los) => {
    if (los <= 3) acc["0-3"] = (acc["0-3"] || 0) + 1;
    else if (los <= 7) acc["4-7"] = (acc["4-7"] || 0) + 1;
    else if (los <= 14) acc["8-14"] = (acc["8-14"] || 0) + 1;
    else if (los <= 30) acc["15-30"] = (acc["15-30"] || 0) + 1;
    else acc["31+"] = (acc["31+"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const losChartData = losGroups.map(group => ({
    group,
    count: losDistribution[group] || 0
  }));
  
  // Risk score distribution
  const riskGroups = ["0-20", "21-40", "41-60", "61-80", "81-100"];
  const riskDistribution = riskScores.reduce((acc, score) => {
    if (score <= 20) acc["0-20"] = (acc["0-20"] || 0) + 1;
    else if (score <= 40) acc["21-40"] = (acc["21-40"] || 0) + 1;
    else if (score <= 60) acc["41-60"] = (acc["41-60"] || 0) + 1;
    else if (score <= 80) acc["61-80"] = (acc["61-80"] || 0) + 1;
    else acc["81-100"] = (acc["81-100"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const riskChartData = riskGroups.map(group => ({
    group,
    count: riskDistribution[group] || 0
  }));
  
  // Calculate key statistical insights
  const highRiskPercentage = (data.filter(p => p.riskScore > 70).length / data.length) * 100;
  const longStayPercentage = (data.filter(p => p.lengthOfStay > 14).length / data.length) * 100;
  const elderlyPercentage = (data.filter(p => p.age > 65).length / data.length) * 100;
  const highReadmissionPercentage = (data.filter(p => p.readmissionRisk > 50).length / data.length) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistical Analysis</CardTitle>
        <CardDescription>
          Detailed statistical insights into participant demographics and outcomes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Overview</TabsTrigger>
            <TabsTrigger value="age">Age</TabsTrigger>
            <TabsTrigger value="los">Length of Stay</TabsTrigger>
            <TabsTrigger value="risk">Risk Scores</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Average Age</div>
                <div className="text-2xl font-bold">{Math.round(ageStats.mean)}</div>
                <div className="text-xs">±{Math.round(ageStats.stdDev)} years</div>
              </div>
              
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Avg. Length of Stay</div>
                <div className="text-2xl font-bold">{Math.round(losStats.mean)}</div>
                <div className="text-xs">±{Math.round(losStats.stdDev)} days</div>
              </div>
              
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Avg. Risk Score</div>
                <div className="text-2xl font-bold">{Math.round(riskStats.mean)}</div>
                <div className="text-xs">±{Math.round(riskStats.stdDev)} points</div>
              </div>
              
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Avg. Readmission Risk</div>
                <div className="text-2xl font-bold">{Math.round(readmissionStats.mean)}%</div>
                <div className="text-xs">±{Math.round(readmissionStats.stdDev)}%</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Key Insights</h3>
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={highRiskPercentage > 30 ? "destructive" : "outline"}>
                    {Math.round(highRiskPercentage)}% High Risk
                  </Badge>
                  <Badge variant={longStayPercentage > 25 ? "destructive" : "outline"}>
                    {Math.round(longStayPercentage)}% Extended Stay
                  </Badge>
                  <Badge variant={elderlyPercentage > 40 ? "secondary" : "outline"}>
                    {Math.round(elderlyPercentage)}% Elderly
                  </Badge>
                  <Badge variant={highReadmissionPercentage > 30 ? "destructive" : "outline"}>
                    {Math.round(highReadmissionPercentage)}% High Readmission Risk
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  This dataset shows {highRiskPercentage > 30 ? "a concerning" : "a moderate"} proportion of high-risk participants
                  and {longStayPercentage > 25 ? "a significant" : "a typical"} percentage with extended hospital stays.
                  {elderlyPercentage > 40 ? " The elderly population makes up a substantial portion of the dataset," : ""}
                  {highReadmissionPercentage > 30 
                    ? " with a notable percentage at risk of readmission." 
                    : " with a manageable readmission risk profile."}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="age">
            <div className="space-y-4">
              <div className="h-64">
                <BarChart
                  data={ageChartData}
                  index="group"
                  categories={["count"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value} participants`}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                <div className="text-sm">
                  <div className="font-medium">Mean</div>
                  <div>{ageStats.mean.toFixed(1)} years</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Median</div>
                  <div>{ageStats.median.toFixed(1)} years</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Std. Dev</div>
                  <div>±{ageStats.stdDev.toFixed(1)}</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Min</div>
                  <div>{ageStats.min} years</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Max</div>
                  <div>{ageStats.max} years</div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                The age distribution shows a 
                {ageStats.median < 40 ? " younger " : ageStats.median > 60 ? " older " : " balanced "} 
                participant population with a median age of {ageStats.median.toFixed(0)} years.
                {ageStats.stdDev > 15 
                  ? " There is significant age variation across the dataset, suggesting diverse health needs."
                  : " The relatively narrow age range suggests more homogeneous health needs."}
                {elderlyPercentage > 40 
                  ? " Special attention to geriatric care principles may be warranted given the sizeable elderly cohort."
                  : ""}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="los">
            <div className="space-y-4">
              <div className="h-64">
                <BarChart
                  data={losChartData}
                  index="group"
                  categories={["count"]}
                  colors={["green"]}
                  valueFormatter={(value) => `${value} participants`}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                <div className="text-sm">
                  <div className="font-medium">Mean</div>
                  <div>{losStats.mean.toFixed(1)} days</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Median</div>
                  <div>{losStats.median.toFixed(1)} days</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Std. Dev</div>
                  <div>±{losStats.stdDev.toFixed(1)}</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Min</div>
                  <div>{losStats.min} days</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Max</div>
                  <div>{losStats.max} days</div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                The length of stay distribution reveals that 
                {losStats.mean < 7 
                  ? " most participants have relatively short hospital stays, "
                  : losStats.mean > 14 
                    ? " participants typically experience extended hospital stays, " 
                    : " participants have moderate hospital stays, "}
                with an average of {losStats.mean.toFixed(1)} days.
                {losStats.stdDev > 10 
                  ? " The high variability suggests inconsistent care pathways or complex cases requiring diverse approaches."
                  : " The consistency in stay duration suggests standardized care protocols are generally effective."}
                {longStayPercentage > 25 
                  ? " The significant proportion of extended stays indicates potential opportunities for care optimization."
                  : ""}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="risk">
            <div className="space-y-4">
              <div className="h-64">
                <BarChart
                  data={riskChartData}
                  index="group"
                  categories={["count"]}
                  colors={["red"]}
                  valueFormatter={(value) => `${value} participants`}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                <div className="text-sm">
                  <div className="font-medium">Mean</div>
                  <div>{riskStats.mean.toFixed(1)}</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Median</div>
                  <div>{riskStats.median.toFixed(1)}</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Std. Dev</div>
                  <div>±{riskStats.stdDev.toFixed(1)}</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Min</div>
                  <div>{riskStats.min.toFixed(1)}</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Max</div>
                  <div>{riskStats.max.toFixed(1)}</div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Risk score analysis shows a 
                {riskStats.mean < 40 
                  ? " generally low-risk population " 
                  : riskStats.mean > 60 
                    ? " predominantly high-risk population " 
                    : " moderate-risk population "}
                with an average score of {riskStats.mean.toFixed(1)}.
                {riskStats.stdDev > 20 
                  ? " The wide variation in risk scores indicates diverse patient acuity levels requiring targeted interventions."
                  : " The relatively clustered risk scores suggest a more homogeneous population in terms of clinical risk."}
                {highRiskPercentage > 30 
                  ? " The substantial high-risk group (scores >70) warrants dedicated resources for risk mitigation strategies."
                  : ""}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StatisticalAnalysis;
