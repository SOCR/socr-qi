
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { BarChart, PieChart } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { variableOptions, deepPhenotypeVariableOptions } from "@/components/analytics/AdvancedAnalyticsContainer";
import RegressionControls from "./RegressionControls";
import { multipleLinearRegression, calculateCorrelation, RegressionResult } from "@/utils/analyticsUtils";

// Helper to safely access nested properties
const getNestedValue = (obj: any, path: string) => {
  try {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  } catch (e) {
    return undefined;
  }
};

interface CustomRiskFactorAnalysisProps {
  data: any[];
  hasDeepPhenotypingData: boolean;
}

const CustomRiskFactorAnalysis: React.FC<CustomRiskFactorAnalysisProps> = ({ 
  data, 
  hasDeepPhenotypingData 
}) => {
  const { toast } = useToast();
  const [riskFactorsResults, setRiskFactorsResults] = useState<any>(null);
  const [outcomeVariable, setOutcomeVariable] = useState("readmissionRisk");
  const [selectedPredictors, setSelectedPredictors] = useState<string[]>(["riskScore", "age"]);
  const [regressionResults, setRegressionResults] = useState<RegressionResult | null>(null);
  
  // Combine variable options based on data availability
  const allVariableOptions = hasDeepPhenotypingData
    ? [...variableOptions, ...deepPhenotypeVariableOptions]
    : variableOptions;

  const handlePredictorToggle = (predictor: string) => {
    if (selectedPredictors.includes(predictor)) {
      setSelectedPredictors(selectedPredictors.filter(p => p !== predictor));
    } else {
      setSelectedPredictors([...selectedPredictors, predictor]);
    }
  };
  
  const findVariableLabel = (value: string) => {
    const option = allVariableOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };
  
  const runRiskFactorAnalysis = () => {
    if (selectedPredictors.length === 0) {
      toast({
        title: "Analysis Error",
        description: "Please select at least one predictor variable",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Transform the data if needed for deep phenotype variables
      const transformedData = data.map(participant => {
        const transformedParticipant: Record<string, any> = { ...participant };
        
        // For each deep phenotype variable that might be selected, flatten it
        deepPhenotypeVariableOptions.forEach(option => {
          if (option.value.includes('deepPhenotype.')) {
            transformedParticipant[option.value] = getNestedValue(participant, option.value);
          }
        });
        
        return transformedParticipant;
      });
      
      // Calculate main outcome values
      const outcomeValues = transformedData.map(p => p[outcomeVariable]);
      
      // Calculate correlations for each predictor
      const correlations = selectedPredictors.map(predictor => {
        const predictorValues = transformedData.map(p => p[predictor]);
        const correlation = calculateCorrelation(predictorValues, outcomeValues);
        return {
          name: findVariableLabel(predictor),
          value: parseFloat(correlation.toFixed(2)),
          predictor
        };
      }).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
      
      // Run the regression analysis
      const regressionResult = multipleLinearRegression(transformedData, outcomeVariable, selectedPredictors);
      setRegressionResults(regressionResult);
      
      // Prepare outcome distribution data for pie chart
      const outcomeDistribution = Object.entries(
        data.reduce((acc, p) => {
          acc[p.outcome] = (acc[p.outcome] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }));
      
      // Set results
      setRiskFactorsResults({
        correlations,
        outcomeDistribution,
        outcomeVariable,
        selectedPredictors
      });
      
      toast({
        title: "Risk Factor Analysis Complete",
        description: `Analysis for ${findVariableLabel(outcomeVariable)} with ${selectedPredictors.length} risk factors completed successfully.`
      });
    } catch (error) {
      console.error("Risk factor analysis error:", error);
      toast({
        title: "Analysis Error",
        description: "Error running risk factor analysis. Check console for details.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Risk Factor Analysis</CardTitle>
          <CardDescription>
            Analyze the relationship between risk factors and patient outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegressionControls
            outcomeVariable={outcomeVariable}
            setOutcomeVariable={setOutcomeVariable}
            selectedPredictors={selectedPredictors}
            handlePredictorToggle={handlePredictorToggle}
            variableOptions={allVariableOptions}
          />
          
          <Button 
            onClick={runRiskFactorAnalysis} 
            className="w-full mt-4"
          >
            Analyze Risk Factors
          </Button>
          
          {riskFactorsResults && (
            <div className="mt-6 space-y-6">
              <Alert>
                <AlertTitle>Analysis Results</AlertTitle>
                <AlertDescription>
                  Analysis of {findVariableLabel(outcomeVariable)} shows 
                  {riskFactorsResults.correlations.length > 0 ? 
                    ` ${Math.abs(riskFactorsResults.correlations[0].value) > 0.5 ? 'strong' : 
                      Math.abs(riskFactorsResults.correlations[0].value) > 0.3 ? 'moderate' : 'weak'} 
                    correlation with ${riskFactorsResults.correlations[0].name} (${riskFactorsResults.correlations[0].value.toFixed(2)})` : 
                    ' no strong correlations with selected predictors'}.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="correlations">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="correlations">Correlations</TabsTrigger>
                  <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
                  <TabsTrigger value="regression">Regression</TabsTrigger>
                </TabsList>
                
                <TabsContent value="correlations">
                  <Card>
                    <CardHeader>
                      <CardTitle>Correlation Strengths</CardTitle>
                      <CardDescription>
                        Correlation between {findVariableLabel(outcomeVariable)} and selected risk factors
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      <BarChart
                        data={riskFactorsResults.correlations.map((c: any) => ({
                          name: c.name,
                          value: Math.abs(c.value)
                        }))}
                        index="name"
                        categories={["value"]}
                        colors={["blue"]}
                        valueFormatter={(value) => `${value.toFixed(2)}`}
                        layout="vertical"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="outcomes">
                  <Card>
                    <CardHeader>
                      <CardTitle>Outcome Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      <PieChart
                        data={riskFactorsResults.outcomeDistribution}
                        index="name"
                        categoryKey="value"
                        valueFormatter={(value) => `${value} patients`}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="regression">
                  {regressionResults && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Regression Model</h3>
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="font-mono text-sm">
                          {findVariableLabel(outcomeVariable)} = {regressionResults.intercept.toFixed(2)}
                          {regressionResults.coefficients.map(coef => 
                            ` ${coef.value >= 0 ? '+' : ''} ${coef.value.toFixed(2)} × ${findVariableLabel(coef.name)}`
                          )}
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-1">Model Quality:</h4>
                        <p className="text-sm">R² = {regressionResults.rSquared.toFixed(3)}</p>
                        <p className="text-sm">Adjusted R² = {regressionResults.adjustedRSquared.toFixed(3)}</p>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-1">Significant Predictors:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {regressionResults.coefficients
                            .filter(coef => coef.pValue < 0.05)
                            .map((coef, i) => (
                              <li key={i}>
                                {findVariableLabel(coef.name)} (p = {coef.pValue.toFixed(4)})
                              </li>
                            ))
                          }
                          {regressionResults.coefficients.filter(coef => coef.pValue < 0.05).length === 0 && (
                            <li>No statistically significant predictors found (p &lt; 0.05)</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomRiskFactorAnalysis;
