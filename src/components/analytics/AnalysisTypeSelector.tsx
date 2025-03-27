
import React from "react";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData } from "@/context/DataContext";

interface AnalysisTypeSelectorProps {
  analysisType: string;
  setAnalysisType: (type: string) => void;
}

const AnalysisTypeSelector: React.FC<AnalysisTypeSelectorProps> = ({
  analysisType,
  setAnalysisType
}) => {
  const { data } = useData();
  
  // Check if any participant has deep phenotyping data
  const hasDeepPhenotypingData = data.some(participant => participant.deepPhenotype);

  return (
    <div>
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
          {hasDeepPhenotypingData && (
            <SelectItem value="deepPhenotype">Deep Phenotype Analysis</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AnalysisTypeSelector;
