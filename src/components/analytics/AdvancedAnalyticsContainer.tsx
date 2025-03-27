
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

// Basic variable options
const basicVariableOptions = [
  { value: "age", label: "Age", group: "Basic" },
  { value: "riskScore", label: "Risk Score", group: "Basic" },
  { value: "lengthOfStay", label: "Length of Stay", group: "Basic" },
  { value: "readmissionRisk", label: "Readmission Risk", group: "Basic" }
];

const AdvancedAnalyticsContainer = () => {
  const { data } = useData();
  const { toast } = useToast();
  const [analysisType, setAnalysisType] = useState("correlation");
  const [results, setResults] = useState<any>(null);
  const [variableOptions, setVariableOptions] = useState(basicVariableOptions);
  
  // Check if deep phenotyping data is available
  const hasDeepPhenotypingData = data.some(participant => participant.deepPhenotype);
  
  // Update variable options when data changes, incorporating deep phenotyping data if available
  useEffect(() => {
    let options = [...basicVariableOptions];
    
    if (hasDeepPhenotypingData) {
      // Add demographic variables
      options = [
        ...options,
        { value: "deepPhenotype.qualityOfLifeScore", label: "Quality of Life Score", group: "Patient-Reported Outcomes" },
        { value: "deepPhenotype.patientSatisfactionScore", label: "Patient Satisfaction", group: "Patient-Reported Outcomes" },
        { value: "deepPhenotype.symptomBurden", label: "Symptom Burden", group: "Patient-Reported Outcomes" },
        { value: "deepPhenotype.mentalHealthScore", label: "Mental Health Score", group: "Patient-Reported Outcomes" },
        
        { value: "deepPhenotype.medicationAdherenceRate", label: "Medication Adherence", group: "Treatment" },
        { value: "deepPhenotype.treatmentCompletionRate", label: "Treatment Completion", group: "Treatment" },
        
        { value: "deepPhenotype.edVisitsPerYear", label: "ED Visits/Year", group: "Healthcare Utilization" },
        { value: "deepPhenotype.hospitalizationsPerYear", label: "Hospitalizations/Year", group: "Healthcare Utilization" },
        { value: "deepPhenotype.primaryCareVisitsPerYear", label: "PCP Visits/Year", group: "Healthcare Utilization" },
        
        { value: "deepPhenotype.totalCostOfCare", label: "Total Cost of Care", group: "Cost & Resources" },
        
        { value: "deepPhenotype.timeToFollowUp", label: "Time to Follow-up", group: "Care Coordination" },
        
        { value: "deepPhenotype.functionalStatus.physicalFunction", label: "Physical Function", group: "Functional Status" },
        { value: "deepPhenotype.functionalStatus.mobility", label: "Mobility", group: "Functional Status" },
        { value: "deepPhenotype.functionalStatus.cognitiveFunction", label: "Cognitive Function", group: "Functional Status" },
        { value: "deepPhenotype.functionalStatus.frailtyIndex", label: "Frailty Index", group: "Functional Status" },
      ];
    }
    
    setVariableOptions(options);
  }, [data, hasDeepPhenotypingData]);
  
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
        const regressionResult = multipleLinearRegression(data, outcomeVariable, selectedPredictors);
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
    else if (analysisType === "deepPhenotype" && hasDeepPhenotypingData) {
      // For deep phenotype analysis, we'll also use correlation for now
      setResults({
        type: "correlation",
        xVariable,
        yVariable,
        isDeepPhenotype: true
      });
      
      toast({
        title: "Deep Phenotype Analysis Complete",
        description: `Analysis between ${xVariable} and ${yVariable} completed`
      });
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
            {(analysisType === "correlation" || analysisType === "deepPhenotype") && (
              <CorrelationControls
                xVariable={xVariable}
                setXVariable={setXVariable}
                yVariable={yVariable}
                setYVariable={setYVariable}
                variableOptions={variableOptions}
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
                variableOptions={variableOptions}
              />
            )}
            
            {analysisType === "regression" && (
              <RegressionControls
                outcomeVariable={outcomeVariable}
                setOutcomeVariable={setOutcomeVariable}
                selectedPredictors={selectedPredictors}
                handlePredictorToggle={handlePredictorToggle}
                variableOptions={variableOptions}
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
                variableOptions={variableOptions}
                isDeepPhenotype={results.isDeepPhenotype}
              />
            )}
            
            {results.type === "clustering" && (
              <ClusteringAnalysis
                data={data}
                variable1={results.variable1}
                variable2={results.variable2}
                numClusters={results.numClusters}
                variableOptions={variableOptions}
              />
            )}
            
            {results.type === "regression" && regressionResults && (
              <RegressionAnalysis 
                regressionResults={regressionResults}
                outcomeVariable={outcomeVariable}
                selectedPredictors={selectedPredictors}
                variableOptions={variableOptions}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedAnalyticsContainer;
