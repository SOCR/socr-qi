
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart } from "@/components/ui/chart";
import QualityScoreTrend from "@/components/QualityScoreTrend";

interface EnhancedQualityMetricsProps {
  data: any[];
  hasDeepPhenotypingData: boolean;
}

const EnhancedQualityMetrics: React.FC<EnhancedQualityMetricsProps> = ({ data, hasDeepPhenotypingData }) => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<any>(null);
  const [focusMetric, setFocusMetric] = useState<string>("qualityOfLife");
  const [groupBy, setGroupBy] = useState<string>("unit");

  const calculateQualityMetrics = () => {
    // Basic metrics
    const improvementRate = data.filter(p => p.outcome === "Improved").length / data.length;
    const avgLOS = data.reduce((sum, p) => sum + p.lengthOfStay, 0) / data.length;
    
    // Treatment effectiveness
    const treatmentEffectiveness = data.flatMap(p => p.treatments).reduce((sum, t) => sum + t.effectiveness, 0) / 
      data.flatMap(p => p.treatments).length;
    
    // Group metrics
    const byUnit = groupDataByField("unit");
    const byCondition = groupDataByField("condition");
    const byGender = groupDataByField("gender");
    
    // Deep phenotype metrics if available
    let deepPhenotypeMetrics = {};
    if (hasDeepPhenotypingData) {
      const qualityOfLifeByUnit = groupDeepPhenotypeDataByField("unit", "deepPhenotype.qualityOfLifeScore");
      const satisfactionByUnit = groupDeepPhenotypeDataByField("unit", "deepPhenotype.patientSatisfactionScore");
      const symptomBurdenByUnit = groupDeepPhenotypeDataByField("unit", "deepPhenotype.symptomBurden");
      
      const adlByCondition = groupDeepPhenotypeDataByField("condition", "deepPhenotype.adlScore");
      const mentalHealthByCondition = groupDeepPhenotypeDataByField("condition", "deepPhenotype.mentalHealthScore");
      
      deepPhenotypeMetrics = {
        qualityOfLifeByUnit,
        satisfactionByUnit,
        symptomBurdenByUnit,
        adlByCondition,
        mentalHealthByCondition,
        
        // Composite scores
        patientWellnessScore: calculateCompositeScore([
          "deepPhenotype.qualityOfLifeScore", 
          "deepPhenotype.patientSatisfactionScore"
        ]),
        functionalStatusScore: calculateCompositeScore([
          "deepPhenotype.functionalStatus.physicalFunction",
          "deepPhenotype.functionalStatus.mobility",
          "deepPhenotype.functionalStatus.adlIndependence"
        ]),
        outcomesImpactScore: correlateOutcomeWithMetrics()
      };
    }
    
    setMetrics({
      basic: {
        improvementRate: (improvementRate * 100).toFixed(1),
        avgLOS: avgLOS.toFixed(1),
        treatmentEffectiveness: treatmentEffectiveness.toFixed(1),
      },
      grouped: {
        byUnit,
        byCondition,
        byGender
      },
      deepPhenotype: deepPhenotypeMetrics
    });
    
    toast({
      title: "Quality Metrics Calculated",
      description: "Quality improvement metrics have been calculated successfully."
    });
  };
  
  // Helper function to group data by a field
  const groupDataByField = (field: string) => {
    const groupedData: Record<string, any[]> = {};
    
    data.forEach(item => {
      const key = item[field];
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item);
    });
    
    return Object.entries(groupedData).map(([name, items]) => {
      const avgRiskScore = items.reduce((sum, item) => sum + item.riskScore, 0) / items.length;
      const avgLOS = items.reduce((sum, item) => sum + item.lengthOfStay, 0) / items.length;
      const improvementRate = items.filter(item => item.outcome === "Improved").length / items.length;
      
      return {
        name,
        count: items.length,
        avgRiskScore: avgRiskScore.toFixed(1),
        avgLOS: avgLOS.toFixed(1),
        improvementRate: (improvementRate * 100).toFixed(1)
      };
    });
  };
  
  // Helper to access nested properties
  const safelyGetNestedValue = (obj: any, path: string) => {
    try {
      return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
    } catch (e) {
      return null;
    }
  };
  
  // Group deep phenotype data by a field
  const groupDeepPhenotypeDataByField = (field: string, metricPath: string) => {
    const groupedData: Record<string, any[]> = {};
    
    data.forEach(item => {
      const key = item[field];
      const value = safelyGetNestedValue(item, metricPath);
      
      if (value !== null) {
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push({ ...item, metricValue: value });
      }
    });
    
    return Object.entries(groupedData).map(([name, items]) => {
      const avgMetric = items.reduce((sum, item) => sum + item.metricValue, 0) / items.length;
      
      return {
        name,
        count: items.length,
        value: avgMetric.toFixed(1)
      };
    });
  };
  
  // Calculate a composite score from multiple metrics
  const calculateCompositeScore = (metricPaths: string[]) => {
    const scores: Record<string, number> = {};
    
    data.forEach(item => {
      let validMetrics = 0;
      let sum = 0;
      
      metricPaths.forEach(path => {
        const value = safelyGetNestedValue(item, path);
        if (value !== null) {
          sum += value;
          validMetrics++;
        }
      });
      
      if (validMetrics > 0) {
        const unit = item.unit;
        if (!scores[unit]) {
          scores[unit] = { total: 0, count: 0 };
        }
        scores[unit].total += (sum / validMetrics);
        scores[unit].count++;
      }
    });
    
    return Object.entries(scores).map(([name, score]) => ({
      name,
      value: (score.total / score.count).toFixed(1)
    }));
  };
  
  // Analyze correlation between outcomes and metrics
  const correlateOutcomeWithMetrics = () => {
    const outcomes: Record<string, any> = {
      "Improved": { count: 0, metrics: {} },
      "Stable": { count: 0, metrics: {} },
      "Deteriorated": { count: 0, metrics: {} }
    };
    
    const metricPaths = [
      "deepPhenotype.qualityOfLifeScore",
      "deepPhenotype.patientSatisfactionScore",
      "deepPhenotype.symptomBurden"
    ];
    
    data.forEach(item => {
      if (outcomes[item.outcome]) {
        outcomes[item.outcome].count++;
        
        metricPaths.forEach(path => {
          const value = safelyGetNestedValue(item, path);
          if (value !== null) {
            if (!outcomes[item.outcome].metrics[path]) {
              outcomes[item.outcome].metrics[path] = { sum: 0, count: 0 };
            }
            outcomes[item.outcome].metrics[path].sum += value;
            outcomes[item.outcome].metrics[path].count++;
          }
        });
      }
    });
    
    const result = [];
    Object.entries(outcomes).forEach(([outcome, data]) => {
      Object.entries(data.metrics).forEach(([metric, values]) => {
        const metricName = metric.split('.').pop() || metric;
        if (values.count > 0) {
          result.push({
            outcome,
            metric: metricName,
            value: (values.sum / values.count).toFixed(1)
          });
        }
      });
    });
    
    return result;
  };
  
  // Get chart data based on the current selections
  const getChartData = () => {
    if (!metrics) return [];
    
    // Basic metrics by group
    if (focusMetric === "improvementRate") {
      return metrics.grouped[`by${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`].map((item: any) => ({
        name: item.name,
        value: parseFloat(item.improvementRate)
      }));
    }
    
    if (focusMetric === "avgLOS") {
      return metrics.grouped[`by${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`].map((item: any) => ({
        name: item.name,
        value: parseFloat(item.avgLOS)
      }));
    }
    
    if (focusMetric === "riskScore") {
      return metrics.grouped[`by${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`].map((item: any) => ({
        name: item.name,
        value: parseFloat(item.avgRiskScore)
      }));
    }
    
    // Deep phenotype metrics
    if (hasDeepPhenotypingData && metrics.deepPhenotype) {
      if (focusMetric === "qualityOfLife") {
        return metrics.deepPhenotype.qualityOfLifeByUnit;
      }
      
      if (focusMetric === "satisfaction") {
        return metrics.deepPhenotype.satisfactionByUnit;
      }
      
      if (focusMetric === "symptomBurden") {
        return metrics.deepPhenotype.symptomBurdenByUnit;
      }
      
      if (focusMetric === "adl") {
        return metrics.deepPhenotype.adlByCondition;
      }
      
      if (focusMetric === "mentalHealth") {
        return metrics.deepPhenotype.mentalHealthByCondition;
      }
      
      if (focusMetric === "patientWellness") {
        return metrics.deepPhenotype.patientWellnessScore;
      }
      
      if (focusMetric === "functionalStatus") {
        return metrics.deepPhenotype.functionalStatusScore;
      }
    }
    
    return [];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Quality Metrics</CardTitle>
          <CardDescription>
            Comprehensive quality improvement metrics with deep phenotyping insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={calculateQualityMetrics} className="w-full">
            Calculate Enhanced QI Metrics
          </Button>
          
          {metrics && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{metrics.basic.improvementRate}%</div>
                      <p className="text-sm text-gray-600 mt-1">Patient Improvement Rate</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{metrics.basic.avgLOS}</div>
                      <p className="text-sm text-gray-600 mt-1">Avg. Length of Stay (days)</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{metrics.basic.treatmentEffectiveness}%</div>
                      <p className="text-sm text-gray-600 mt-1">Treatment Effectiveness</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="metrics" className="w-full">
                <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
                  <TabsTrigger value="metrics">Core Metrics</TabsTrigger>
                  <TabsTrigger value="comparison">Comparisons</TabsTrigger>
                  {hasDeepPhenotypingData && (
                    <TabsTrigger value="deep">Deep Phenotyping</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="metrics">
                  <QualityScoreTrend />
                </TabsContent>
                
                <TabsContent value="comparison">
                  <div className="space-y-4 mt-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-1/2">
                        <Label htmlFor="metric-select">Select Metric</Label>
                        <Select
                          value={focusMetric}
                          onValueChange={setFocusMetric}
                        >
                          <SelectTrigger id="metric-select">
                            <SelectValue placeholder="Select metric" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="improvementRate">Improvement Rate</SelectItem>
                            <SelectItem value="avgLOS">Length of Stay</SelectItem>
                            <SelectItem value="riskScore">Risk Score</SelectItem>
                            {hasDeepPhenotypingData && (
                              <>
                                <SelectItem value="qualityOfLife">Quality of Life</SelectItem>
                                <SelectItem value="satisfaction">Patient Satisfaction</SelectItem>
                                <SelectItem value="symptomBurden">Symptom Burden</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-full sm:w-1/2">
                        <Label htmlFor="group-select">Group By</Label>
                        <Select
                          value={groupBy}
                          onValueChange={setGroupBy}
                        >
                          <SelectTrigger id="group-select">
                            <SelectValue placeholder="Group by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unit">Clinical Unit</SelectItem>
                            <SelectItem value="condition">Medical Condition</SelectItem>
                            <SelectItem value="gender">Gender</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          {focusMetric === "improvementRate" && "Improvement Rate (%)"}
                          {focusMetric === "avgLOS" && "Average Length of Stay (days)"}
                          {focusMetric === "riskScore" && "Average Risk Score"}
                          {focusMetric === "qualityOfLife" && "Average Quality of Life Score"}
                          {focusMetric === "satisfaction" && "Average Patient Satisfaction"}
                          {focusMetric === "symptomBurden" && "Average Symptom Burden"}
                          {" by "} 
                          {groupBy === "unit" && "Clinical Unit"}
                          {groupBy === "condition" && "Medical Condition"}
                          {groupBy === "gender" && "Gender"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <BarChart
                            data={getChartData()}
                            index="name"
                            categories={["value"]}
                            valueFormatter={(value) => `${value}`}
                            colors={["blue"]}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {hasDeepPhenotypingData && (
                  <TabsContent value="deep">
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="deep-metric-select">Select Deep Phenotype Metric</Label>
                        <Select
                          value={focusMetric}
                          onValueChange={setFocusMetric}
                        >
                          <SelectTrigger id="deep-metric-select">
                            <SelectValue placeholder="Select metric" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patientWellness">Patient Wellness Score</SelectItem>
                            <SelectItem value="functionalStatus">Functional Status</SelectItem>
                            <SelectItem value="adl">ADL Score</SelectItem>
                            <SelectItem value="mentalHealth">Mental Health Score</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            {focusMetric === "patientWellness" && "Patient Wellness Score"}
                            {focusMetric === "functionalStatus" && "Functional Status Score"}
                            {focusMetric === "adl" && "Activities of Daily Living Score"}
                            {focusMetric === "mentalHealth" && "Mental Health Score"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <BarChart
                              data={getChartData()}
                              index="name"
                              categories={["value"]}
                              valueFormatter={(value) => `${value}`}
                              colors={["green"]}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      
                      {metrics.deepPhenotype.outcomesImpactScore && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              Deep Phenotype Metrics by Patient Outcome
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <BarChart
                                data={metrics.deepPhenotype.outcomesImpactScore}
                                index="metric"
                                categories={["value"]}
                                valueFormatter={(value) => `${value}`}
                                colors={["indigo"]}
                                layout="vertical"
                                stack
                                stackLabel="outcome"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedQualityMetrics;
