
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { RegressionResult, multipleLinearRegression } from "@/utils/analyticsUtils";
import { variableOptions, deepPhenotypeVariableOptions } from "@/components/analytics/AdvancedAnalyticsContainer";
import RegressionControls from "./RegressionControls";
import RegressionAnalysis from "./RegressionAnalysis";

// Helper to safely access nested properties
const getNestedValue = (obj: any, path: string) => {
  try {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  } catch (e) {
    return undefined;
  }
};

interface CustomRegressionControlsProps {
  data: any[];
  hasDeepPhenotypingData: boolean;
}

const CustomRegressionControls: React.FC<CustomRegressionControlsProps> = ({ 
  data,
  hasDeepPhenotypingData
}) => {
  const { toast } = useToast();
  const [outcomeVariable, setOutcomeVariable] = useState("lengthOfStay");
  const [selectedPredictors, setSelectedPredictors] = useState<string[]>(["age", "riskScore"]);
  const [regressionResults, setRegressionResults] = useState<RegressionResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  
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
  
  const runRegressionAnalysis = () => {
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
      
      const regressionResult = multipleLinearRegression(transformedData, outcomeVariable, selectedPredictors);
      setRegressionResults(regressionResult);
      setShowResults(true);
      
      toast({
        title: "Regression Analysis Complete",
        description: `Linear model for ${outcomeVariable} with ${selectedPredictors.length} predictors fitted successfully.`
      });
    } catch (error) {
      console.error("Regression error:", error);
      toast({
        title: "Analysis Error",
        description: "Error running regression analysis. Check console for details.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Regression Analysis</CardTitle>
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
            onClick={runRegressionAnalysis} 
            className="w-full mt-4"
          >
            Run Regression Analysis
          </Button>
        </CardContent>
      </Card>
      
      {showResults && regressionResults && (
        <RegressionAnalysis 
          regressionResults={regressionResults}
          outcomeVariable={outcomeVariable}
          selectedPredictors={selectedPredictors}
          variableOptions={allVariableOptions}
        />
      )}
    </div>
  );
};

export default CustomRegressionControls;
