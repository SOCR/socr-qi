
import React, { useState } from "react";
import { Participant } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MultipleSelect from "./ui/multiple-select";

export interface MultiParticipantChartControlsProps {
  selectedParticipantIds: string[];
  setSelectedParticipantIds: (ids: string[]) => void;
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
  compareToConditionMean: boolean;
  setCompareToConditionMean: (compare: boolean) => void;
  compareToUnitMean: boolean;
  setCompareToUnitMean: (compare: boolean) => void;
  selectedConditions: string[];
  setSelectedConditions: (conditions: string[]) => void;
  selectedUnits: string[];
  setSelectedUnits: (units: string[]) => void;
  showConfidenceBands: boolean;
  setShowConfidenceBands: (show: boolean) => void;
  data?: Participant[];
}

const MetricOptions = [
  { value: "heartRate", label: "Heart Rate" },
  { value: "systolic", label: "Systolic BP" },
  { value: "diastolic", label: "Diastolic BP" },
  { value: "oxygenSaturation", label: "Oxygen Saturation" },
  { value: "temperature", label: "Temperature" },
];

const MultiParticipantChartControls: React.FC<MultiParticipantChartControlsProps> = ({
  selectedParticipantIds,
  setSelectedParticipantIds,
  selectedMetric,
  setSelectedMetric,
  compareToConditionMean,
  setCompareToConditionMean,
  compareToUnitMean,
  setCompareToUnitMean,
  selectedConditions,
  setSelectedConditions,
  selectedUnits,
  setSelectedUnits,
  showConfidenceBands,
  setShowConfidenceBands,
  data = [],
}) => {
  const [selectionMode, setSelectionMode] = useState<"participants" | "conditions" | "units">("participants");
  
  // Get unique conditions and units
  const conditions = React.useMemo(() => {
    return Array.from(new Set(data.map(p => p.condition))).sort();
  }, [data]);
  
  const units = React.useMemo(() => {
    return Array.from(new Set(data.map(p => p.unit))).sort();
  }, [data]);
  
  // Format participants for selection
  const participantOptions = React.useMemo(() => {
    return data.map(p => ({
      value: p.id,
      label: `${p.id} (${p.condition})`
    }));
  }, [data]);
  
  // Handle clearing all selections
  const handleClearSelections = () => {
    setSelectedParticipantIds([]);
    setSelectedConditions([]);
    setSelectedUnits([]);
    setCompareToConditionMean(false);
    setCompareToUnitMean(false);
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={selectionMode} onValueChange={(value) => setSelectionMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
        </TabsList>
        
        <TabsContent value="participants" className="space-y-4">
          <div className="space-y-2">
            <Label>Select Participants</Label>
            <MultipleSelect
              options={participantOptions}
              selectedValues={selectedParticipantIds}
              onChange={setSelectedParticipantIds}
              placeholder="Select participants"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="compare-condition"
                checked={compareToConditionMean}
                onCheckedChange={(checked) => {
                  if (typeof checked === 'boolean') {
                    setCompareToConditionMean(checked);
                    if (checked) setCompareToUnitMean(false);
                  }
                }}
              />
              <label
                htmlFor="compare-condition"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Compare to Condition Mean
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="compare-unit"
                checked={compareToUnitMean}
                onCheckedChange={(checked) => {
                  if (typeof checked === 'boolean') {
                    setCompareToUnitMean(checked);
                    if (checked) setCompareToConditionMean(false);
                  }
                }}
              />
              <label
                htmlFor="compare-unit"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Compare to Unit Mean
              </label>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="conditions" className="space-y-4">
          <div className="space-y-2">
            <Label>Select Conditions</Label>
            <MultipleSelect
              options={conditions.map(condition => ({ value: condition, label: condition }))}
              selectedValues={selectedConditions}
              onChange={setSelectedConditions}
              placeholder="Select conditions"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="units" className="space-y-4">
          <div className="space-y-2">
            <Label>Select Units</Label>
            <MultipleSelect
              options={units.map(unit => ({ value: unit, label: unit }))}
              selectedValues={selectedUnits}
              onChange={setSelectedUnits}
              placeholder="Select units"
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Label htmlFor="metric-select">Metric</Label>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {MetricOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearSelections}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Clear Selections
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="show-confidence-bands"
          checked={showConfidenceBands}
          onCheckedChange={(checked) => {
            if (typeof checked === 'boolean') {
              setShowConfidenceBands(checked);
            }
          }}
        />
        <label
          htmlFor="show-confidence-bands"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show 95% Confidence Bands
        </label>
      </div>
    </div>
  );
};

export default MultiParticipantChartControls;
