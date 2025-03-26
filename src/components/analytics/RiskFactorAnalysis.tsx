
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
import { BarChart, ScatterChart } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RiskFactorAnalysis = () => {
  const { data } = useData();
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  
  // Get all unique outcomes
  const outcomes = Array.from(new Set(data.map(p => p.outcome)));
  
  // Filter data based on selected outcome
  const filteredData = outcomeFilter === "all" 
    ? data 
    : data.filter(p => p.outcome === outcomeFilter);
  
  // Analyze risk factors by age group
  const ageGroups = ["18-30", "31-45", "46-60", "61-75", "76+"];
  const ageRiskData = ageGroups.map(group => {
    let participants;
    if (group === "18-30") {
      participants = filteredData.filter(p => p.age >= 18 && p.age <= 30);
    } else if (group === "31-45") {
      participants = filteredData.filter(p => p.age >= 31 && p.age <= 45);
    } else if (group === "46-60") {
      participants = filteredData.filter(p => p.age >= 46 && p.age <= 60);
    } else if (group === "61-75") {
      participants = filteredData.filter(p => p.age >= 61 && p.age <= 75);
    } else {
      participants = filteredData.filter(p => p.age >= 76);
    }
    
    const avgRisk = participants.length > 0
      ? participants.reduce((sum, p) => sum + p.riskScore, 0) / participants.length
      : 0;
      
    const avgReadmission = participants.length > 0
      ? participants.reduce((sum, p) => sum + p.readmissionRisk, 0) / participants.length
      : 0;
      
    return {
      group,
      avgRisk: parseFloat(avgRisk.toFixed(1)),
      avgReadmission: parseFloat(avgReadmission.toFixed(1)),
      count: participants.length
    };
  });
  
  // Analyze risk factors by condition
  const conditions = Array.from(new Set(data.map(p => p.condition)));
  const conditionRiskData = conditions.map(condition => {
    const participants = filteredData.filter(p => p.condition === condition);
    
    const avgRisk = participants.length > 0
      ? participants.reduce((sum, p) => sum + p.riskScore, 0) / participants.length
      : 0;
      
    const avgReadmission = participants.length > 0
      ? participants.reduce((sum, p) => sum + p.readmissionRisk, 0) / participants.length
      : 0;
      
    const avgLOS = participants.length > 0
      ? participants.reduce((sum, p) => sum + p.lengthOfStay, 0) / participants.length
      : 0;
      
    return {
      condition,
      avgRisk: parseFloat(avgRisk.toFixed(1)),
      avgReadmission: parseFloat(avgReadmission.toFixed(1)),
      avgLOS: parseFloat(avgLOS.toFixed(1)),
      count: participants.length
    };
  }).sort((a, b) => b.avgRisk - a.avgRisk);
  
  // Analyze correlation between risk score and length of stay
  const correlationData = filteredData.map(p => ({
    id: p.id,
    riskScore: p.riskScore,
    lengthOfStay: p.lengthOfStay,
    outcome: p.outcome,
    condition: p.condition
  }));
  
  // Calculate correlation coefficient between risk score and length of stay
  const calculateCorrelation = (data: { riskScore: number; lengthOfStay: number }[]) => {
    const n = data.length;
    if (n === 0) return 0;
    
    // Extract values
    const x = data.map(d => d.riskScore);
    const y = data.map(d => d.lengthOfStay);
    
    // Calculate means
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate covariance and variances
    let covariance = 0;
    let varianceX = 0;
    let varianceY = 0;
    
    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      covariance += diffX * diffY;
      varianceX += diffX * diffX;
      varianceY += diffY * diffY;
    }
    
    // Calculate correlation coefficient
    const correlation = covariance / Math.sqrt(varianceX * varianceY);
    return parseFloat(correlation.toFixed(2));
  };
  
  const correlationCoefficient = calculateCorrelation(correlationData);
  
  // Identify top risk factors based on the data
  const highRiskConditions = conditionRiskData
    .filter(d => d.count >= 5) // Ensure sufficient data points
    .sort((a, b) => b.avgRisk - a.avgRisk)
    .slice(0, 3);
    
  const highReadmissionConditions = conditionRiskData
    .filter(d => d.count >= 5)
    .sort((a, b) => b.avgReadmission - a.avgReadmission)
    .slice(0, 3);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Risk Factor Analysis</CardTitle>
            <CardDescription>
              Identify and quantify key factors affecting patient outcomes
            </CardDescription>
          </div>
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              {outcomes.map(outcome => (
                <SelectItem key={outcome} value={outcome}>{outcome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="age">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="age">Age Factors</TabsTrigger>
            <TabsTrigger value="condition">Condition Factors</TabsTrigger>
            <TabsTrigger value="correlation">Risk Correlations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="age" className="space-y-4">
            <div className="h-64">
              <BarChart
                data={ageRiskData}
                index="group"
                categories={["avgRisk", "avgReadmission"]}
                colors={["red", "blue"]}
                valueFormatter={(value) => `${value}`}
              />
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="text-xs font-medium">Chart Legend:</p>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                  <span>Risk Score (0-100)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span>Readmission Risk (%)</span>
                </div>
              </div>
              
              <p>
                This analysis reveals that 
                {ageRiskData.sort((a, b) => b.avgRisk - a.avgRisk)[0].group === "76+" 
                  ? "elderly patients (76+) have the highest risk scores" 
                  : `patients in the ${ageRiskData.sort((a, b) => b.avgRisk - a.avgRisk)[0].group} age group have the highest risk scores`}, 
                averaging {ageRiskData.sort((a, b) => b.avgRisk - a.avgRisk)[0].avgRisk.toFixed(1)}.
              </p>
              
              <p>
                {ageRiskData.sort((a, b) => b.avgReadmission - a.avgReadmission)[0].group === ageRiskData.sort((a, b) => b.avgRisk - a.avgRisk)[0].group 
                  ? "This same age group also shows the highest readmission risk" 
                  : `The ${ageRiskData.sort((a, b) => b.avgReadmission - a.avgReadmission)[0].group} age group shows the highest readmission risk`}, 
                suggesting age is a consistent factor in both initial risk assessment and likelihood of readmission.
              </p>
              
              {outcomeFilter !== "all" && (
                <p className="text-xs italic">
                  Note: Data filtered to show only participants with outcome: "{outcomeFilter}"
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="condition" className="space-y-4">
            <div className="h-64">
              <BarChart
                data={conditionRiskData.slice(0, 5)}
                index="condition"
                categories={["avgRisk", "avgReadmission"]}
                colors={["red", "blue"]}
                valueFormatter={(value) => `${value}`}
                layout="vertical"
              />
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="text-xs font-medium">Chart Legend:</p>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                  <span>Risk Score (0-100)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span>Readmission Risk (%)</span>
                </div>
              </div>
              
              <p>
                Among clinical conditions, 
                {highRiskConditions.length > 0 
                  ? `${highRiskConditions.map(c => c.condition).join(", ")} ${highRiskConditions.length > 1 ? "are" : "is"} associated with the highest risk scores` 
                  : "no condition stands out with significantly elevated risk"}.
              </p>
              
              <p>
                {highReadmissionConditions.length > 0 
                  ? `${highReadmissionConditions.map(c => c.condition).join(", ")} ${highReadmissionConditions.length > 1 ? "show" : "shows"} the highest readmission risk` 
                  : "No condition shows a significantly higher readmission risk than others"}.
                {highRiskConditions[0]?.condition === highReadmissionConditions[0]?.condition 
                  ? " This overlap indicates that the condition is a key determinant of both initial and subsequent risk." 
                  : " The difference between high-risk and high-readmission conditions suggests distinct risk pathways."}
              </p>
              
              {outcomeFilter !== "all" && (
                <p className="text-xs italic">
                  Note: Data filtered to show only participants with outcome: "{outcomeFilter}"
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="correlation" className="space-y-4">
            <div className="h-64">
              <ScatterChart
                data={correlationData}
                xAxis={[{ 
                  dataKey: "riskScore",
                  label: "Risk Score"
                }]}
                yAxis={[{ 
                  dataKey: "lengthOfStay",
                  label: "Length of Stay (days)"
                }]}
                series={[
                  {
                    dataKey: "outcome",
                    valueFormatter: (value) => `${value}`,
                    label: "Outcome",
                    showMark: true
                  }
                ]}
                tooltip={{ trigger: "item" }}
              />
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between items-center">
                <p>Correlation coefficient (r): {correlationCoefficient}</p>
                <div className="text-xs px-2 py-1 rounded bg-muted">
                  {Math.abs(correlationCoefficient) < 0.3 ? "Weak correlation" : 
                   Math.abs(correlationCoefficient) < 0.7 ? "Moderate correlation" : 
                   "Strong correlation"}
                </div>
              </div>
              
              <p>
                {correlationCoefficient > 0 
                  ? "There is a positive correlation between risk scores and length of stay, indicating that higher-risk patients typically stay longer in the hospital." 
                  : correlationCoefficient < 0 
                    ? "There is a negative correlation between risk scores and length of stay, suggesting higher-risk patients may have shorter stays, possibly due to faster interventions or other factors." 
                    : "There is no meaningful correlation between risk scores and length of stay."}
                
                {Math.abs(correlationCoefficient) > 0.7 
                  ? " This strong correlation suggests risk scores are reliable predictors of resource utilization."
                  : Math.abs(correlationCoefficient) > 0.3 
                    ? " This moderate correlation indicates risk scores have some predictive value for resource planning."
                    : " This weak correlation suggests factors beyond initial risk assessment significantly influence hospital stays."}
              </p>
              
              <p>
                The scatter plot reveals 
                {correlationData.some(d => d.riskScore > 80 && d.lengthOfStay < 5) 
                  ? " some high-risk patients with unexpectedly short stays, " 
                  : ""}
                {correlationData.some(d => d.riskScore < 30 && d.lengthOfStay > 15) 
                  ? " some low-risk patients with extended stays, " 
                  : ""}
                suggesting that
                {Math.abs(correlationCoefficient) < 0.5 
                  ? " risk assessment alone may not capture all factors affecting length of stay."
                  : " while risk scores correlate with length of stay, individual cases may still deviate from the pattern."}
              </p>
              
              {outcomeFilter !== "all" && (
                <p className="text-xs italic">
                  Note: Data filtered to show only participants with outcome: "{outcomeFilter}"
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RiskFactorAnalysis;
