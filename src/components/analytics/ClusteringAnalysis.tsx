
import React, { useMemo } from 'react';
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScatterChart from "@/components/ScatterChart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ClusteringAnalysisProps {
  variable1: string;
  variable2: string;
  numClusters: number;
  variableOptions: { value: string; label: string }[];
}

const ClusteringAnalysis: React.FC<ClusteringAnalysisProps> = ({
  variable1,
  variable2,
  numClusters,
  variableOptions
}) => {
  const { data } = useData();
  
  // Get label for selected variables
  const variable1Label = variableOptions.find(o => o.value === variable1)?.label || variable1;
  const variable2Label = variableOptions.find(o => o.value === variable2)?.label || variable2;
  
  // Prepare data and perform k-means clustering
  const clusterData = useMemo(() => {
    // Extract the data points
    const points = data.map(p => ({
      id: p.id,
      x: p[variable1 as keyof typeof p],
      y: p[variable2 as keyof typeof p],
      outcome: p.outcome,
      condition: p.condition,
      unit: p.unit,
      gender: p.gender
    })).filter(p => p.x !== null && p.y !== null);
    
    if (points.length < numClusters) {
      return points.map(p => ({ ...p, cluster: 0 }));
    }
    
    // Simple K-means clustering implementation
    // 1. Initialize random centroids
    let centroids = Array(numClusters).fill(0).map(() => {
      const randomIndex = Math.floor(Math.random() * points.length);
      return { x: points[randomIndex].x, y: points[randomIndex].y };
    });
    
    // 2. Assign points to clusters and update centroids (repeat 10 times)
    for (let iter = 0; iter < 10; iter++) {
      // Assign each point to nearest centroid
      const clusters = Array(numClusters).fill(0).map(() => []);
      
      points.forEach(point => {
        let minDist = Infinity;
        let closestCluster = 0;
        
        centroids.forEach((centroid, i) => {
          const dist = Math.sqrt(
            Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
          );
          
          if (dist < minDist) {
            minDist = dist;
            closestCluster = i;
          }
        });
        
        clusters[closestCluster].push(point);
      });
      
      // Update centroids
      clusters.forEach((cluster, i) => {
        if (cluster.length > 0) {
          const sumX = cluster.reduce((sum, p) => sum + p.x, 0);
          const sumY = cluster.reduce((sum, p) => sum + p.y, 0);
          centroids[i] = { 
            x: sumX / cluster.length, 
            y: sumY / cluster.length 
          };
        }
      });
    }
    
    // Assign final clusters to data points
    return points.map(point => {
      let minDist = Infinity;
      let cluster = 0;
      
      centroids.forEach((centroid, i) => {
        const dist = Math.sqrt(
          Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
        );
        
        if (dist < minDist) {
          minDist = dist;
          cluster = i;
        }
      });
      
      return { ...point, cluster };
    });
  }, [data, variable1, variable2, numClusters]);
  
  // Count points in each cluster
  const clusterStats = useMemo(() => {
    const stats = {};
    
    clusterData.forEach(point => {
      const clusterKey = `Cluster ${point.cluster}`;
      if (!stats[clusterKey]) {
        stats[clusterKey] = { count: 0, points: [] };
      }
      stats[clusterKey].count += 1;
      stats[clusterKey].points.push(point);
    });
    
    return stats;
  }, [clusterData]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>K-Means Clustering Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>K-Means clustering with {numClusters} clusters</strong>
            <br />
            <span className="text-sm">
              Clustering based on {variable1Label} and {variable2Label}
            </span>
          </AlertDescription>
        </Alert>
        
        <div>
          <ScatterChart
            data={clusterData}
            xAxisKey="x"
            yAxisKey="y"
            xAxisLabel={variable1Label}
            yAxisLabel={variable2Label}
            tooltipLabel="Cluster Analysis"
            height={350}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(clusterStats).map(([clusterName, stats]: [string, any]) => (
            <Card key={clusterName} className="overflow-hidden">
              <div 
                className="h-2" 
                style={{ backgroundColor: `hsl(${(parseInt(clusterName.split(' ')[1]) * 60) % 360}, 70%, 50%)` }}
              />
              <CardContent className="pt-4">
                <h3 className="font-medium">{clusterName}</h3>
                <p className="text-sm text-muted-foreground">
                  Points: {stats.count} 
                  ({Math.round(stats.count / clusterData.length * 100)}% of total)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <p className="text-sm text-muted-foreground">
          This scatter plot shows how participants cluster based on {variable1Label} and {variable2Label}.
          The color of each point represents its assigned cluster. Points in the same cluster have
          similar values for these two variables.
        </p>
      </CardContent>
    </Card>
  );
};

export default ClusteringAnalysis;
