
import React, { useState, useMemo } from "react";
import { useData, Participant } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ScatterChart, 
  BarChart, 
  LineChart, 
  PieChart 
} from "@/components/ui/chart";
import { calculateCorrelation, linearRegression } from "@/utils/analyticsUtils";

// Sample risk factors to analyze
const riskFactors = [
  { id: "age", name: "Age", unit: "years" },
  { id: "heartRate", name: "Heart Rate", unit: "bpm" },
  { id: "systolic", name: "Systolic BP", unit: "mmHg" },
  { id: "diastolic", name: "Diastolic BP", unit: "mmHg" },
  { id: "temperature", name: "Temperature", unit: "°C" },
  { id: "oxygenSaturation", name: "O₂ Saturation", unit: "%" },
  { id: "lengthOfStay", name: "Length of Stay", unit: "days" },
];

const RiskFactorAnalysis = () => {
  const { data } = useData();
  const [primaryFactor, setPrimaryFactor] = useState("age");
  const [secondaryFactor, setSecondaryFactor] = useState("lengthOfStay");
  const [outcomeFactor, setOutcomeFactor] = useState("riskScore");
  const [analysisType, setAnalysisType] = useState<"correlation" | "distribution" | "trends">("correlation");
  
  const getFormattedRiskData = useMemo(() => {
    // Extract the primary factor data for each participant
    return data.map(participant => {
      let primaryValue: number | null = null;
      let secondaryValue: number | null = null;
      let outcomeValue: number | null = null;
      
      // Get primary factor data
      if (primaryFactor === "age") {
        primaryValue = participant.age;
      } else if (primaryFactor === "lengthOfStay") {
        primaryValue = participant.lengthOfStay;
      } else if (primaryFactor === "riskScore") {
        primaryValue = participant.riskScore;
      } else {
        // For vital signs, get the most recent measurement
        if (participant.measurements.length > 0) {
          const latestMeasurement = participant.measurements[participant.measurements.length - 1];
          if (primaryFactor === "heartRate") {
            primaryValue = latestMeasurement.heartRate;
          } else if (primaryFactor === "systolic") {
            primaryValue = latestMeasurement.bloodPressureSystolic;
          } else if (primaryFactor === "diastolic") {
            primaryValue = latestMeasurement.bloodPressureDiastolic;
          } else if (primaryFactor === "temperature") {
            primaryValue = latestMeasurement.temperature;
          } else if (primaryFactor === "oxygenSaturation") {
            primaryValue = latestMeasurement.oxygenSaturation;
          }
        }
      }
      
      // Get secondary factor data
      if (secondaryFactor === "age") {
        secondaryValue = participant.age;
      } else if (secondaryFactor === "lengthOfStay") {
        secondaryValue = participant.lengthOfStay;
      } else if (secondaryFactor === "riskScore") {
        secondaryValue = participant.riskScore;
      } else {
        // For vital signs, get the most recent measurement
        if (participant.measurements.length > 0) {
          const latestMeasurement = participant.measurements[participant.measurements.length - 1];
          if (secondaryFactor === "heartRate") {
            secondaryValue = latestMeasurement.heartRate;
          } else if (secondaryFactor === "systolic") {
            secondaryValue = latestMeasurement.bloodPressureSystolic;
          } else if (secondaryFactor === "diastolic") {
            secondaryValue = latestMeasurement.bloodPressureDiastolic;
          } else if (secondaryFactor === "temperature") {
            secondaryValue = latestMeasurement.temperature;
          } else if (secondaryFactor === "oxygenSaturation") {
            secondaryValue = latestMeasurement.oxygenSaturation;
          }
        }
      }
      
      // Get outcome factor data
      if (outcomeFactor === "age") {
        outcomeValue = participant.age;
      } else if (outcomeFactor === "lengthOfStay") {
        outcomeValue = participant.lengthOfStay;
      } else if (outcomeFactor === "riskScore") {
        outcomeValue = participant.riskScore;
      } else if (outcomeFactor === "readmissionRisk") {
        outcomeValue = participant.readmissionRisk;
      } else {
        // For vital signs, get the most recent measurement
        if (participant.measurements.length > 0) {
          const latestMeasurement = participant.measurements[participant.measurements.length - 1];
          if (outcomeFactor === "heartRate") {
            outcomeValue = latestMeasurement.heartRate;
          } else if (outcomeFactor === "systolic") {
            outcomeValue = latestMeasurement.bloodPressureSystolic;
          } else if (outcomeFactor === "diastolic") {
            outcomeValue = latestMeasurement.bloodPressureDiastolic;
          } else if (outcomeFactor === "temperature") {
            outcomeValue = latestMeasurement.temperature;
          } else if (outcomeFactor === "oxygenSaturation") {
            outcomeValue = latestMeasurement.oxygenSaturation;
          }
        }
      }
      
      // Only return records with valid data for both factors
      if (primaryValue !== null && secondaryValue !== null && outcomeValue !== null) {
        return {
          id: participant.id,
          primary: primaryValue,
          secondary: secondaryValue,
          outcome: outcomeValue,
          condition: participant.condition,
          unit: participant.unit,
          gender: participant.gender,
          outcomeCategory: participant.outcome
        };
      }
      return null;
    }).filter(item => item !== null) as {
      id: string;
      primary: number;
      secondary: number;
      outcome: number;
      condition: string;
      unit: string;
      gender: string;
      outcomeCategory: string;
    }[];
  }, [data, primaryFactor, secondaryFactor, outcomeFactor]);
  
  // Calculate correlation between the factors
  const correlationResult = useMemo(() => {
    if (getFormattedRiskData.length < 3) return 0;
    const xValues = getFormattedRiskData.map(d => d.primary);
    const yValues = getFormattedRiskData.map(d => d.secondary);
    return calculateCorrelation(xValues, yValues);
  }, [getFormattedRiskData]);
  
  // Calculate linear regression between the factors
  const regressionResult = useMemo(() => {
    if (getFormattedRiskData.length < 3) return { slope: 0, intercept: 0 };
    const xValues = getFormattedRiskData.map(d => d.primary);
    const yValues = getFormattedRiskData.map(d => d.outcome);
    return linearRegression(xValues, yValues);
  }, [getFormattedRiskData]);
  
  // Prepare scatter plot data
  const scatterData = useMemo(() => {
    return getFormattedRiskData.map((item) => ({
      x: item.primary,
      y: item.secondary,
      id: item.id,
      condition: item.condition,
      unit: item.unit,
      gender: item.gender,
      outcomeCategory: item.outcomeCategory
    }));
  }, [getFormattedRiskData]);
  
  // Prepare distribution data
  const distributionData = useMemo(() => {
    // Group by condition
    const byCondition = getFormattedRiskData.reduce((acc, item) => {
      if (!acc[item.condition]) {
        acc[item.condition] = {
          condition: item.condition,
          count: 0,
          sum: 0,
          values: []
        };
      }
      acc[item.condition].count += 1;
      acc[item.condition].sum += item.primary;
      acc[item.condition].values.push(item.primary);
      return acc;
    }, {} as Record<string, { condition: string; count: number; sum: number; values: number[] }>);
    
    // Calculate average and standard deviation
    return Object.values(byCondition).map(group => {
      const avg = group.sum / group.count;
      const squaredDiffs = group.values.map(v => Math.pow(v - avg, 2));
      const avgSquaredDiff = squaredDiffs.reduce((s, v) => s + v, 0) / group.count;
      const stdDev = Math.sqrt(avgSquaredDiff);
      
      return {
        name: group.condition,
        average: parseFloat(avg.toFixed(1)),
        min: Math.min(...group.values),
        max: Math.max(...group.values),
        stdDev: parseFloat(stdDev.toFixed(1))
      };
    });
  }, [getFormattedRiskData]);
  
  // Get factor name by ID
  const getFactorName = (factorId: string) => {
    const factor = riskFactors.find(f => f.id === factorId);
    return factor ? factor.name : factorId;
  };
  
  // Get factor unit by ID
  const getFactorUnit = (factorId: string) => {
    const factor = riskFactors.find(f => f.id === factorId);
    return factor ? factor.unit : "";
  };
  
  // Correlation strength assessment
  const getCorrelationStrength = (corr: number) => {
    const absCorr = Math.abs(corr);
    if (absCorr >= 0.7) return "Strong";
    if (absCorr >= 0.5) return "Moderate";
    if (absCorr >= 0.3) return "Weak";
    return "Very weak";
  };
  
  // Correlation color assessment
  const getCorrelationColor = (corr: number) => {
    const absCorr = Math.abs(corr);
    if (absCorr >= 0.7) return "destructive";
    if (absCorr >= 0.5) return "secondary";
    if (absCorr >= 0.3) return "default";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Factor Analysis</CardTitle>
        <CardDescription>
          Analyze relationships between risk factors and outcomes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-sm font-medium">Primary Factor</label>
            <Select value={primaryFactor} onValueChange={setPrimaryFactor}>
              <SelectTrigger>
                <SelectValue placeholder="Select factor" />
              </SelectTrigger>
              <SelectContent>
                {riskFactors.map(factor => (
                  <SelectItem key={factor.id} value={factor.id}>
                    {factor.name}
                  </SelectItem>
                ))}
                <SelectItem value="riskScore">Risk Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-sm font-medium">Secondary Factor</label>
            <Select value={secondaryFactor} onValueChange={setSecondaryFactor}>
              <SelectTrigger>
                <SelectValue placeholder="Select factor" />
              </SelectTrigger>
              <SelectContent>
                {riskFactors.map(factor => (
                  <SelectItem key={factor.id} value={factor.id}>
                    {factor.name}
                  </SelectItem>
                ))}
                <SelectItem value="riskScore">Risk Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-sm font-medium">Outcome Factor</label>
            <Select value={outcomeFactor} onValueChange={setOutcomeFactor}>
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                {riskFactors.map(factor => (
                  <SelectItem key={factor.id} value={factor.id}>
                    {factor.name}
                  </SelectItem>
                ))}
                <SelectItem value="riskScore">Risk Score</SelectItem>
                <SelectItem value="readmissionRisk">Readmission Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs value={analysisType} onValueChange={(v) => setAnalysisType(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="trends">Risk Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="correlation" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-[300px]">
                <ScatterChart 
                  data={scatterData}
                  xAxis={[{ 
                    scaleType: 'linear',
                    dataKey: 'x',
                    label: `${getFactorName(primaryFactor)} (${getFactorUnit(primaryFactor)})`
                  }]}
                  yAxis={[{
                    scaleType: 'linear',
                    dataKey: 'y',
                    label: `${getFactorName(secondaryFactor)} (${getFactorUnit(secondaryFactor)})`
                  }]}
                  series={[
                    {
                      dataKey: 'id',
                      label: 'Participants',
                      valueFormatter: (value) => `ID: ${value}`
                    }
                  ]}
                  colorBy="condition"
                />
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Correlation Analysis</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Correlation coefficient:</span>{" "}
                      {correlationResult.toFixed(3)}
                    </p>
                    <p>
                      <span className="font-medium">Strength:</span>{" "}
                      <Badge variant={getCorrelationColor(correlationResult) as any}>
                        {getCorrelationStrength(correlationResult)}
                      </Badge>
                    </p>
                    <p>
                      <span className="font-medium">Direction:</span>{" "}
                      {correlationResult > 0 ? "Positive" : correlationResult < 0 ? "Negative" : "No correlation"}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Regression Analysis</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Linear model:</span>{" "}
                      {getFactorName(outcomeFactor)} = {regressionResult.slope.toFixed(2)} × {getFactorName(primaryFactor)} 
                      {regressionResult.intercept >= 0 ? " + " : " - "}
                      {Math.abs(regressionResult.intercept).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Interpretation:</span>{" "}
                      For each 1 {getFactorUnit(primaryFactor)} increase in {getFactorName(primaryFactor)}, 
                      {getFactorName(outcomeFactor)} changes by {regressionResult.slope.toFixed(2)} {getFactorUnit(outcomeFactor)}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p className="mb-1"><span className="font-medium">Analysis Insights:</span></p>
              <p>
                {correlationResult > 0.7 
                  ? `There is a strong positive correlation between ${getFactorName(primaryFactor)} and ${getFactorName(secondaryFactor)}, suggesting that as ${getFactorName(primaryFactor)} increases, ${getFactorName(secondaryFactor)} also tends to increase significantly.`
                : correlationResult < -0.7
                  ? `There is a strong negative correlation between ${getFactorName(primaryFactor)} and ${getFactorName(secondaryFactor)}, suggesting that as ${getFactorName(primaryFactor)} increases, ${getFactorName(secondaryFactor)} tends to decrease significantly.`
                : correlationResult > 0.5
                  ? `There is a moderate positive correlation between ${getFactorName(primaryFactor)} and ${getFactorName(secondaryFactor)}, suggesting some tendency for ${getFactorName(secondaryFactor)} to increase as ${getFactorName(primaryFactor)} increases.`
                : correlationResult < -0.5
                  ? `There is a moderate negative correlation between ${getFactorName(primaryFactor)} and ${getFactorName(secondaryFactor)}, suggesting some tendency for ${getFactorName(secondaryFactor)} to decrease as ${getFactorName(primaryFactor)} increases.`
                : `There is a weak or no significant correlation between ${getFactorName(primaryFactor)} and ${getFactorName(secondaryFactor)}, suggesting these factors may be largely independent.`
                }
              </p>
              <p className="mt-1">
                {Math.abs(regressionResult.slope) > 1 
                  ? `The regression analysis shows a substantial effect of ${getFactorName(primaryFactor)} on ${getFactorName(outcomeFactor)}.`
                : Math.abs(regressionResult.slope) > 0.5
                  ? `The regression analysis shows a moderate effect of ${getFactorName(primaryFactor)} on ${getFactorName(outcomeFactor)}.`
                : `The regression analysis shows a minimal effect of ${getFactorName(primaryFactor)} on ${getFactorName(outcomeFactor)}.`
                }
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="distribution">
            <div className="space-y-4">
              <div className="h-[300px]">
                <BarChart
                  data={distributionData}
                  index="name"
                  categories={["average"]}
                  valueFormatter={(value) => `${value} ${getFactorUnit(primaryFactor)}`}
                  colors={["blue"]}
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Std. Dev</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {distributionData.map((row) => (
                      <tr key={row.name}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.average} {getFactorUnit(primaryFactor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.min} {getFactorUnit(primaryFactor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.max} {getFactorUnit(primaryFactor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ±{row.stdDev} {getFactorUnit(primaryFactor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-1"><span className="font-medium">Distribution Insights:</span></p>
                <p>
                  The distribution of {getFactorName(primaryFactor)} varies across different conditions, with 
                  {distributionData.length > 0 
                    ? ` ${distributionData.sort((a, b) => b.average - a.average)[0].name} showing the highest average (${distributionData.sort((a, b) => b.average - a.average)[0].average} ${getFactorUnit(primaryFactor)})` 
                    : " no data available"
                  }.
                  {distributionData.length > 0 
                    ? ` The condition with highest variability is ${distributionData.sort((a, b) => b.stdDev - a.stdDev)[0].name} (±${distributionData.sort((a, b) => b.stdDev - a.stdDev)[0].stdDev} ${getFactorUnit(primaryFactor)}).` 
                    : ""
                  }
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                This analysis shows how {getFactorName(primaryFactor)} relates to risk outcomes across different patient groups.
              </div>
              
              <div className="h-[300px]">
                <LineChart
                  data={getFormattedRiskData}
                  index="primary"
                  categories={["outcome"]}
                  valueFormatter={(value) => `${value}`}
                  colors={["red"]}
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-1"><span className="font-medium">Trend Insights:</span></p>
                <p>
                  {regressionResult.slope > 0.1
                    ? `There is a positive trend between ${getFactorName(primaryFactor)} and ${getFactorName(outcomeFactor)}, indicating that higher ${getFactorName(primaryFactor)} is associated with higher ${getFactorName(outcomeFactor)}.`
                  : regressionResult.slope < -0.1
                    ? `There is a negative trend between ${getFactorName(primaryFactor)} and ${getFactorName(outcomeFactor)}, indicating that higher ${getFactorName(primaryFactor)} is associated with lower ${getFactorName(outcomeFactor)}.`
                    : `There does not appear to be a significant trend between ${getFactorName(primaryFactor)} and ${getFactorName(outcomeFactor)}.`
                  }
                  {Math.abs(regressionResult.slope) > 0.5
                    ? ` This relationship appears substantial and may have clinical significance.`
                    : ` While a relationship exists, its clinical significance may be limited.`
                  }
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RiskFactorAnalysis;
