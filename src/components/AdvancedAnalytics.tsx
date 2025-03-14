
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
import CorrelationAnalysis from "./analytics/CorrelationAnalysis";
import ClusteringAnalysis from "./analytics/ClusteringAnalysis";

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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedAnalytics;
