
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import CorrelationAnalysis from "./analytics/CorrelationAnalysis";
import ClusteringAnalysis from "./analytics/ClusteringAnalysis";
import { multipleLinearRegression, RegressionResult } from "@/utils/analyticsUtils";

const AdvancedAnalytics = () => {
  const { data } = useData();
  const { toast } = useToast();
  const [analysisType, setAnalysisType] = useState("correlation");
  const [xVariable, setXVariable] = useState("age");
  const [yVariable, setYVariable] = useState("lengthOfStay");
  const [clusterVariable1, setClusterVariable1] = useState("riskScore");
  const [clusterVariable2, setClusterVariable2] = useState("lengthOfStay");
  const [numClusters, setNumClusters] = useState(3);
  const [results, setResults] = useState<any>(null);
  
  // Linear Regression specific state
  const [outcomeVariable, setOutcomeVariable] = useState("lengthOfStay");
  const [selectedPredictors, setSelectedPredictors] = useState<string[]>(["age", "riskScore"]);
  const [regressionResults, setRegressionResults] = useState<RegressionResult | null>(null);
  
  const variableOptions = [
    { value: "age", label: "Age" },
    { value: "riskScore", label: "Risk Score" },
    { value: "lengthOfStay", label: "Length of Stay" },
    { value: "readmissionRisk", label: "Readmission Risk" }
  ];
  
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
  };
  
  // Function to format p-values with significance stars
  const formatPValue = (pValue: number) => {
    let stars = '';
    if (pValue < 0.001) stars = '***';
    else if (pValue < 0.01) stars = '**';
    else if (pValue < 0.05) stars = '*';
    
    return `${pValue.toFixed(4)}${stars}`;
  };
  
  // Function to format coefficient values
  const formatCoef = (value: number) => {
    return value.toFixed(4);
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
            <Label htmlFor="analysis-type">Analysis Type</Label>
            <Select 
              value={analysisType} 
              onValueChange={setAnalysisType}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select analysis type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="correlation">Correlation & Regression</SelectItem>
                <SelectItem value="clustering">K-Means Clustering</SelectItem>
                <SelectItem value="regression">Linear Regression Model</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-2/3">
            {analysisType === "correlation" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="x-variable">X Variable</Label>
                  <Select 
                    value={xVariable} 
                    onValueChange={setXVariable}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select X variable" />
                    </SelectTrigger>
                    <SelectContent>
                      {variableOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="y-variable">Y Variable</Label>
                  <Select 
                    value={yVariable} 
                    onValueChange={setYVariable}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Y variable" />
                    </SelectTrigger>
                    <SelectContent>
                      {variableOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : analysisType === "clustering" ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cluster-var1">Variable 1</Label>
                  <Select 
                    value={clusterVariable1} 
                    onValueChange={setClusterVariable1}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select variable 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {variableOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cluster-var2">Variable 2</Label>
                  <Select 
                    value={clusterVariable2} 
                    onValueChange={setClusterVariable2}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select variable 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {variableOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="num-clusters">Number of Clusters</Label>
                  <Select 
                    value={numClusters.toString()} 
                    onValueChange={(val) => setNumClusters(Number(val))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select clusters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Clusters</SelectItem>
                      <SelectItem value="3">3 Clusters</SelectItem>
                      <SelectItem value="4">4 Clusters</SelectItem>
                      <SelectItem value="5">5 Clusters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="outcome-variable">Outcome Variable</Label>
                  <Select 
                    value={outcomeVariable} 
                    onValueChange={setOutcomeVariable}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select outcome variable" />
                    </SelectTrigger>
                    <SelectContent>
                      {variableOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block mb-2">Predictor Variables</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {variableOptions
                      .filter(option => option.value !== outcomeVariable)
                      .map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`predictor-${option.value}`}
                            checked={selectedPredictors.includes(option.value)}
                            onCheckedChange={() => handlePredictorToggle(option.value)}
                          />
                          <Label htmlFor={`predictor-${option.value}`}>{option.label}</Label>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
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
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Linear Regression Model</CardTitle>
                    <CardDescription>
                      Modeling {variableOptions.find(v => v.value === outcomeVariable)?.label || outcomeVariable} 
                      using {selectedPredictors.length} predictor{selectedPredictors.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium">Model Summary</h3>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">R²</p>
                            <p className="text-lg font-medium">{regressionResults.rSquared.toFixed(3)}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">Adjusted R²</p>
                            <p className="text-lg font-medium">{regressionResults.adjustedRSquared.toFixed(3)}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">F-statistic</p>
                            <p className="text-lg font-medium">{regressionResults.fStat.toFixed(2)}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">Observations</p>
                            <p className="text-lg font-medium">{regressionResults.observations}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Model Equation</h3>
                        <p className="mt-2 p-3 bg-gray-100 rounded font-mono text-sm overflow-x-auto">
                          {outcomeVariable} = {regressionResults.intercept.toFixed(2)}
                          {regressionResults.coefficients.map(coef => 
                            ` ${coef.value >= 0 ? '+' : ''} ${coef.value.toFixed(2)} × ${coef.name}`
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Coefficients</h3>
                        <div className="mt-2 overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variable</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coefficient</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Std. Error</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">t-statistic</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">p-value</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">(Intercept)</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCoef(regressionResults.intercept)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
                              </tr>
                              {regressionResults.coefficients.map((coef, index) => (
                                <tr key={index} className={coef.pValue < 0.05 ? "bg-blue-50" : ""}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {variableOptions.find(v => v.value === coef.name)?.label || coef.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCoef(coef.value)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCoef(coef.standardError)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCoef(coef.tStat)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatPValue(coef.pValue)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="mt-3 text-xs text-gray-500">Significance codes: *** p&lt;0.001, ** p&lt;0.01, * p&lt;0.05</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Interpretation</h3>
                        <div className="mt-2 p-4 bg-gray-50 rounded-md">
                          <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>
                              The model explains <strong>{(regressionResults.rSquared * 100).toFixed(1)}%</strong> of 
                              the variance in {variableOptions.find(v => v.value === outcomeVariable)?.label || outcomeVariable} 
                              (R² = {regressionResults.rSquared.toFixed(3)}).
                            </li>
                            <li>
                              The overall model is 
                              {regressionResults.fStatPValue < 0.05 ? 
                                <strong className="text-green-600"> statistically significant</strong> :
                                <strong className="text-red-600"> not statistically significant</strong>}
                              {regressionResults.fStatPValue < 0.05 ? 
                                ` (F = ${regressionResults.fStat.toFixed(2)}, p < 0.05).` :
                                ` (F = ${regressionResults.fStat.toFixed(2)}, p > 0.05).`}
                            </li>
                            {regressionResults.coefficients
                              .filter(coef => coef.pValue < 0.05)
                              .map((coef, index) => (
                                <li key={index}>
                                  <strong>{variableOptions.find(v => v.value === coef.name)?.label || coef.name}</strong> has a 
                                  {coef.value > 0 ? " positive" : " negative"} and statistically significant effect 
                                  (β = {coef.value.toFixed(3)}, p {coef.pValue < 0.001 ? "< 0.001" : coef.pValue < 0.01 ? "< 0.01" : "< 0.05"}).
                                </li>
                            ))}
                            {regressionResults.coefficients
                              .filter(coef => coef.pValue >= 0.05)
                              .length > 0 && (
                                <li>
                                  The following variables did not have a statistically significant effect: 
                                  {regressionResults.coefficients
                                    .filter(coef => coef.pValue >= 0.05)
                                    .map(coef => variableOptions.find(v => v.value === coef.name)?.label || coef.name)
                                    .join(", ")}.
                                </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedAnalytics;
