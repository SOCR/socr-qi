
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MultipleSelect from "@/components/ui/multiple-select";
import { useData } from "@/context/DataContext";
import { Participant } from "@/context/DataContext";

interface MultiParticipantChartControlsProps {
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  filterType: string;
  onFilterTypeChange: (type: string) => void;
  compareToMean: boolean;
  setCompareToMean: (compareToMean: boolean) => void;
  showConfidenceBands: boolean;
  setShowConfidenceBands: (showConfidenceBands: boolean) => void;
  selectedParticipantIds: string[];
  setSelectedParticipantIds: (ids: string[]) => void;
  selectedConditions: string[];
  setSelectedConditions: (conditions: string[]) => void;
  selectedUnits: string[];
  setSelectedUnits: (units: string[]) => void;
}

const MultiParticipantChartControls = ({
  selectedMetric,
  onMetricChange,
  filterType,
  onFilterTypeChange,
  compareToMean,
  setCompareToMean,
  showConfidenceBands,
  setShowConfidenceBands,
  selectedParticipantIds,
  setSelectedParticipantIds,
  selectedConditions,
  setSelectedConditions,
  selectedUnits,
  setSelectedUnits,
}: MultiParticipantChartControlsProps) => {
  const { data } = useData();

  const handleMetricChange = (metric: string) => {
    onMetricChange(metric);
  };

  const handleFilterTypeChange = (type: string) => {
    onFilterTypeChange(type);
  };

  const conditions = Array.from(new Set(data.map((p) => p.condition))).sort();
  const units = Array.from(new Set(data.map((p) => p.unit))).sort();
  const participants = data.map((p) => ({
    id: p.id,
    label: `${p.id} (${p.condition})`,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filter Type */}
        <div className="space-y-2">
          <Label>Comparison Type</Label>
          <Select value={filterType} onValueChange={handleFilterTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select comparison type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="participant">Individual Participants</SelectItem>
              <SelectItem value="condition">By Condition</SelectItem>
              <SelectItem value="unit">By Clinical Unit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metric Selection */}
        <div className="space-y-2">
          <Label>Metric</Label>
          <Select value={selectedMetric} onValueChange={handleMetricChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="systolic">Blood Pressure (Systolic)</SelectItem>
              <SelectItem value="diastolic">Blood Pressure (Diastolic)</SelectItem>
              <SelectItem value="heartRate">Heart Rate</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="oxygenSaturation">Oxygen Saturation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Comparison Options */}
        <div className="space-y-2">
          <Label>Comparison Options</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="compare-to-mean"
              checked={compareToMean}
              onCheckedChange={(checked) => {
                if (typeof checked === 'boolean') {
                  setCompareToMean(checked);
                }
              }}
            />
            <label
              htmlFor="compare-to-mean"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Compare to Mean
            </label>
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
              disabled={!compareToMean}
            />
            <label
              htmlFor="show-confidence-bands"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Confidence Bands
            </label>
          </div>
        </div>

        {/* Time Range */}
        {/* Will be implemented in future iterations */}
      </div>

      {/* Conditional UI based on filter type */}
      <div className="space-y-2">
        {filterType === 'participant' && (
          <div className="space-y-2">
            <Label>Select Participants</Label>
            <MultipleSelect
              options={participants.map((p) => ({
                value: p.id,
                label: p.label
              }))}
              selectedValues={selectedParticipantIds}
              onChange={setSelectedParticipantIds}
              placeholder="Select participants"
            />
          </div>
        )}

        {filterType === 'condition' && (
          <div className="space-y-2">
            <Label>Select Conditions</Label>
            <MultipleSelect
              options={conditions.map((condition) => ({
                value: condition,
                label: condition,
              }))}
              selectedValues={selectedConditions}
              onChange={setSelectedConditions}
              placeholder="Select conditions"
            />
          </div>
        )}

        {filterType === 'unit' && (
          <div className="space-y-2">
            <Label>Select Units</Label>
            <MultipleSelect
              options={units.map((unit) => ({ value: unit, label: unit }))}
              selectedValues={selectedUnits}
              onChange={setSelectedUnits}
              placeholder="Select units"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiParticipantChartControls;
