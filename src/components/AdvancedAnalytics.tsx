
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
import { ScatterChart } from "./ScatterChart";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// K-means clustering (simplified)
const kMeansClustering = (data: any[], k: number, features: string[]) => {
  // Extract feature values
  const featureValues = data.map(item => 
    features.map(feature => item[feature])
  );
  
  // Randomly initialize centroids
  let centroids = Array.from({ length: k }, () => {
    const randomIndex = Math.floor(Math.random() * featureValues.length);
    return featureValues[randomIndex];
  });
  
  // Assign points to clusters
  const assignments = featureValues.map(point => {
    const distances = centroids.map(centroid => 
      Math.sqrt(
        features.reduce((sum, _, i) => 
          sum + Math.pow(point[i] - centroid[i], 2), 0
        )
      )
    );
    return distances.indexOf(Math.min(...distances));
  });
  
  // Return cluster assignments and centroid locations
  return {
    assignments,
    centroids
  };
};

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
  
  const variableOptions = [
    { value: "age", label: "Age" },
    { value: "riskScore", label: "Risk Score" },
    { value: "lengthOfStay", label: "Length of Stay" },
    { value: "readmissionRisk", label: "Readmission Risk" }
  ];
  
  const runAnalysis = () => {
    if (analysisType === "correlation") {
      // Extract the variables from data
      const xValues = data.map(p => p[xVariable]);
      const yValues = data.map(p => p[yVariable]);
      
      // Run correlation and regression
      const correlationValue = calculateCorrelation(xValues, yValues);
      const regression = linearRegression(xValues, yValues);
      
      // Prepare scatter plot data
      const scatterData = data.map(p => ({
        x: p[xVariable],
        y: p[yVariable],
        id: p.id,
        outcome: p.outcome
      }));
      
      // Generate regression line points
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const regressionPoints = [
        { x: minX, y: regression.slope * minX + regression.intercept },
        { x: maxX, y: regression.slope * maxX + regression.intercept }
      ];
      
      setResults({
        type: "correlation",
        correlationValue,
        regression,
        scatterData,
        regressionPoints,
        xVariable,
        yVariable
      });
      
      toast({
        title: "Analysis Complete",
        description: `Correlation between ${xVariable} and ${yVariable}: ${correlationValue.toFixed(3)}`
      });
    } 
    else if (analysisType === "clustering") {
      // Extract features for clustering
      const clusterData = data.map(p => ({
        id: p.id,
        [clusterVariable1]: p[clusterVariable1],
        [clusterVariable2]: p[clusterVariable2],
        outcome: p.outcome
      }));
      
      // Run k-means clustering
      const clusters = kMeansClustering(
        clusterData, 
        numClusters,
        [clusterVariable1, clusterVariable2]
      );
      
      // Add cluster assignments to data points
      const clusterResults = clusterData.map((point, i) => ({
        ...point,
        cluster: clusters.assignments[i]
      }));
      
      setResults({
        type: "clustering",
        clusters: clusterResults,
        numClusters,
        variable1: clusterVariable1,
        variable2: clusterVariable2,
        centroids: clusters.centroids
      });
      
      toast({
        title: "Clustering Complete",
        description: `K-means clustering with ${numClusters} clusters completed successfully.`
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
            ) : (
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
            )}
          </div>
        </div>
        
        <Button onClick={runAnalysis} className="w-full">
          Run Analysis
        </Button>
        
        {results && (
          <div className="mt-8 space-y-6">
            {results.type === "correlation" && (
              <>
                <Alert>
                  <AlertTitle>Correlation Analysis Results</AlertTitle>
                  <AlertDescription>
                    The correlation between {variableOptions.find(v => v.value === results.xVariable)?.label} and {" "}
                    {variableOptions.find(v => v.value === results.yVariable)?.label} is{" "}
                    <strong>{results.correlationValue.toFixed(3)}</strong>.
                    {Math.abs(results.correlationValue) > 0.7 && " This indicates a strong relationship."}
                    {Math.abs(results.correlationValue) > 0.4 && Math.abs(results.correlationValue) <= 0.7 && " This indicates a moderate relationship."}
                    {Math.abs(results.correlationValue) <= 0.4 && " This indicates a weak relationship."}
                  </AlertDescription>
                </Alert>
                
                <ScatterChart
                  data={results.scatterData}
                  xAxis={variableOptions.find(v => v.value === results.xVariable)?.label || results.xVariable}
                  yAxis={variableOptions.find(v => v.value === results.yVariable)?.label || results.yVariable}
                  regressionLine={results.regressionPoints}
                  height={350}
                />
                
                <div className="text-sm">
                  <p>
                    <strong>Regression Equation:</strong>{" "}
                    {variableOptions.find(v => v.value === results.yVariable)?.label} = {results.regression.slope.toFixed(3)} × {variableOptions.find(v => v.value === results.xVariable)?.label} {results.regression.intercept >= 0 ? "+" : ""} {results.regression.intercept.toFixed(3)}
                  </p>
                  <p className="mt-2">
                    This suggests that for each unit increase in {variableOptions.find(v => v.value === results.xVariable)?.label}, 
                    {variableOptions.find(v => v.value === results.yVariable)?.label} changes by approximately {results.regression.slope.toFixed(3)} units.
                  </p>
                </div>
              </>
            )}
            
            {results.type === "clustering" && (
              <>
                <Alert>
                  <AlertTitle>Clustering Results</AlertTitle>
                  <AlertDescription>
                    K-means clustering identified {results.numClusters} distinct patient groups based on {" "}
                    {variableOptions.find(v => v.value === results.variable1)?.label} and{" "}
                    {variableOptions.find(v => v.value === results.variable2)?.label}.
                  </AlertDescription>
                </Alert>
                
                <ScatterChart
                  data={results.clusters.map((p: any) => ({
                    x: p[results.variable1],
                    y: p[results.variable2],
                    id: p.id,
                    outcome: p.outcome,
                    cluster: p.cluster
                  }))}
                  xAxis={variableOptions.find(v => v.value === results.variable1)?.label || results.variable1}
                  yAxis={variableOptions.find(v => v.value === results.variable2)?.label || results.variable2}
                  colorByCluster={true}
                  height={350}
                />
                
                <div className="text-sm">
                  <p>
                    <strong>Cluster Analysis:</strong> The scatter plot shows distinct patient clusters based on 
                    the selected variables. These clusters may represent different patient phenotypes or risk groups.
                  </p>
                  <p className="mt-2">
                    Consider investigating what clinical characteristics are common within each cluster, 
                    as this may provide insights for targeted quality improvement interventions.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedAnalytics;
