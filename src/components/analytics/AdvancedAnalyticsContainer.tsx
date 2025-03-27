
import React, { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AnalysisTypeSelector from "./AnalysisTypeSelector";
import CorrelationControls from "./CorrelationControls";
import ClusteringControls from "./ClusteringControls";
import RegressionControls from "./RegressionControls";
import CorrelationAnalysis from "./CorrelationAnalysis";
import ClusteringAnalysis from "./ClusteringAnalysis";
import RegressionAnalysis from "./RegressionAnalysis";
import { RegressionResult, multipleLinearRegression } from "@/utils/analyticsUtils";

// Basic variable options that are always available
export const variableOptions = [
  { value: "age", label: "Age", group: "Basic" },
  { value: "riskScore", label: "Risk Score", group: "Basic" },
  { value: "lengthOfStay", label: "Length of Stay", group: "Basic" },
  { value: "readmissionRisk", label: "Readmission Risk", group: "Basic" }
];

// Deep phenotyping variable options
export const deepPhenotypeVariableOptions = [
  // Demographics
  { value: "deepPhenotype.qualityOfLifeScore", label: "Quality of Life Score", group: "Patient-Reported" },
  { value: "deepPhenotype.patientSatisfactionScore", label: "Patient Satisfaction", group: "Patient-Reported" },
  { value: "deepPhenotype.symptomBurden", label: "Symptom Burden", group: "Patient-Reported" },
  { value: "deepPhenotype.adlScore", label: "ADL Score", group: "Patient-Reported" },
  { value: "deepPhenotype.mentalHealthScore", label: "Mental Health Score", group: "Patient-Reported" },
  
  // Healthcare utilization
  { value: "deepPhenotype.edVisitsPerYear", label: "ED Visits Per Year", group: "Healthcare Utilization" },
  { value: "deepPhenotype.hospitalizationsPerYear", label: "Hospitalizations Per Year", group: "Healthcare Utilization" },
  { value: "deepPhenotype.primaryCareVisitsPerYear", label: "PCP Visits Per Year", group: "Healthcare Utilization" },
  
  // Treatment
  { value: "deepPhenotype.medicationAdherenceRate", label: "Medication Adherence", group: "Treatment" },
  { value: "deepPhenotype.adverseDrugEventRisk", label: "Adverse Drug Event Risk", group: "Treatment" },
  { value: "deepPhenotype.treatmentCompletionRate", label: "Treatment Completion Rate", group: "Treatment" },
  
  // Cost & Resource measures
  { value: "deepPhenotype.totalCostOfCare", label: "Total Cost of Care", group: "Cost & Resources" },
  { value: "deepPhenotype.costPerEpisode", label: "Cost Per Episode", group: "Cost & Resources" },
  
  // Longitudinal measures
  { value: "deepPhenotype.functionalStatus.physicalFunction", label: "Physical Function", group: "Functional Status" },
  { value: "deepPhenotype.functionalStatus.mobility", label: "Mobility", group: "Functional Status" },
  { value: "deepPhenotype.functionalStatus.adlIndependence", label: "ADL Independence", group: "Functional Status" },
  { value: "deepPhenotype.functionalStatus.cognitiveFunction", label: "Cognitive Function", group: "Functional Status" },
  { value: "deepPhenotype.functionalStatus.frailtyIndex", label: "Frailty Index", group: "Functional Status" },
  
  // Disease specific measures
  { value: "deepPhenotype.diseaseSpecificMeasures.hba1c", label: "HbA1c", group: "Disease-Specific" },
  { value: "deepPhenotype.diseaseSpecificMeasures.lipidProfileLDL", label: "LDL Cholesterol", group: "Disease-Specific" },
  { value: "deepPhenotype.diseaseSpecificMeasures.lipidProfileHDL", label: "HDL Cholesterol", group: "Disease-Specific" },
  { value: "deepPhenotype.diseaseSpecificMeasures.depressionPHQ9", label: "Depression PHQ-9", group: "Disease-Specific" }
];

// Helper to safely access nested properties
const getNestedValue = (obj: any, path: string) => {
  try {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  } catch (e) {
    return undefined;
  }
};

const AdvancedAnalyticsContainer = () => {
  const { data } = useData();
  const { toast } = useToast();
  const [analysisType, setAnalysisType] = useState("correlation");
  const [results, setResults] = useState<any>(null);
  
  // Check if deep phenotyping data is available
  const hasDeepPhenotypingData = data.some(participant => participant.deepPhenotype);
  
  // Combine variable options based on data availability
  const [allVariableOptions, setAllVariableOptions] = useState(variableOptions);
  
  useEffect(() => {
    if (hasDeepPhenotypingData) {
      setAllVariableOptions([...variableOptions, ...deepPhenotypeVariableOptions]);
    } else {
      setAllVariableOptions(variableOptions);
    }
  }, [hasDeepPhenotypingData]);
  
  // Correlation state
  const [xVariable, setXVariable] = useState("age");
  const [yVariable, setYVariable] = useState("lengthOfStay");
  
  // Clustering state
  const [clusterVariable1, setClusterVariable1] = useState("riskScore");
  const [clusterVariable2, setClusterVariable2] = useState("lengthOfStay");
  const [numClusters, setNumClusters] = useState(3);
  
  // Regression state
  const [outcomeVariable, setOutcomeVariable] = useState("lengthOfStay");
  const [selectedPredictors, setSelectedPredictors] = useState<string[]>(["age", "riskScore"]);
  const [regressionResults, setRegressionResults] = useState<RegressionResult | null>(null);
  
  const handlePredictorToggle = (predictor: string) => {
    if (selectedPredictors.includes(predictor)) {
      setSelectedPredictors(selectedPredictors.filter(p => p !== predictor));
    } else {
      setSelectedPredictors([...selectedPredictors, predictor]);
    }
  };
  
  const runAnalysis = () => {
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
    
    if (analysisType === "correlation") {
      setResults({
        type: "correlation",
        xVariable,
        yVariable
      });
      
      toast({
        title: "Analysis Complete",
        description: `Correlation analysis between ${xVariable} and ${yVariable} completed`
      });
    } 
    else if (analysisType === "clustering") {
      setResults({
        type: "clustering",
        variable1: clusterVariable1,
        variable2: clusterVariable2,
        numClusters,
      });
      
      toast({
        title: "Clustering Complete",
        description: `K-means clustering with ${numClusters} clusters completed successfully.`
      });
    }
    else if (analysisType === "regression") {
      if (selectedPredictors.length === 0) {
        toast({
          title: "Analysis Error",
          description: "Please select at least one predictor variable",
          variant: "destructive"
        });
        return;
      }
      
      try {
        const regressionResult = multipleLinearRegression(transformedData, outcomeVariable, selectedPredictors);
        setRegressionResults(regressionResult);
        
        setResults({
          type: "regression",
          outcomeVariable,
          predictors: selectedPredictors
        });
        
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
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Statistical Analysis</CardTitle>
        <CardDescription>
          Perform multivariate statistical analysis on participant data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-1/3">
            <AnalysisTypeSelector 
              analysisType={analysisType} 
              setAnalysisType={setAnalysisType} 
            />
          </div>
          
          <div className="w-full sm:w-2/3">
            {analysisType === "correlation" && (
              <CorrelationControls
                xVariable={xVariable}
                setXVariable={setXVariable}
                yVariable={yVariable}
                setYVariable={setYVariable}
                variableOptions={allVariableOptions}
              />
            )}
            
            {analysisType === "clustering" && (
              <ClusteringControls
                clusterVariable1={clusterVariable1}
                setClusterVariable1={setClusterVariable1}
                clusterVariable2={clusterVariable2}
                setClusterVariable2={setClusterVariable2}
                numClusters={numClusters}
                setNumClusters={setNumClusters}
                variableOptions={allVariableOptions}
              />
            )}
            
            {analysisType === "regression" && (
              <RegressionControls
                outcomeVariable={outcomeVariable}
                setOutcomeVariable={setOutcomeVariable}
                selectedPredictors={selectedPredictors}
                handlePredictorToggle={handlePredictorToggle}
                variableOptions={allVariableOptions}
              />
            )}
          </div>
        </div>
        
        <Button onClick={runAnalysis} className="w-full">
          Run Analysis
        </Button>
        
        {results && (
          <div className="mt-8 space-y-6">
            {results.type === "correlation" && (
              <CorrelationAnalysis 
                data={data}
                xVariable={results.xVariable}
                yVariable={results.yVariable}
                variableOptions={allVariableOptions}
              />
            )}
            
            {results.type === "clustering" && (
              <ClusteringAnalysis
                data={data}
                variable1={results.variable1}
                variable2={results.variable2}
                numClusters={results.numClusters}
                variableOptions={allVariableOptions}
              />
            )}
            
            {results.type === "regression" && regressionResults && (
              <RegressionAnalysis 
                regressionResults={regressionResults}
                outcomeVariable={outcomeVariable}
                selectedPredictors={selectedPredictors}
                variableOptions={allVariableOptions}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedAnalyticsContainer;
