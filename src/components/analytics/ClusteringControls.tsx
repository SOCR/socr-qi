
import React from "react";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClusteringControlsProps {
  clusterVariable1: string;
  setClusterVariable1: (variable: string) => void;
  clusterVariable2: string;
  setClusterVariable2: (variable: string) => void;
  numClusters: number;
  setNumClusters: (num: number) => void;
  variableOptions: { value: string; label: string }[];
}

const ClusteringControls: React.FC<ClusteringControlsProps> = ({
  clusterVariable1,
  setClusterVariable1,
  clusterVariable2,
  setClusterVariable2,
  numClusters,
  setNumClusters,
  variableOptions
}) => {
  return (
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
  );
};

export default ClusteringControls;
