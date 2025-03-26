
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegressionControlsProps {
  outcomeVariable: string;
  setOutcomeVariable: (variable: string) => void;
  selectedPredictors: string[];
  handlePredictorToggle: (predictor: string) => void;
  variableOptions: { value: string; label: string }[];
}

const RegressionControls: React.FC<RegressionControlsProps> = ({
  outcomeVariable,
  setOutcomeVariable,
  selectedPredictors,
  handlePredictorToggle,
  variableOptions
}) => {
  return (
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
  );
};

export default RegressionControls;
