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
import { Button } from "@/components/ui/button";
import NoDataMessage from "@/components/NoDataMessage";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PieChart, BarChart } from "@/components/ui/chart";
import QualityScoreTrend from "@/components/QualityScoreTrend";

// Simple analytics functions
const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n === 0) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumXSq = x.reduce((acc, val) => acc + val * val, 0);
  const sumYSq = y.reduce((acc, val) => acc + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXSq - sumX * sumX) * (n * sumYSq - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

// Simple linear regression
const linearRegression = (x: number[], y: number[]) => {
  const n = x.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumXSq = x.reduce((acc, val) => acc + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXSq - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

const Analytics = () => {
  const { data, isDataLoaded } = useData();
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [riskFactorsResults, setRiskFactorsResults] = useState<any>(null);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  
  if (!isDataLoaded) {
    return <NoDataMessage />;
  }

  const runRiskFactorAnalysis = () => {
    // Calculate correlations between risk factors and outcomes
    const riskScores = data.map(p => p.riskScore);
    const lengthsOfStay = data.map(p => p.lengthOfStay);
    const readmissionRisks = data.map(p => p.readmissionRisk);
    
    // Convert outcomes to numerical values for correlation calculation
    const outcomeValues = data.map(p => {
      switch(p.outcome) {
        case "Improved": return 1;
        case "Stable": return 2;
        case "Deteriorated": return 3;
        case "Transferred": return 4;
        case "Deceased": return 5;
        default: return 0;
      }
    });
    
    // Calculate correlations
    const riskScoreOutcomeCorr = calculateCorrelation(riskScores, outcomeValues);
    const riskScoreLOSCorr = calculateCorrelation(riskScores, lengthsOfStay);
    const readmissionRiskOutcomeCorr = calculateCorrelation(readmissionRisks, outcomeValues);
    
    // Set results
    setRiskFactorsResults({
      correlations: [
        { name: "Risk Score vs Outcome", value: riskScoreOutcomeCorr },
        { name: "Risk Score vs Length of Stay", value: riskScoreLOSCorr },
        { name: "Readmission Risk vs Outcome", value: readmissionRiskOutcomeCorr },
      ],
      regression: linearRegression(riskScores, lengthsOfStay),
      outcome_distribution: [
        { name: "Improved", value: data.filter(p => p.outcome === "Improved").length },
        { name: "Stable", value: data.filter(p => p.outcome === "Stable").length },
        { name: "Deteriorated", value: data.filter(p => p.outcome === "Deteriorated").length },
        { name: "Transferred", value: data.filter(p => p.outcome === "Transferred").length },
        { name: "Deceased", value: data.filter(p => p.outcome === "Deceased").length },
      ],
    });
  };

  const runStatisticalAnalysis = () => {
    // Calculate average measurements for each unit
    const unitMeasurements: Record<string, { bp: number[], hr: number[], o2: number[] }> = {};
    
    data.forEach(p => {
      if (!unitMeasurements[p.unit]) {
        unitMeasurements[p.unit] = { bp: [], hr: [], o2: [] };
      }
      
      p.measurements.forEach(m => {
        unitMeasurements[p.unit].bp.push(m.bloodPressureSystolic);
        unitMeasurements[p.unit].hr.push(m.heartRate);
        unitMeasurements[p.unit].o2.push(m.oxygenSaturation);
      });
    });
    
    const unitStats = Object.entries(unitMeasurements).map(([unit, measurements]) => {
      const avgBP = measurements.bp.reduce((a, b) => a + b, 0) / measurements.bp.length;
      const avgHR = measurements.hr.reduce((a, b) => a + b, 0) / measurements.hr.length;
      const avgO2 = measurements.o2.reduce((a, b) => a + b, 0) / measurements.o2.length;
      
      return {
        unit,
        avgBP: avgBP.toFixed(1),
        avgHR: avgHR.toFixed(1),
        avgO2: avgO2.toFixed(1),
      };
    });
    
    // Calculate treatment effectiveness by condition
    const treatmentEffectiveness: Record<string, number[]> = {};
    
    data.forEach(p => {
      p.treatments.forEach(t => {
        if (!treatmentEffectiveness[t.name]) {
          treatmentEffectiveness[t.name] = [];
        }
        treatmentEffectiveness[t.name].push(t.effectiveness);
      });
    });
    
    const treatmentStats = Object.entries(treatmentEffectiveness).map(([treatment, scores]) => {
      const avgEffectiveness = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        treatment,
        avgEffectiveness: avgEffectiveness.toFixed(1),
        count: scores.length,
      };
    });
    
    // Set results
    setAnalysisResults({
      unitStats,
      treatmentStats,
    });
  };

  const calculateQualityMetrics = () => {
    // Calculate quality improvement metrics
    
    // 1. Improvement Rate (% of patients who improved)
    const improvementRate = data.filter(p => p.outcome === "Improved").length / data.length;
    
    // 2. Average Length of Stay
    const avgLOS = data.reduce((sum, p) => sum + p.lengthOfStay, 0) / data.length;
    
    // 3. Readmission Risk by Unit
    const unitReadmissionRisk: Record<string, number[]> = {};
    data.forEach(p => {
      if (!unitReadmissionRisk[p.unit]) {
        unitReadmissionRisk[p.unit] = [];
      }
      unitReadmissionRisk[p.unit].push(p.readmissionRisk);
    });
    
    const unitRiskScores = Object.entries(unitReadmissionRisk).map(([unit, risks]) => {
      const avgRisk = risks.reduce((a, b) => a + b, 0) / risks.length;
      return { unit, avgRisk: avgRisk.toFixed(1) };
    });
    
    // 4. Treatment Effectiveness Score
    const treatmentEffectiveness = data.flatMap(p => p.treatments).reduce((sum, t) => sum + t.effectiveness, 0) / 
      data.flatMap(p => p.treatments).length;
    
    setQualityMetrics({
      improvementRate: (improvementRate * 100).toFixed(1),
      avgLOS: avgLOS.toFixed(1),
      unitRiskScores,
      treatmentEffectiveness: treatmentEffectiveness.toFixed(1),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quantitative Analytics</h1>
      
      <Tabs defaultValue="statistics">
        <TabsList className="w-full">
          <TabsTrigger value="statistics">Statistical Analysis</TabsTrigger>
          <TabsTrigger value="riskfactors">Risk Factors</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistical Analysis</CardTitle>
              <CardDescription>
                Analyze vital signs, treatments and outcomes statistically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runStatisticalAnalysis}>Run Statistical Analysis</Button>

              {analysisResults && (
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Clinical Unit Statistics</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 border-b">
                            <th className="px-4 py-2 text-left font-medium">Clinical Unit</th>
                            <th className="px-4 py-2 text-left font-medium">Avg. Blood Pressure</th>
                            <th className="px-4 py-2 text-left font-medium">Avg. Heart Rate</th>
                            <th className="px-4 py-2 text-left font-medium">Avg. O₂ Saturation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResults.unitStats.map((stat: any, i: number) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{stat.unit}</td>
                              <td className="px-4 py-2">{stat.avgBP}</td>
                              <td className="px-4 py-2">{stat.avgHR}</td>
                              <td className="px-4 py-2">{stat.avgO2}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Treatment Effectiveness</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 border-b">
                            <th className="px-4 py-2 text-left font-medium">Treatment</th>
                            <th className="px-4 py-2 text-left font-medium">Avg. Effectiveness</th>
                            <th className="px-4 py-2 text-left font-medium">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResults.treatmentStats.map((stat: any, i: number) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{stat.treatment}</td>
                              <td className="px-4 py-2">{stat.avgEffectiveness}%</td>
                              <td className="px-4 py-2">{stat.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="riskfactors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Factor Analysis</CardTitle>
              <CardDescription>
                Analyze the relationship between risk factors and patient outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runRiskFactorAnalysis}>Analyze Risk Factors</Button>

              {riskFactorsResults && (
                <div className="mt-6 space-y-6">
                  <Alert>
                    <AlertTitle>Analysis Results</AlertTitle>
                    <AlertDescription>
                      The analysis shows a correlation of {riskFactorsResults.correlations[0].value.toFixed(2)} between 
                      risk scores and outcomes, and {riskFactorsResults.correlations[1].value.toFixed(2)} between 
                      risk scores and length of stay.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Correlation Strengths</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[250px]">
                        <BarChart
                          data={riskFactorsResults.correlations.map((c: any) => ({
                            name: c.name,
                            value: parseFloat(Math.abs(c.value).toFixed(2))
                          }))}
                          index="name"
                          categories={["value"]}
                          colors={["blue"]}
                          valueFormatter={(value) => `${value.toFixed(2)}`}
                          layout="vertical"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Outcome Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[250px]">
                        <PieChart
                          data={riskFactorsResults.outcome_distribution}
                          index="name"
                          categoryKey="value"
                          valueFormatter={(value) => `${value} patients`}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Regression Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Length of Stay = {riskFactorsResults.regression.slope.toFixed(2)} × Risk Score + {riskFactorsResults.regression.intercept.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      This suggests that for each point increase in risk score, length of stay increases by approximately {riskFactorsResults.regression.slope.toFixed(2)} days.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Improvement Metrics</CardTitle>
              <CardDescription>
                Measure and analyze healthcare quality improvement indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={calculateQualityMetrics}>Calculate QI Metrics</Button>

              {qualityMetrics && (
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">{qualityMetrics.improvementRate}%</div>
                          <p className="text-sm text-gray-600 mt-1">Improvement Rate</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">{qualityMetrics.avgLOS}</div>
                          <p className="text-sm text-gray-600 mt-1">Avg. Length of Stay (days)</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">{qualityMetrics.treatmentEffectiveness}%</div>
                          <p className="text-sm text-gray-600 mt-1">Treatment Effectiveness</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <QualityScoreTrend />

                  <div>
                    <h3 className="text-lg font-medium mb-3">Readmission Risk by Unit</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 border-b">
                            <th className="px-4 py-2 text-left font-medium">Clinical Unit</th>
                            <th className="px-4 py-2 text-left font-medium">Avg. Readmission Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualityMetrics.unitRiskScores.map((stat: any, i: number) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{stat.unit}</td>
                              <td className="px-4 py-2">{stat.avgRisk}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
