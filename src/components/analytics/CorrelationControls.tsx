
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData } from "@/context/DataContext";

interface CorrelationControlsProps {
  xVariable: string;
  setXVariable: (variable: string) => void;
  yVariable: string;
  setYVariable: (variable: string) => void;
  variableOptions: { value: string; label: string; group?: string }[];
}

const CorrelationControls: React.FC<CorrelationControlsProps> = ({
  xVariable,
  setXVariable,
  yVariable,
  setYVariable,
  variableOptions
}) => {
  // Group options by category if they have groups
  const hasGroups = variableOptions.some(option => option.group);
  
  // Create groups object if needed
  const groups = hasGroups ? 
    variableOptions.reduce((acc, option) => {
      const group = option.group || "Other";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(option);
      return acc;
    }, {} as Record<string, typeof variableOptions>) : {};
    
  // Get unique group names in a sorted order
  const groupNames = hasGroups ? 
    Object.keys(groups).sort((a, b) => {
      // Put "Basic" and "Demographics" at the top, followed by alphabetical
      if (a === "Basic") return -1;
      if (b === "Basic") return 1;
      if (a === "Demographics") return -1;
      if (b === "Demographics") return 1;
      return a.localeCompare(b);
    }) : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            {hasGroups ? (
              groupNames.map(groupName => (
                <SelectGroup key={groupName}>
                  <SelectLabel>{groupName}</SelectLabel>
                  {groups[groupName].map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))
            ) : (
              variableOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            )}
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
            {hasGroups ? (
              groupNames.map(groupName => (
                <SelectGroup key={groupName}>
                  <SelectLabel>{groupName}</SelectLabel>
                  {groups[groupName].map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))
            ) : (
              variableOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CorrelationControls;
