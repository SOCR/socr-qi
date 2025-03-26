
import React from "react";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CorrelationControlsProps {
  xVariable: string;
  setXVariable: (variable: string) => void;
  yVariable: string;
  setYVariable: (variable: string) => void;
  variableOptions: { value: string; label: string }[];
}

const CorrelationControls: React.FC<CorrelationControlsProps> = ({
  xVariable,
  setXVariable,
  yVariable,
  setYVariable,
  variableOptions
}) => {
  return (
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
  );
};

export default CorrelationControls;
