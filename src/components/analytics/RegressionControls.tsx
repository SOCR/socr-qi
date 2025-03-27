
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RegressionControlsProps {
  outcomeVariable: string;
  setOutcomeVariable: (variable: string) => void;
  selectedPredictors: string[];
  handlePredictorToggle: (predictor: string) => void;
  variableOptions: { value: string; label: string; group?: string }[];
}

const RegressionControls: React.FC<RegressionControlsProps> = ({
  outcomeVariable,
  setOutcomeVariable,
  selectedPredictors,
  handlePredictorToggle,
  variableOptions
}) => {
  // Group variables by their group property
  const groupedVariables = variableOptions.reduce((acc, option) => {
    const group = option.group || "Basic";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, typeof variableOptions>);

  // Handle selecting all predictors in a group
  const handleSelectAllInGroup = (group: string, select: boolean) => {
    const groupVariables = groupedVariables[group];
    groupVariables
      .filter(option => option.value !== outcomeVariable)
      .forEach(option => {
        const isCurrentlySelected = selectedPredictors.includes(option.value);
        if (select && !isCurrentlySelected) {
          handlePredictorToggle(option.value);
        } else if (!select && isCurrentlySelected) {
          handlePredictorToggle(option.value);
        }
      });
  };

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
        
        <Accordion type="multiple" className="w-full">
          {Object.entries(groupedVariables).map(([group, variables]) => {
            const groupVariablesExcludingOutcome = variables.filter(v => v.value !== outcomeVariable);
            const selectedInGroup = selectedPredictors.filter(p => 
              groupVariablesExcludingOutcome.some(v => v.value === p)).length;
            const allInGroupSelected = selectedInGroup === groupVariablesExcludingOutcome.length && 
              groupVariablesExcludingOutcome.length > 0;
            
            return (
              <AccordionItem key={group} value={group}>
                <AccordionTrigger className="py-2 px-3 hover:bg-gray-50 text-sm">
                  {group} Variables {selectedInGroup > 0 && 
                    `(${selectedInGroup}/${groupVariablesExcludingOutcome.length} selected)`}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mb-2 flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSelectAllInGroup(group, !allInGroupSelected)}
                      className="text-xs"
                    >
                      {allInGroupSelected ? "Deselect All" : "Select All"}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {selectedInGroup}/{groupVariablesExcludingOutcome.length} selected
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
                    {variables
                      .filter(option => option.value !== outcomeVariable)
                      .map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`predictor-${option.value}`}
                            checked={selectedPredictors.includes(option.value)}
                            onCheckedChange={() => handlePredictorToggle(option.value)}
                          />
                          <Label 
                            htmlFor={`predictor-${option.value}`}
                            className="text-sm"
                          >
                            {option.label}
                          </Label>
                        </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        
        <div className="mt-2 text-sm text-muted-foreground">
          {selectedPredictors.length} predictors selected
        </div>
      </div>
    </div>
  );
};

export default RegressionControls;
