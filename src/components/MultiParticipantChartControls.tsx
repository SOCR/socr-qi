
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Participant } from "@/context/DataContext";
import { 
  Checkbox 
} from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MultipleSelect from "./ui/multiple-select";

interface MultiParticipantChartControlsProps {
  data: Participant[];
  selectedParticipantIds: string[];
  setSelectedParticipantIds: (ids: string[]) => void;
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
  compareToConditionMean: boolean;
  setCompareToConditionMean: (compare: boolean) => void;
  compareToUnitMean: boolean;
  setCompareToUnitMean: (compare: boolean) => void;
  showConfidenceBands: boolean;
  setShowConfidenceBands: (show: boolean) => void;
  selectedConditions?: string[];
  setSelectedConditions?: (conditions: string[]) => void;
  selectedUnits?: string[];
  setSelectedUnits?: (units: string[]) => void;
}

const MultiParticipantChartControls = ({ 
  data,
  selectedParticipantIds,
  setSelectedParticipantIds,
  selectedMetric,
  setSelectedMetric,
  compareToConditionMean,
  setCompareToConditionMean,
  compareToUnitMean,
  setCompareToUnitMean,
  showConfidenceBands,
  setShowConfidenceBands,
  selectedConditions = [],
  setSelectedConditions = () => {},
  selectedUnits = [],
  setSelectedUnits = () => {}
}: MultiParticipantChartControlsProps) => {
  // Get the unique list of all conditions
  const allConditions = Array.from(new Set(data.map(p => p.condition)));
  
  // Get the unique list of all units
  const allUnits = Array.from(new Set(data.map(p => p.unit)));
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient-select">Select Participants</Label>
          <MultipleSelect
            id="patient-select"
            placeholder="Select participants"
            options={data.map(p => ({
              value: p.id,
              label: `${p.id.substring(0, 6)} - ${p.condition}`
            }))}
            selectedValues={selectedParticipantIds}
            onChange={setSelectedParticipantIds}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="metric-select">Select Metric</Label>
          <Select id="metric-select" value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vitals">Heart Rate</SelectItem>
              <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
              <SelectItem value="oxygenation">Oxygen Saturation</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Conditions to Compare</Label>
          <MultipleSelect
            placeholder="Select conditions"
            options={allConditions.map(condition => ({
              value: condition,
              label: condition
            }))}
            selectedValues={selectedConditions}
            onChange={setSelectedConditions}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Units to Compare</Label>
          <MultipleSelect
            placeholder="Select units"
            options={allUnits.map(unit => ({
              value: unit,
              label: unit
            }))}
            selectedValues={selectedUnits}
            onChange={setSelectedUnits}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="compare-condition" 
            checked={compareToConditionMean}
            onCheckedChange={(checked) => {
              setCompareToConditionMean(checked === true);
              // Uncheck unit mean if this is checked
              if (checked) setCompareToUnitMean(false);
            }}
          />
          <Label htmlFor="compare-condition">Compare to condition mean</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="compare-unit" 
            checked={compareToUnitMean}
            onCheckedChange={(checked) => {
              setCompareToUnitMean(checked === true);
              // Uncheck condition mean if this is checked
              if (checked) setCompareToConditionMean(false);
            }}
          />
          <Label htmlFor="compare-unit">Compare to unit mean</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="confidence-bands" 
            checked={showConfidenceBands}
            onCheckedChange={(checked) => {
              setShowConfidenceBands(checked === true);
            }}
            disabled={!compareToConditionMean && !compareToUnitMean}
          />
          <Label htmlFor="confidence-bands">Show 95% confidence bands</Label>
        </div>
      </div>
    </div>
  );
};

export default MultiParticipantChartControls;
