
import React from "react";
import { kMeansClustering } from "@/utils/analyticsUtils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ScatterChart from "@/components/ScatterChart";

interface ClusteringAnalysisProps {
  data: any[];
  variable1: string;
  variable2: string;
  numClusters: number;
  variableOptions: { value: string; label: string }[];
}

const ClusteringAnalysis: React.FC<ClusteringAnalysisProps> = ({
  data,
  variable1,
  variable2,
  numClusters,
  variableOptions
}) => {
  // Extract features for clustering
  const clusterData = data.map(p => ({
    id: p.id,
    [variable1]: p[variable1],
    [variable2]: p[variable2],
    outcome: p.outcome
  }));
  
  // Run k-means clustering
  const clusters = kMeansClustering(
    clusterData, 
    numClusters,
    [variable1, variable2]
  );
  
  // Add cluster assignments to data points
  const clusterResults = clusterData.map((point, i) => ({
    ...point,
    cluster: clusters.assignments[i]
  }));
  
  return (
    <>
      <Alert>
        <AlertTitle>Clustering Results</AlertTitle>
        <AlertDescription>
          K-means clustering identified {numClusters} distinct patient groups based on {" "}
          {variableOptions.find(v => v.value === variable1)?.label} and{" "}
          {variableOptions.find(v => v.value === variable2)?.label}.
        </AlertDescription>
      </Alert>
      
      <ScatterChart
        data={clusterResults.map((p: any) => ({
          x: p[variable1],
          y: p[variable2],
          id: p.id,
          outcome: p.outcome,
          cluster: p.cluster
        }))}
        xAxis={variableOptions.find(v => v.value === variable1)?.label || variable1}
        yAxis={variableOptions.find(v => v.value === variable2)?.label || variable2}
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
  );
};

export default ClusteringAnalysis;
